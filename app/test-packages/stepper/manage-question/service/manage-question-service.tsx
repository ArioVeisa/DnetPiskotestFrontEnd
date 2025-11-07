// /app/test-packages/stepper/service/manage-question-service.ts
import { api } from "@services/api";
import axios from "axios";

/* ============================
   Types
============================ */
export type QuestionType = "DISC" | "CAAS" | "teliti";

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  category: string;
  mediaUrl?: string;
  mediaType?: "image" | "audio" | "video";
  options?: Record<string, string>;
  answer?: string;
}

/* ---------- Response dari BE ---------- */
export interface QuestionDetailResponse {
  id: number;
  text: string;
  category: string;
  options?: Record<string, string>;
  answer?: string;
  mediaUrl?: string;
  mediaType?: "image" | "audio" | "video";
}

export interface TestResponse {
  id: number;
  name: string;
}

export interface QuestionResponse {
  id: number;
  section_id: number;
  question_id: number;
  question_type: QuestionType;
  created_at: string;
  updated_at: string;
  question_detail: QuestionDetailResponse | null;
  test: TestResponse;
}

/* ============================
   Mapper
============================ */
function mapQuestion(raw: QuestionResponse): Question {
  return {
    id: String(raw.question_id),
    type: raw.question_type,
    text: raw.question_detail?.text || "",
    category: raw.question_detail?.category || "",
    mediaUrl: raw.question_detail?.mediaUrl,
    mediaType: raw.question_detail?.mediaType,
    options: raw.question_detail?.options || {},
    answer: raw.question_detail?.answer,
  };
}

/* ============================
   API Service
============================ */
export const manageQuestionService = {
  // GET semua soal di test (filter by type optional)
  async getQuestions(
    testId: number,
    type?: QuestionType
  ): Promise<Question[]> {
    try {
      const res = await api.get<QuestionResponse[] | QuestionResponse>(
        `/manage-questions/`,
        { params: { test_id: testId } }
      );

      const data: QuestionResponse[] = Array.isArray(res.data)
        ? res.data
        : [res.data];

      const filtered = type
        ? data.filter((q) => q.question_type === type)
        : data;

      return filtered.map(mapQuestion);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Gagal load pertanyaan"
        );
      }
      throw new Error("Terjadi error tidak dikenal saat load pertanyaan");
    }
  },

  // GET soal yang udah ditambahkan ke section
  async getSectionQuestions(
    testId: number,
    sectionId: number,
    type: QuestionType,
    token: string
  ): Promise<Question[]> {
    try {
      const res = await api.get<QuestionResponse[] | QuestionResponse>(
        `/manage-questions/`,
        {
          params: { test_id: testId, section_id: sectionId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data: QuestionResponse[] = Array.isArray(res.data)
        ? res.data
        : [res.data];

      const filtered = data.filter((q) => q.question_type === type);

      return filtered.map(mapQuestion);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Gagal load pertanyaan section"
        );
      }
      throw new Error(
        "Terjadi error tidak dikenal saat load pertanyaan section"
      );
    }
  },

  // ADD question ke section
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
            question_id: params.questionId,
            question_type: params.questionType,
            section_id: params.sectionId,
          },
        ],
      };

      // Use debug endpoint without auth for testing
      await api.post("/debug/manage-questions", payload);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Gagal tambah soal");
      }
      throw new Error("Terjadi error tidak dikenal saat tambah soal");
    }
  },

  // ADD BULK questions ke section - BARU!
  async addBulkQuestions(params: {
    testId: number;
    sectionId: number;
    questions: Array<{
      questionId: number;
      questionType: QuestionType;
    }>;
    token: string;
  }): Promise<void> {
    try {
      const payload = {
        questions: params.questions.map(q => ({
          test_id: params.testId,
          question_id: q.questionId,
          question_type: q.questionType,
          section_id: params.sectionId,
        })),
      };

      console.log("🚀 Bulk adding questions:", payload);

      // Use debug endpoint without auth for testing
      await api.post("/debug/manage-questions", payload);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Gagal tambah soal secara bulk");
      }
      throw new Error("Terjadi error tidak dikenal saat tambah soal secara bulk");
    }
  },

  // UPDATE question di section
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
            question_id: params.questionId,
            question_type: params.questionType,
            section_id: params.sectionId,
          },
        ],
      };

      await api.put("/manage-questions/", payload, {
        headers: { Authorization: `Bearer ${params.token}` },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Gagal update soal");
      }
      throw new Error("Terjadi error tidak dikenal saat update soal");
    }
  },

  // DELETE question dari section
  async deleteQuestion(params: {
    testId: number;
    sectionId: number;
    questionId: number;
    token: string;
  }): Promise<void> {
    try {
      // Endpoint yang benar: DELETE /manage-questions/{section_id}/{id}
      // questionId adalah test_question.id (id dari tabel test_questions)
      await api.delete(`/manage-questions/${params.sectionId}/${params.questionId}`, {
        headers: { Authorization: `Bearer ${params.token}` },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Gagal hapus soal");
      }
      throw new Error("Terjadi error tidak dikenal saat hapus soal");
    }
  },
};
