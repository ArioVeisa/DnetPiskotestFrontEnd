import { api } from "@services/api";
import axios from "axios";

/* ================================================================
 * TYPES
 * ================================================================ */
export type QuestionType = "DISC" | "CAAS" | "teliti";

export interface Question {
  id: string; // normalized ke string
  type: QuestionType;
  question_text: string;
  category: string;
  mediaUrl?: string;
  mediaType?: "image" | "audio" | "video";
  options?: Record<string, string>;
  answer?: string;
}

/* -----------------------------
 * Raw API Response Types
 * ----------------------------- */
export interface QuestionDetailResponse {
  id: number;
  question_text: string;
  media_path?: string | null;
  correct_option_id?: number | null;
  category_id?: number | null;
  created_at: string;
  updated_at: string;
  options?: { id: number; option_text: string }[];
}

export interface QuestionResponse {
  id: number;              // row id (join table)
  question_id: number;     // id soal asli
  question_type: QuestionType;
  question_detail: QuestionDetailResponse | null;

  // fallback (DISC/CAAS kadang data langsung di root)
  question_text?: string;
  category_id?: number;
  media_path?: string | null;
  correct_option_id?: number | null;
  options?: { id: number; option_text: string }[];
}

export interface SectionResponse {
  section_id: number;
  section_type: QuestionType;
  duration_minutes: number;
  question_count: number;
  questions: QuestionResponse[];
}

export interface TestWithSectionsResponse {
  data: {
    test_id: number;
    sections: SectionResponse[];
  };
}

/* ================================================================
 * MAPPER
 * ================================================================ */
// Normalize question_type: 'disc' -> 'DISC', 'caas' -> 'CAAS', 'teliti' -> 'teliti'
function normalizeQuestionType(qt: string): QuestionType {
  const lower = qt.toLowerCase();
  if (lower === 'disc') return 'DISC';
  if (lower === 'caas') return 'CAAS';
  return 'teliti';
}

function mapQuestion(raw: QuestionResponse): Question {
  const detail = raw.question_detail;
  const normalizedType = normalizeQuestionType(raw.question_type);

  // Fallback text kalau question_text kosong
  const qText =
    detail?.question_text?.trim() ||
    raw.question_text?.trim() ||
    `(${normalizedType}) Soal #${raw.question_id ?? raw.id}`;

  const category = String(detail?.category_id ?? raw.category_id ?? "");
  const mediaPath = detail?.media_path ?? raw.media_path ?? undefined;
  const answer = detail?.correct_option_id ?? raw.correct_option_id ?? undefined;
  const rawOptions = detail?.options ?? raw.options ?? [];

  return {
    id: String(raw.id), // Gunakan test_question.id untuk delete, bukan question_id
    type: normalizedType, // ✅ normalized type
    question_text: qText, // ✅ selalu ada isi
    category,
    mediaUrl: mediaPath ?? undefined,
    mediaType: mediaPath ? "image" : undefined,
    options: rawOptions.reduce<Record<string, string>>((acc, opt) => {
      acc[String(opt.id)] = opt.option_text;
      return acc;
    }, {}),
    answer: answer ? String(answer) : undefined,
  };
}


/* ================================================================
 * RETURN TYPE untuk getSectionQuestions
 * ================================================================ */
export interface SectionQuestionData {
  questions: Question[];
  duration_minutes: number;
  question_count: number;
}

/* ================================================================
 * SERVICE
 * ================================================================ */
export const listQuestionService = {
  async getSectionQuestions(
    testId: number,
    sectionId: number,
    type?: QuestionType
  ): Promise<SectionQuestionData> {
    try {
      const res = await api.get<TestWithSectionsResponse>(
        `/tests-public/${testId}/with-sections`
      );

      // 🔍 DEBUG: log raw API response
      console.group(`[listQuestionService] getSectionQuestions(testId=${testId}, sectionId=${sectionId}, type=${type})`);
      console.log("Raw sections from API:", res.data.data.sections.map(s => ({
        section_id: s.section_id,
        section_type: s.section_type,
        questions_count: s.questions.length,
        questions_types: s.questions.map(q => q.question_type),
      })));
      console.groupEnd();

      const section = res.data.data.sections.find(
        (s) => s.section_id === sectionId
      );

      console.log(`[listQuestionService] Found section:`, section ? { section_id: section.section_id, section_type: section.section_type, questions_count: section.questions.length } : 'NOT FOUND');

      if (!section) {
        return { questions: [], duration_minutes: 0, question_count: 0 };
      }

      let data = section.questions;
      if (type) {
        const beforeFilter = data.length;
        // ✅ Case-insensitive filter: 'disc' === 'DISC', 'caas' === 'CAAS'
        data = data.filter((q) => q.question_type.toLowerCase() === type.toLowerCase());
        console.log(`[listQuestionService] Filter by question_type='${type}' (case-insensitive): ${beforeFilter} -> ${data.length} questions`);
      }

      return {
        questions: data.map(mapQuestion),
        duration_minutes: section.duration_minutes,
        question_count: section.question_count,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          (error.response?.data as { message?: string })?.message ??
          "Gagal load pertanyaan dari test/section"
        );
      }
      throw new Error("Terjadi error tidak dikenal saat load pertanyaan");
    }
  },

  async addQuestion(params: {
    testId: number;
    sectionId: number;
    questionId: number;
    questionType: QuestionType;
    token: string;
  }): Promise<void> {
    const payload = {
      questions: [
        {
          test_id: params.testId,
          section_id: params.sectionId,
          question_id: params.questionId,
          question_type: params.questionType,
        },
      ],
    };

    await api.post("/manage-questions", payload, {
      headers: { Authorization: `Bearer ${params.token}` },
    });
  },

  async updateQuestion(params: {
    testId: number;
    sectionId: number;
    questionId: number;
    questionType: QuestionType;
    token: string;
  }): Promise<void> {
    const payload = {
      questions: [
        {
          test_id: params.testId,
          section_id: params.sectionId,
          question_id: params.questionId,
          question_type: params.questionType,
        },
      ],
    };

    await api.put("/manage-questions", payload, {
      headers: { Authorization: `Bearer ${params.token}` },
    });
  },

  async deleteQuestion(params: {
    testId: number;
    sectionId: number;
    questionId: number;
    token: string;
  }): Promise<void> {
    // Endpoint yang benar: DELETE /manage-questions/{section_id}/{id}
    // questionId adalah test_question.id (id dari tabel test_questions)
    await api.delete(`/manage-questions/${params.sectionId}/${params.questionId}`, {
      headers: { Authorization: `Bearer ${params.token}` },
    });
  },
};
