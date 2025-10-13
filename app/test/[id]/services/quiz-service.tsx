// src/app/users/[id]/services/quizService.ts
import { api } from "@services/api";
import axios from "axios";

// Bentuk data untuk setiap pertanyaan
export interface Question {
  text: string;
  options: string[];
}

// Backend response types
interface BackendQuestion {
  id: number;
  question_id: number;
  question_type: string;
  question_detail: {
    id: number;
    question_text: string;
    options: Array<{
      id: number;
      option_text: string;
      score?: number;
    }>;
  } | null;
}

interface BackendSection {
  section_id: number;
  section_type: string;
  duration_minutes: number;
  question_count: number;
  questions: BackendQuestion[];
}

interface BackendResponse {
  test: {
    id: number;
    name: string;
    target_position: string;
  };
  candidate: {
    id: number;
    name: string;
    email: string;
  };
  sections?: BackendSection[];
  questions?: BackendQuestion[]; // fallback
  started_at: string;
}

// Implementasi service
const quizService = {
  /**
   * Mengembalikan array pertanyaan dari backend API.
   * @param token Token unik dari candidate test
   * @returns Promise yang resolve dengan daftar Question
   */
  getQuestions: async (token: string): Promise<Question[]> => {
    try {
      console.log("🔍 Fetching questions for token:", token);
      
      const res = await api.get<BackendResponse>(`/candidate-tests/start/${token}`);
      const data = res.data;
      
      console.log("✅ Questions response:", data);
      
      // Ambil questions dari sections atau fallback ke questions langsung
      const allQuestions = data.sections 
        ? data.sections.flatMap(section => section.questions)
        : data.questions || [];
      
      // Map questions dari backend ke format frontend
      const questions: Question[] = allQuestions.map(q => {
        // Gunakan question_detail jika ada, fallback ke data dasar
        const questionText = q.question_detail?.question_text || `Question ${q.question_id}`;
        const options = q.question_detail?.options?.map(opt => opt.option_text) || [];
        
        return {
          text: questionText,
          options: options.length > 0 ? options : ["Option A", "Option B", "Option C", "Option D"]
        };
      });
      
      console.log("📝 Mapped questions:", questions);
      return questions;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Fetch questions error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        
        throw new Error(
          (error.response?.data as { message?: string })?.message ||
          `Gagal mengambil soal: ${error.message}`
        );
      }
      
      console.error("❌ Unknown fetch questions error:", error);
      throw new Error("Terjadi error tidak dikenal saat mengambil soal");
    }
  },
};

export default quizService;
