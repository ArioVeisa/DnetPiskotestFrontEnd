// /app/(tes-session)/add-packages/services/add-package-service.ts
import axios from "axios";
import { api } from "@services/api";

export interface TestPackage {
  id: number;
  name: string;
  duration: string;
  questions: number;
  target: string;
}

interface Section {
  id: number;
  test_id: number;
  section_type: string;
  duration_minutes: number;
  question_count: number;
  sequence: number;
  created_at: string;
  updated_at: string;
}

interface TestPackageResponse {
  id: number;
  name: string;
  target_position: string;
  icon_path: string | null;
  started_date: string | null;
  created_at: string;
  updated_at: string;
  sections: Section[];
}

interface ApiResponse {
  data: TestPackageResponse[];
}

const LOCAL_KEY = "selectedPackageId";

export const packageService = {
  async fetchAll(): Promise<TestPackage[]> {
    try {
      const res = await api.get<ApiResponse>("/test-package"); // endpoint backend
      const items = res.data.data;

      return items.map((item) => {
        const totalQuestions = item.sections.reduce(
          (sum, sec) => sum + sec.question_count,
          0
        );

        const totalDuration = item.sections.reduce(
          (sum, sec) => sum + sec.duration_minutes,
          0
        );

        return {
          id: item.id, // jangan di-convert ke string
          name: item.name,
          duration: `${totalDuration} menit`,
          questions: totalQuestions,
          target: item.target_position,
        };
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data?.message || "Gagal mengambil packages";
      }
      throw "Terjadi error tidak dikenal";
    }
  },

  // ✅ simpan id package ke localStorage
  saveSelected(id: number) {
    localStorage.setItem(LOCAL_KEY, String(id));
  },

  // ✅ ambil id package dari localStorage
  getSelected(): number | null {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? Number(raw) : null;
  },

  // optional: hapus
  clearSelected() {
    localStorage.removeItem(LOCAL_KEY);
  },
};
