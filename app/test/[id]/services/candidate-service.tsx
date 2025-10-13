// src/app/users/[id]/services/candidate-service.ts
import axios from "axios";
import { api } from "@services/api";

// ----- Types -----
export interface TestInfo {
  id: string;
  name: string;
  questionCount: number;
  duration: number;
  sections?: TestSection[];
}

export interface TestSection {
  section_id: number;
  section_type: string;
  duration_minutes: number;
  question_count: number;
  questions: any[];
}

export interface Candidate {
  nik: string;
  name: string;
  email: string;
  position: string;
  phone: string;
  status: string;
  tests: TestInfo[];
}

// --- Backend Response Types ---
interface BackendTest {
  id: string;
  name: string;
  icon_path?: string | null;
  started_date: string;
  duration_minutes?: number; // optional, tergantung BE
}

interface BackendSection {
  section_id: number;
  section_type: string;
  duration_minutes: number;
  question_count: number;
  questions: any[];
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

interface BackendQuestion {
  id: number;
  text: string;
  // tambahin field lain sesuai response BE kalau ada
}

interface CandidateResponse {
  candidate: BackendCandidate;
  test?: BackendTest; // singular, sesuai response BE
  sections?: BackendSection[]; // sections dengan questions
  questions?: BackendQuestion[]; // fallback untuk kompatibilitas
  started_at?: string;
}

// ----- Service Object -----
export const candidateService = {
  /**
   * Ambil kandidat & test detail dari token (BE generate link email).
   */
  async fetchCandidateByToken(token: string): Promise<Candidate | null> {
    const url = `/candidate-tests/start/${token}`;
    try {
      console.log("🔍 Fetch candidate URL:", api.defaults.baseURL + url);

      const res = await api.get<CandidateResponse>(url);
      const data = res.data;

      console.log("✅ Candidate response:", data);

      const candidate: Candidate = {
        nik: data.candidate.nik,
        name: data.candidate.name,
        email: data.candidate.email,
        position: data.candidate.position,
        phone: data.candidate.phone_number,
        status: data.candidate.status ?? "pending",
        tests: data.test
          ? [
              {
                id: data.test.id,
                name: data.test.name,
                questionCount: data.sections?.reduce((total, section) => total + section.question_count, 0) ?? data.questions?.length ?? 0,
                duration: data.sections?.reduce((total, section) => total + section.duration_minutes, 0) ?? data.test.duration_minutes ?? 0,
                sections: data.sections?.map(section => ({
                  section_id: section.section_id,
                  section_type: section.section_type,
                  duration_minutes: section.duration_minutes,
                  question_count: section.question_count,
                  questions: section.questions,
                })) ?? [],
              },
            ]
          : [],
      };

      return candidate;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Fetch candidate error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        // Handle test already completed
        if (error.response?.status === 403 && error.response?.data?.status === 'completed') {
          throw new Error(`TEST_COMPLETED:${error.response.data.completed_at}`);
        }

        throw (
          (error.response?.data as { message?: string })?.message ||
          `Gagal mengambil data kandidat dari token: ${token}`
        );
      }

      console.error("❌ Unknown fetch candidate error:", error);
      throw "Terjadi error tidak dikenal saat fetch candidate";
    }
  },

  /**
   * Validasi NIK kandidat (input user vs data dari backend).
   */
  validateNik(inputNik: string, candidate: Candidate | null): boolean {
    if (!candidate) return false;
    return candidate.nik === inputNik;
  },
};
