import { api } from "@services/api";
import axios from "axios";

/* =================================================================
   🧩 INTERFACES
================================================================= */

// Payload dari FE → dikirim ke API saat step 1 (create)
export interface CreateTestStep1Payload {
  icon_path: string | null;
  name: string;
  types: { type: string; sequence: number }[];
}

// Struktur section dari API
export interface SectionResponse {
  id: number;
  section_type: string;
  duration_minutes: number;
  question_count: number;
  sequence: number;
}

// Struktur data test package dari API
interface TestPackageResponse {
  id: number;
  name: string;
  icon_path?: string | null;
  sections: SectionResponse[];
}

// Struktur response API
interface ApiResponse<T> {
  data: T;
  status: string;
  message: string;
}

// Model untuk FE
export interface Test {
  id: string;
  name: string;
  icon_path?: string | null;
  types: string[];
  questions: number;
  duration: string;
}

// LocalStorage helper
export interface Step1StorageData {
  id: number;
  name: string;
  icon_path?: string | null;
  sections: SectionResponse[];
}

/* =================================================================
   💾 LOCAL STORAGE HELPERS
================================================================= */

const STORAGE_KEY = "createTestStep1";

export function saveStep1ToStorage(payload: Step1StorageData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadStep1FromStorage(): Step1StorageData | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Step1StorageData) : null;
}

export function clearStep1Storage() {
  localStorage.removeItem(STORAGE_KEY);
}

/* =================================================================
   🗺️ TYPE MAPPING
================================================================= */

const sectionTypeMapping: Record<string, string> = {
  DISC: "DISC",
  CAAS: "CAAS",
  "fast accuracy": "teliti",
  teliti: "teliti",
};

/* =================================================================
   ✨ UPDATE PAYLOAD TYPES
================================================================= */

export interface UpdateTestMetadataPayload {
  name: string;
  icon_path: string | null;
}

export interface UpdateTestStructurePayload {
  name: string;
  icon_path: string | null;
  types: { type: string; sequence: number }[];
  existingSections?: SectionResponse[];
}

/* =================================================================
   🚀 CREATE SERVICE
================================================================= */

export const createPackageService = {
  async createNewTestStep1(payload: CreateTestStep1Payload) {
    try {
      clearStep1Storage();

      if (!payload.name.trim()) throw "Nama test wajib diisi";
      if (payload.types.length === 0) throw "Minimal pilih 1 tipe test";

      // 🔹 Hilangkan duplikat tipe sebelum dikirim
      const uniqueTypes = Array.from(
        new Map(payload.types.map((t) => [t.type, t])).values()
      );

      const sections = uniqueTypes.map((t) => ({
        section_type: sectionTypeMapping[t.type] || t.type,
        duration_minutes: 0,
        question_count: 0,
        sequence: t.sequence,
      }));

      const res = await api.post<ApiResponse<TestPackageResponse>>(
        "/test-package",
        {
          name: payload.name,
          icon_path: payload.icon_path,
          sections,
        }
      );

      const apiData = res.data.data;

      // Simpan versi bersih ke localStorage
      saveStep1ToStorage({
        id: apiData.id,
        name: apiData.name,
        icon_path: apiData.icon_path ?? payload.icon_path,
        sections: apiData.sections,
      });

      return { test: mapToTest(apiData), raw: apiData };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          (Array.isArray(error.response?.data?.errors)
            ? error.response?.data?.errors.join(", ")
            : "Gagal membuat test package");
        throw message;
      }
      throw "Terjadi error tidak dikenal saat membuat test package";
    }
  },
  loadStep1FromStorage,
  clearStep1Storage,
};

/* =================================================================
   🧩 UPDATE SERVICE
================================================================= */

export const updatePackageService = {
  /** Update metadata (nama & icon) tanpa ubah sections */
  async updateTestMetadata(testId: number, payload: UpdateTestMetadataPayload) {
    if (!testId) throw "ID test tidak valid";
    if (!payload.name.trim()) throw "Nama test wajib diisi";

    const res = await api.post<ApiResponse<TestPackageResponse>>(
      `/test-package/${testId}`,
      {
        _method: "PUT",
        name: payload.name,
        icon_path: payload.icon_path,
      }
    );

    const apiData = res.data.data;

    saveStep1ToStorage({
      id: apiData.id,
      name: apiData.name,
      icon_path: apiData.icon_path,
      sections: apiData.sections,
    });

    return { test: mapToTest(apiData), raw: apiData };
  },

  /** Update struktur (tambah/hapus tipe test) */
  async updateTestStructure(
    testId: number,
    payload: UpdateTestStructurePayload
  ) {
    if (!testId) throw "ID test tidak valid";
    if (!payload.name.trim()) throw "Nama test wajib diisi";
    if (!payload.types.length) throw "Minimal pilih 1 tipe test";

    // Hilangkan duplikat tipe
    const uniqueTypes = Array.from(
      new Map(payload.types.map((t) => [t.type, t])).values()
    );

    // Build sections baru tapi pakai ID dan data lama dari existingSections
    const sections = uniqueTypes.map((t, idx) => {
      const existing = payload.existingSections?.find(
        (s) => s.section_type === (sectionTypeMapping[t.type] || t.type)
      );

      // ✅ Type-safe: hanya kirim id jika ada
      return {
        ...(existing?.id && { id: existing.id }),
        section_type: sectionTypeMapping[t.type] || t.type,
        duration_minutes: existing?.duration_minutes ?? 0,
        question_count: existing?.question_count ?? 0,
        sequence: idx + 1, // urutan baru sesuai FE
      };
    });

    const res = await api.post<ApiResponse<TestPackageResponse>>(
      `/test-package/${testId}`,
      {
        _method: "PUT",
        name: payload.name,
        icon_path: payload.icon_path,
        sections,
      }
    );

    const apiData = res.data.data;

    saveStep1ToStorage({
      id: apiData.id,
      name: apiData.name,
      icon_path: apiData.icon_path,
      sections: apiData.sections,
    });

    return { test: mapToTest(apiData), raw: apiData };
  },
};


/* =================================================================
   🔍 HELPER: MAP API RESPONSE KE MODEL FE
================================================================= */

function mapToTest(apiData: TestPackageResponse | Step1StorageData): Test {
  return {
    id: apiData.id.toString(),
    name: apiData.name,
    icon_path: apiData.icon_path ?? null,
    types: apiData.sections.map((s) => s.section_type),
    questions: apiData.sections.reduce(
      (sum, s) => sum + (s.question_count || 0),
      0
    ),
    duration:
      apiData.sections.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) +
      " min",
  };
}