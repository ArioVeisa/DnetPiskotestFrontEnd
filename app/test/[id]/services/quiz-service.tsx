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

// Types for submitting answers
export interface SubmitAnswer {
  section_id: number;
  question_id: number;
  most_option_id?: number; // For DISC
  least_option_id?: number; // For DISC
  selected_option_id?: number; // For CAAS and Teliti
}

export interface SubmitTestResponse {
  success: boolean;
  message: string;
  completion_time?: string;
  confirmation_code?: string;
  candidate_test_id?: number;
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
      // console.log("🔍 Fetching questions for token:", token); // Debug logging removed
      
      const res = await api.get<BackendResponse>(`/candidate-tests/start/${token}`);
      const data = res.data;
      
      // console.log("✅ Questions response:", data); // Debug logging removed
      
      // Ambil questions dari sections atau fallback ke questions langsung
      const allQuestions = data.sections 
        ? data.sections.flatMap(section => section.questions)
        : data.questions || [];
      
      // Map questions dari backend ke format frontend
      const questions: Question[] = allQuestions.map(q => {
        // Gunakan question_detail jika ada, fallback ke data dasar
        const questionText = q.question_detail?.question_text || `Question ${q.question_id}`;
        const questionType = q.question_type || 'CAAS';
        
        // Handle DISC format khusus
        if (questionType === 'DISC' && q.question_detail?.options) {
          // console.log("🔍 DISC question detail:", q.question_detail); // Debug logging removed
          // console.log("🔍 DISC options:", q.question_detail.options); // Debug logging removed
          
          const discOptions = q.question_detail.options.map(opt => ({
            id: opt.id?.toString() || Math.random().toString(),
            text: opt.option_text,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dimensionMost: (opt as any).dimension_most || '*',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dimensionLeast: (opt as any).dimension_least || '*'
          }));
          
          // console.log("🔍 Mapped DISC options:", discOptions); // Debug logging removed
          
          return {
            text: questionText,
            options: discOptions.map(opt => opt.text),
            questionType: 'DISC',
            discOptions: discOptions
          };
        }
        
        // Format biasa untuk CAAS/teliti
        const options = q.question_detail?.options?.map(opt => opt.option_text) || [];
        
        return {
          text: questionText,
          options: options.length > 0 ? options : ["Option A", "Option B", "Option C", "Option D"],
          questionType: questionType
        };
      });
      
      // console.log("📝 Mapped questions:", questions); // Debug logging removed
      return questions;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // console.error("❌ Fetch questions error:", {
        //   status: error.response?.status,
        //   data: error.response?.data,
        //   message: error.message,
        // });
        
        throw new Error(
          (error.response?.data as { message?: string })?.message ||
          `Gagal mengambil soal: ${error.message}`
        );
      }
      
      // console.error("❌ Unknown fetch questions error:", error); // Debug logging removed
      throw new Error("Terjadi error tidak dikenal saat mengambil soal");
    }
  },

  /**
   * Submit test answers ke backend
   * @param token Token unik dari candidate test
   * @param answers Array jawaban yang akan disubmit
   * @returns Promise yang resolve dengan response submit
   */
  submitTest: async (token: string, answers: SubmitAnswer[]): Promise<SubmitTestResponse> => {
    try {
      // console.log("🔍 Submitting test answers for token:", token); // Debug logging removed
      // console.log("🔍 Answers to submit:", answers); // Debug logging removed
      
      const res = await api.post<SubmitTestResponse>(`/candidate-tests/submit/${token}`, {
        answers: answers
      });
      
      // console.log("✅ Submit test response:", res.data); // Debug logging removed
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as { message?: string; success?: boolean } | undefined;
        const errorMessage = errorData?.message || '';
        const status = error.response?.status;
        
        // Handle test already submitted - this is success, not an error
        if (status === 400 && (errorMessage.includes("sudah disubmit") || errorMessage.includes("already submitted"))) {
          // Return success response for already submitted tests
          return {
            success: true,
            message: 'Test already completed',
            completion_time: new Date().toISOString(),
            confirmation_code: '',
            candidate_test_id: 0
          };
        }
        
        // Handle validation errors
        if (status === 422) {
          throw new Error(errorMessage || 'Validation error. Please check your answers.');
        }
        
        // Handle token expired or invalid
        if (status === 404) {
          throw new Error('Test link is invalid or has expired.');
        }
        
        // Handle other errors
        throw new Error(errorMessage || "Failed to submit test. Please try again.");
      }
      
      // Handle network errors or other exceptions
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error("Terjadi error tidak dikenal saat submit test");
    }
  },
};

export default quizService;
