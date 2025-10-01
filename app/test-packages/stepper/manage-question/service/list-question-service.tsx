import { api } from "@services/api";
import axios from "axios";

/* ================================================================
 * TYPES
 * ================================================================ */
export type QuestionType = "DISC" | "CAAS" | "teliti"; 
// ⚠️ pastikan sama dengan enum di backend! (cek ejaan: "CAAS" atau "CAAAS")

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
}

export interface QuestionResponse {
  id: number; // row id
  question_id: number; // id soal aslinya
  question_type: QuestionType;
  question_detail: QuestionDetailResponse | null;
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
    test_id: number; // ubah ke number biar konsisten dengan service lain
    sections: SectionResponse[];
  };
}

/* ================================================================
 * MAPPER
 * ================================================================ */
function mapQuestion(raw: QuestionResponse): Question {
  return {
    id: String(raw.question_id),
    type: raw.question_type,
    question_text: raw.question_detail?.question_text ?? "",
    category: String(raw.question_detail?.category_id ?? ""),
    mediaUrl: raw.question_detail?.media_path ?? undefined,
    mediaType: raw.question_detail?.media_path ? "image" : undefined, // ganti logika kalau API dukung audio/video
    options: {},
    answer: raw.question_detail?.correct_option_id
      ? String(raw.question_detail.correct_option_id)
      : undefined,
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
  /**
   * GET semua soal dari section (plus durasi & jumlah soal)
   */
  async getSectionQuestions(
    testId: number,
    sectionId: number,
    type?: QuestionType
  ): Promise<SectionQuestionData> {
    try {
      const res = await api.get<TestWithSectionsResponse>(
        `/tests/${testId}/with-sections`
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

  /**
   * ADD soal ke section
   */
  async addQuestion(params: {
    testId: number;
    sectionId: number;
    questionId: number;
    questionType: QuestionType;
    token: string;
  }): Promise<void> {
    try {
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          (error.response?.data as { message?: string })?.message ??
            "Gagal tambah soal"
        );
      }
      throw new Error("Terjadi error tidak dikenal saat tambah soal");
    }
  },

  /**
   * UPDATE soal di section
   */
  async updateQuestion(params: {
    testId: number;
    sectionId: number;
    questionId: number;
    questionType: QuestionType;
    token: string;
  }): Promise<void> {
    try {
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          (error.response?.data as { message?: string })?.message ??
            "Gagal update soal"
        );
      }
      throw new Error("Terjadi error tidak dikenal saat update soal");
    }
  },

  /**
   * DELETE soal dari section
   */
  async deleteQuestion(params: {
    testId: number;
    sectionId: number;
    questionId: number;
    token: string;
  }): Promise<void> {
    try {
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          (error.response?.data as { message?: string })?.message ??
            "Gagal hapus soal"
        );
      }
      throw new Error("Terjadi error tidak dikenal saat hapus soal");
    }
  },
};
