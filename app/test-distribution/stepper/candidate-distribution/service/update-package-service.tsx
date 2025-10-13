import axios from "axios";
import { api } from "@services/api";

export interface TestSection {
  id: number;
  test_id: number;
  section_type: string;
  duration_minutes: number;
  question_count: number;
  sequence: number;
}

export interface TestPackage {
  id: number;
  name: string;
  icon_path?: string | null;
  started_date?: string | null; // ISO date (YYYY-MM-DD)
  ended_date?: string | null;   // ISO date (YYYY-MM-DD)
  created_at: string;
  updated_at: string;
  sections?: TestSection[];
  access_type?: string;
}

export interface UpdateTestPackagePayload {
  name: string;
  started_date: string;
  ended_date?: string;
  sections: TestSection[];
  access_type?: string;
  token: string;
}

export const testPackageService = {
  async fetchAll(): Promise<TestPackage[]> {
    try {
      console.log("[testPackageService.fetchAll] GET /test-package");
      const res = await api.get("/test-package");
      console.log("[testPackageService.fetchAll] response:", res.data);
      return res.data.data ?? res.data;
    } catch (error) {
      console.error("[testPackageService.fetchAll] error:", error);
      if (axios.isAxiosError(error)) {
        throw error.response?.data?.message || "Gagal mengambil test packages";
      }
      throw new Error("Terjadi error tidak dikenal");
    }
  },

  async fetchById(id: number): Promise<TestPackage> {
    if (!id) throw new Error("❌ fetchById dipanggil tanpa id");

    try {
      console.log("[testPackageService.fetchById] id:", id);
      const res = await api.get(`/test-package/${id}`);
      console.log("[testPackageService.fetchById] response:", res.data);
      return res.data.data ?? res.data;
    } catch (error) {
      console.error("[testPackageService.fetchById] error:", error);
      if (axios.isAxiosError(error)) {
        throw error.response?.data?.message || "Gagal mengambil detail package";
      }
      throw new Error("Terjadi error tidak dikenal");
    }
  },

  async update(id: number, payload: UpdateTestPackagePayload): Promise<TestPackage> {
    if (!id) throw new Error("❌ update dipanggil tanpa id");

    try {
      console.log("[testPackageService.update] PUT /test-package/" + id, payload);
      const res = await api.put(`/test-package/${id}`, payload);
      console.log("[testPackageService.update] response:", res.data);
      return res.data.data ?? res.data;
    } catch (error) {
      console.error("[testPackageService.update] error:", error);
      if (axios.isAxiosError(error)) {
        throw error.response?.data?.message || "Gagal update package";
      }
      throw new Error("Terjadi error tidak dikenal");
    }
  },

  async updateStartDate(id: number, started_date: string): Promise<TestPackage> {
    if (!id) throw new Error("❌ updateStartDate dipanggil tanpa id");

    const token = localStorage.getItem("token");
    if (!token) throw new Error("❌ Token tidak ditemukan di localStorage");

    const current = await this.fetchById(id);

    const payload: UpdateTestPackagePayload = {
      name: current.name,
      started_date,
      ended_date: current.ended_date ?? undefined,
      sections: current.sections ?? [],
      access_type: current.access_type ?? "Public",
      token,
    };

    console.log("[testPackageService.updateStartDate] payload:", payload);
    return this.update(id, payload);
  },
};
