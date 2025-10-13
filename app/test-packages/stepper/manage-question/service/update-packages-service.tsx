import { api } from "@services/api";
import axios from "axios";
import {
  loadStep1FromStorage,
  saveStep1ToStorage,
} from "../../create-package/service/create-package-service";

export interface UpdateSectionPayload {
  sectionId: number;
  duration_minutes: number;
  question_count: number;
  type?: string; // opsional kalau backend butuh type
}

export const updatePackageService = {
  // ✅ Update satu section (lama)
  async updateSection(
    testId: number,
    payload: UpdateSectionPayload,
    token?: string
  ): Promise<void> {
    try {
      const saved = loadStep1FromStorage();
      if (!saved) {
        throw new Error("Data step 1 tidak ditemukan di localStorage");
      }

      const updatedSections = saved.sections.map((s) =>
        s.id === payload.sectionId
          ? {
              ...s,
              duration_minutes: payload.duration_minutes,
              question_count: payload.question_count,
            }
          : s
      );

      const body = {
        name: saved.name,
        sections: updatedSections,
      };

      await api.put(`/test-package/${testId}`, body, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      saveStep1ToStorage({
        ...saved,
        sections: updatedSections,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Gagal update section"
        );
      }
      throw new Error("Terjadi error tidak dikenal saat update section");
    }
  },

  // ✅ Update banyak section sekaligus (baru)
  async updateAllSections(
    testId: number,
    payloads: UpdateSectionPayload[],
    token?: string
  ): Promise<void> {
    try {
      const saved = loadStep1FromStorage();
      if (!saved) {
        throw new Error("Data step 1 tidak ditemukan di localStorage");
      }

      // gabungkan section lama dengan semua payload baru
      const updatedSections = saved.sections.map((s) => {
        const newData = payloads.find((p) => p.sectionId === s.id);
        return newData
          ? {
              ...s,
              duration_minutes: newData.duration_minutes,
              question_count: newData.question_count,
            }
          : s;
      });

      const body = {
        name: saved.name,
        sections: updatedSections,
      };

      await api.put(`/test-package/${testId}`, body, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      saveStep1ToStorage({
        ...saved,
        sections: updatedSections,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Gagal update semua section"
        );
      }
      throw new Error("Terjadi error tidak dikenal saat update semua section");
    }
  },
};
