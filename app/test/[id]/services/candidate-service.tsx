// src/app/users/[id]/services/candidate-service.ts
import axios from "axios";
import { api } from "@services/api";

/* ==============================
   TYPE DEFINITIONS
============================== */

/** Detail setiap opsi jawaban */
export interface QuestionOption {
  id: number;
  option_text: string;
  score?: number;
  dimension_most?: string; // Untuk DISC
  dimension_least?: string; // Untuk DISC
}

/** Detail pertanyaan dari backend */
export interface BackendQuestionDetail {
  id: number;
  question_text: string;
  options: QuestionOption[];
}

/** Struktur pertanyaan di backend */
export interface BackendQuestion {
  id: number;
  question_id: number;
  question_type: string;
  question_detail: BackendQuestionDetail | null;
}

/** Struktur section (bagian dalam test) */
export interface TestSection {
  section_id: number;
  section_type: string;
  duration_minutes: number;
  question_count: number;
  questions?: BackendQuestion[]; // Legacy field for backward compatibility
  test_questions?: BackendQuestion[]; // New field from backend response
}

/** Struktur test keseluruhan */
export interface TestInfo {
  id: string;
  name: string;
  questionCount: number;
  duration: number;
  sections?: TestSection[];
}

/** Struktur kandidat */
export interface Candidate {
  nik: string;
  name: string;
  email: string;
  position: string;
  phone: string;
  status: string;
  tests: TestInfo[];
  startDate?: string; // Session start date/time
  endDate?: string;   // Session end date/time
}

/* ==============================
   BACKEND RESPONSE TYPES
============================== */

interface BackendTest {
  id: string;
  name: string;
  icon_path?: string | null;
  started_date: string;
  duration_minutes?: number;
  start_date?: string; // Session start date/time
  end_date?: string;   // Session end date/time
}

interface BackendSection {
  id: number;
  section_type: string;
  duration_minutes: number;
  question_count: number;
  test_questions: BackendQuestion[];
}

interface BackendCandidate {
  id: number;
  nik: string;
  name: string;
  email: string;
  phone_number: string;
  position: string;
  status?: string;
}

interface CandidateResponse {
  candidate: BackendCandidate;
  test?: BackendTest;
  sections?: BackendSection[];
  questions?: BackendQuestion[];
  started_at?: string;
  start_date?: string; // Session start date/time from test distribution
  end_date?: string;   // Session end date/time from test distribution
}

/* ==============================
   SERVICE IMPLEMENTATION
============================== */

export const candidateService = {
  /**
   * Ambil kandidat & detail test berdasarkan token unik
   */
  async fetchCandidateByToken(token: string): Promise<Candidate | null> {
    const url = `/candidate-tests/start/${token}`;

    try {
      // console.log("🔍 Fetch candidate URL:", api.defaults.baseURL + url); // Debug logging removed
      const res = await api.get<CandidateResponse>(url);
      const data = res.data;

      // console.log("✅ Candidate response:", data); // Debug logging removed

      const tests: TestInfo[] = data.test
        ? [
            {
              id: data.test.id,
              name: data.test.name,
              questionCount:
                data.sections?.reduce(
                  (total, section) => total + section.question_count,
                  0
                ) ?? data.questions?.length ?? 0,
              duration:
                data.sections?.reduce(
                  (total, section) => total + section.duration_minutes,
                  0
                ) ?? data.test.duration_minutes ?? 0,
              sections:
                data.sections?.map((section) => ({
                  section_id: section.id,
                  section_type: section.section_type,
                  duration_minutes: section.duration_minutes,
                  question_count: section.question_count,
                  questions: section.test_questions, // Legacy field for backward compatibility
                  test_questions: section.test_questions, // New field from backend response
                })) ?? [],
            },
          ]
        : [];

      const candidate: Candidate = {
        nik: data.candidate.nik,
        name: data.candidate.name,
        email: data.candidate.email,
        position: data.candidate.position,
        phone: data.candidate.phone_number,
        status: data.candidate.status ?? "pending",
        tests,
        startDate: data.start_date || data.test?.start_date,
        endDate: data.end_date || data.test?.end_date,
      };

      return candidate;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle test session time validation errors from backend
        if (error.response?.status === 403) {
          const errorData = error.response.data;
          
          // Handle session time validation errors
          if (errorData?.error === 'TEST_NOT_STARTED' || errorData?.error === 'TEST_SESSION_ENDED') {
            // Throw error with start_date and end_date for frontend validation
            throw new Error(`SESSION_TIME_ERROR:${errorData.start_date || ''}:${errorData.end_date || ''}:${errorData.message || 'Test session time validation failed'}`);
          }
          
          // Handle test already completed
          if (errorData?.status === "completed" || error.response?.status === 403) {
            // console.log("🔍 Test already completed, throwing TEST_COMPLETED error"); // Debug logging removed
            const completedAt = errorData?.completed_at || new Date().toISOString();
            throw new Error(`TEST_COMPLETED:${completedAt}`);
          }
        }

        // Log other errors (silenced in production)
        // console.error("❌ Fetch candidate error:", {
        //   status: error.response?.status,
        //   data: error.response?.data,
        //   message: error.message,
        // });

        throw new Error(
          (error.response?.data as { message?: string })?.message ||
            `Gagal mengambil data kandidat dari token: ${token}`
        );
      }

      // console.error("❌ Unknown fetch candidate error:", error); // Debug logging removed
      throw new Error("Terjadi error tidak dikenal saat fetch candidate");
    }
  },

  /**
   * Validasi NIK kandidat (input user vs data dari backend)
   */
  validateNik(inputNik: string, candidate: Candidate | null): boolean {
    if (!candidate) return false;
    return candidate.nik === inputNik;
  },
};
