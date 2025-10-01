// /app/test-packages/stepper/service/show-question-service.ts
import { api } from "@services/api";
import axios from "axios";

/* ============================
   Types
============================ */
import type { QuestionType } from "./manage-question-service";
export type ShowQuestionType = QuestionType;

export interface ShowQuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  created_at: string;
  updated_at: string;
}

export interface ShowQuestion {
  id: number;
  question_text: string;
  media_path?: string | null;
  is_active: number;
  correct_option_id: number;
  category_id: number;
  created_at: string;
  updated_at: string;
  options: ShowQuestionOption[];
}

/* ============================
   API Service
============================ */
export const showQuestionService = {
  // GET bank soal by type
  async getByType(
    type: ShowQuestionType,
    token: string
  ): Promise<ShowQuestion[]> {
    try {
      // endpoint mengikuti pola: /api/{type-lowercase}-questions/
      const endpoint = `/${type.toLowerCase()}-questions/`;

      console.log("[showQuestionService] Fetching questions", {
        type,
        endpoint,
        token: token ? "✅ ada token" : "❌ token kosong",
      });

      const res = await api.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("[showQuestionService] Response data:", res.data);

      // handle 2 kemungkinan bentuk response: { data: [] } atau langsung []
      if (Array.isArray(res.data)) {
        return res.data as ShowQuestion[];
      }
      return (res.data?.data as ShowQuestion[]) || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("[showQuestionService] Axios error:", {
          url: error.config?.url,
          status: error.response?.status,
          response: error.response?.data,
        });
        const message =
          error.response?.data?.message ||
          `Gagal load soal (status ${error.response?.status})`;
        throw new Error(message);
      }

      console.error("[showQuestionService] Unknown error:", error);
      throw new Error("Terjadi error tidak dikenal saat load soal");
    }
  },
};