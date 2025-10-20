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
function mapQuestion(raw: QuestionResponse): Question {
  const detail = raw.question_detail;

  // Fallback text kalau question_text kosong
  const qText =
    detail?.question_text?.trim() ||
    raw.question_text?.trim() ||
    `(${raw.question_type}) Soal #${raw.question_id ?? raw.id}`;

  const category = String(detail?.category_id ?? raw.category_id ?? "");
  const mediaPath = detail?.media_path ?? raw.media_path ?? undefined;
  const answer = detail?.correct_option_id ?? raw.correct_option_id ?? undefined;
  const rawOptions = detail?.options ?? raw.options ?? [];

  return {
    id: String(raw.question_id ?? raw.id),
    type: raw.question_type,
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

      const section = res.data.data.sections.find(
        (s) => s.section_id === sectionId
      );

      if (!section) {
        return { questions: [], duration_minutes: 0, question_count: 0 };
      }

      let data = section.questions;
      if (type) {
        data = data.filter((q) => q.question_type === type);
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
    const payload = {
      questions: [
        {
          test_id: params.testId,
          section_id: params.sectionId,
          question_id: params.questionId,
        },
      ],
    };

    await api.delete("/manage-questions", {
      data: payload,
      headers: { Authorization: `Bearer ${params.token}` },
    });
  },
};
