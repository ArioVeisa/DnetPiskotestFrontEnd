import { api } from "@services/api";
import axios from "axios";

// =======================
// Interfaces
// =======================

export interface Candidate {
  id: number;
  name: string;
  email: string;
  position: string;
  department?: string;
}

export interface TestInfo {
  id: number;
  name: string;
  target_position: string;
  icon_path: string | null;
  started_date: string;
  access_type: string;
}

export interface CandidateTest {
  id: number;
  candidate_id: number;
  test_id: number;
  unique_token: string;
  started_at: string | null;
  completed_at: string | null;
  score: number | null;
  status: string;
  candidate: Candidate;
  test: TestInfo;
  created_at: string;
  updated_at: string;
}

export interface Result {
  candidateId: string;
  name: string;
  email: string;
  position: string;
  types: string[];
  period: string;
  status: "Completed" | "Ongoing";
}

// =======================
// Service Implementation
// =======================

export const resultsService = {
  /**
   * Ambil semua hasil tes kandidat (hanya yang completed)
   */
  async getAll(): Promise<Result[]> {
    const token = localStorage.getItem("token");

    try {
      const res = await api.get<{ success: boolean; data: CandidateTest[] }>(
        "/candidate-tests",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data.data || [];

      // 🔥 Filter hanya yang sudah selesai (status === 'completed')
      const completedOnly = data.filter(
        (item) => item.status?.toLowerCase() === "completed"
      );

      return completedOnly.map((item) => ({
        candidateId: item.candidate?.id?.toString() || "-",
        name: item.candidate?.name || "-",
        email: item.candidate?.email || "-",
        position: item.candidate?.position || "-",
        types: [item.test?.name || "Unknown Test"],
        period: new Date(item.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: "Completed", // ✅ Pasti completed
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        let message = "Gagal mengambil data hasil kandidat.";

        if (typeof data === "string") message = data;
        else if (data?.message) message = data.message;
        else if (data?.errors) {
          const firstKey = Object.keys(data.errors)[0];
          message = data.errors[firstKey][0];
        }

        throw message;
      }

      throw "Terjadi kesalahan tak terduga saat mengambil hasil kandidat.";
    }
  },

  /**
   * Download hasil tes (PDF)
   */
  async downloadResult(candidateTestId: string): Promise<void> {
    const token = localStorage.getItem("token");

    try {
      const res = await api.get(
        `/candidate-tests/${candidateTestId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `candidate_result_${candidateTestId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        let message = "Gagal mengunduh hasil kandidat.";

        if (typeof data === "string") message = data;
        else if (data?.message) message = data.message;

        throw message;
      }

      throw "Terjadi kesalahan saat mengunduh hasil kandidat.";
    }
  },
};
