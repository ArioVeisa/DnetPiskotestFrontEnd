// src/app/users/[id]/services/candidate-service.ts
import axios from "axios";
import { api } from "@services/api";

// ----- Types -----
export interface TestInfo {
  id: string;
  name: string;
  questionCount: number;
  duration: number;
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
  target_position: string;
  icon_path?: string | null;
  started_date: string;
  duration_minutes?: number; // optional, tergantung BE
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
  questions?: BackendQuestion[]; // tidak pakai any
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
                questionCount: data.questions?.length ?? 0,
                duration: data.test.duration_minutes ?? 0,
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
