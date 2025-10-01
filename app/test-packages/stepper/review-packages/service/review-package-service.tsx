import { api } from "@services/api";
import axios from "axios";

/* ======================================================================
 * TYPES
 * ====================================================================== */
export interface Section {
  id: number; // konsisten pakai `id` dari backend
  section_type: string;
  duration_minutes: number;
  question_count: number;
  sequence: number;
}

export interface TestPackage {
  id: number;
  name: string;
  target_position: string;
  icon_path: string;
  sections: Section[];
}

export interface SectionSequenceUpdate {
  section_id: number;
  sequence: number;
}

export interface UpdateTestPackagePayload {
  sections: SectionSequenceUpdate[];
}

/* ======================================================================
 * HELPERS
 * ====================================================================== */
function normalizePackage(raw: unknown): TestPackage {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Format paket tidak valid (bukan object)");
  }

  const obj = raw as Record<string, unknown>;
  const sectionsCandidate = (obj["sections"] as unknown) ?? [];

  const sections: Section[] = Array.isArray(sectionsCandidate)
    ? sectionsCandidate.map((s, idx) => {
        const sec = s as Record<string, unknown>;
        return {
          id: Number(sec["id"] ?? sec["section_id"] ?? idx),
          section_type: String(sec["section_type"] ?? ""),
          duration_minutes: Number(sec["duration_minutes"] ?? 0),
          question_count: Number(sec["question_count"] ?? 0),
          sequence: Number(sec["sequence"] ?? idx + 1),
        };
      })
    : [];

  return {
    id: Number(obj["id"] ?? 0),
    name: String(obj["name"] ?? ""),
    target_position: String(obj["target_position"] ?? ""),
    icon_path: String(obj["icon_path"] ?? ""),
    sections,
  };
}

/* ======================================================================
 * SERVICE
 * ====================================================================== */
export const reviewPackageService = {
  /**
   * Ambil paket test beserta sections
   */
  async getPackage(testId: number): Promise<TestPackage> {
    try {
      const res = await api.get(`/test-package/${testId}`);
      const raw = (res.data as { data?: unknown }) ?? {};
      const pkg = raw.data ?? raw;

      return normalizePackage(pkg);
    } catch (error) {
      console.error("❌ [getPackage] error:", error);

      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Gagal mengambil data paket"
        );
      }
      throw new Error("Terjadi error tidak dikenal saat ambil paket");
    }
  },

  /**
   * Update urutan sections (sequence).
   * Ambil full data dulu → patch sequence → kirim ulang payload lengkap.
   */
  async updatePackage(
    testId: number,
    payload: UpdateTestPackagePayload,
    token?: string
  ): Promise<void> {
    try {
      // 1️⃣ ambil data full dari backend
      const pkg = await reviewPackageService.getPackage(testId);

      // 2️⃣ update sequence sesuai payload
      const updatedSections = pkg.sections.map((s) => {
        const update = payload.sections.find((p) => p.section_id === s.id);
        return update ? { ...s, sequence: update.sequence } : s;
      });

      // 3️⃣ build body full sesuai backend
      const body = {
        name: pkg.name,
        target_position: pkg.target_position,
        sections: updatedSections.map((s) => ({
          section_type: s.section_type,
          duration_minutes: s.duration_minutes,
          question_count: s.question_count,
          sequence: s.sequence,
        })),
      };

      console.log("📡 [updatePackage] body:", JSON.stringify(body, null, 2));

      // 4️⃣ kirim PUT
      await api.put(`/test-package/${testId}`, body, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      console.log("✅ [updatePackage] success");
    } catch (error) {
      console.error("❌ [updatePackage] error:", error);

      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Gagal update urutan paket tes"
        );
      }
      throw new Error("Terjadi error tidak dikenal saat update paket");
    }
  },
};
