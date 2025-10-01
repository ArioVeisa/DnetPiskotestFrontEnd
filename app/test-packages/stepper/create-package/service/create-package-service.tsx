import { api } from "@services/api";
import axios from "axios";

// Payload dari FE → dikirim ke API saat step 1
export interface CreateTestStep1Payload {
  icon: string | null;
  name: string;
  targetPosition: string;
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
  target_position: string;
  sections: SectionResponse[];
}

// Struktur response wrapper
interface ApiResponse<T> {
  data: T;
  status: string;
  message: string;
}

// Model untuk FE (dipakai di UI)
export interface Test {
  id: string;
  name: string;
  category: string;
  types: string[];
  questions: number;
  duration: string;
}

// Struktur data yang disimpan di localStorage
export interface Step1StorageData {
  id: number;
  name: string;
  target_position: string;
  sections: SectionResponse[];
}

// Helper untuk localStorage
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

// Mapping section type untuk API
const sectionTypeMapping: Record<string, string> = {
  DISC: "DISC",
  CAAS: "CAAS",
  "fast accuracy": "teliti",
  teliti: "teliti",
};

export const createPackageService = {
  // Step 1: Buat paket test baru
  async createNewTestStep1(payload: CreateTestStep1Payload) {
    try {
      // kalau sudah ada di storage, langsung pakai
      clearStep1Storage();

      // Validasi awal
      if (!payload.name.trim()) throw "Nama test wajib diisi";
      if (!payload.targetPosition.trim()) throw "Target posisi wajib diisi";
      if (payload.types.length === 0) throw "Minimal pilih 1 tipe test";

      // Build sections
      const sections = payload.types.map((t) => ({
        section_type: sectionTypeMapping[t.type] || t.type,
        duration_minutes: 0,
        question_count: 0,
        sequence: t.sequence,
      }));

      // API call → bikin paket baru
      const res = await api.post<ApiResponse<TestPackageResponse>>(
        "/test-package",
        {
          name: payload.name,
          target_position: payload.targetPosition,
          sections,
        }
      );

      const apiData = res.data.data;

      // simpan ke localStorage
      saveStep1ToStorage({
        id: apiData.id,
        name: apiData.name,
        target_position: apiData.target_position,
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

// 🔹 Helper untuk mapping response ke model FE
function mapToTest(apiData: TestPackageResponse | Step1StorageData): Test {
  return {
    id: apiData.id.toString(),
    name: apiData.name,
    category: apiData.target_position,
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
