// /result-candidates/[id]/services/result-candidates-service.ts
import { api } from "@/public/services/api";

// =======================
// Interfaces
// =======================

export interface Candidate {
  id: number;
  name: string;
  position: string;
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
}

export interface DiscResult {
  id: number;
  candidate_test_id: number;
  section_id: number;
  most_d: number; most_i: number; most_s: number; most_c: number;
  least_d: number; least_i: number; least_s: number; least_c: number;
  diff_d: number; diff_i: number; diff_s: number; diff_c: number;
  std1_d: number; std1_i: number; std1_s: number; std1_c: number;
  std2_d: number; std2_i: number; std2_s: number; std2_c: number;
  std3_d: number; std3_i: number; std3_s: number; std3_c: number;
  dominant_type: string;
  dominant_type_2: string;
  dominant_type_3: string;
  interpretation: string;
  interpretation_2: string;
  interpretation_3: string;
  candidate_test: CandidateTest;
}

export interface CaasResult {
  id: number;
  candidate_test_id: number;
  section_id: number;
  concern: number;
  control: number;
  curiosity: number;
  confidence: number;
  total: number;
  category: string;
}

export interface TelitiResult {
  id: number;
  candidate_test_id: number;
  section_id: number | null;
  score: number;
  total_questions: number;
  category: string;
}

export interface DiscComputed {
  characteristics: {
    user_public: string[];
    teammate: string[];
    intimate: string[];
  };
  personality_description: string;
  job_match: string[];
}

export interface CandidateResult {
  id: string;
  name: string;
  position: string;
  phone?: string;
  nik?: string;
  email?: string;
  gender?: string;
  caas: string;
  completedAt?: string;
  adaptability: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    norma: string;
  };
  graphs: {
    most: { label: string; value: number }[];
    least: { label: string; value: number }[];
    change: { label: string; value: number }[];
  };
  characteristics: {
    userPublic: string[];
    teammate: string[];
    intimate: string[];
  };
  personalityDescription: string;
  jobMatch: string[];
}

// =======================
// Service
// =======================

export const resultCandidatesService = {
  async getCandidateById(id: string): Promise<CandidateResult> {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: {
        candidate_test: {
          id: number;
          completed_at: string | null;
          candidate: {
            id: number;
            name: string;
            email: string;
            position: string;
            nik: string;
            phone_number: string;
            birth_date: string;
            gender: string;
            department: string;
          };
          test: {
            id: number;
            name: string;
            target_position: string;
          };
        };
        disc_results: DiscResult[];
        caas_results: CaasResult[];
        teliti_results: TelitiResult[];
        disc_computed: DiscComputed | null;
      };
    }>(`/candidate-tests-public/${id}/results`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch results');
    }

    const { candidate_test, disc_results, caas_results, teliti_results, disc_computed } = response.data.data;

    const disc = disc_results[0] ?? null;
    const caas = caas_results[0] ?? null;
    const teliti = teliti_results[0] ?? null;
    const candidate = candidate_test.candidate;

    if (!candidate) {
      throw new Error('Data kandidat tidak ditemukan');
    }

    // Norma dari DB category, atau hitung dari score jika kosong
    const calculateNorma = (score: number): string => {
      if (score >= 56) return 'SANGAT AKURAT';
      if (score >= 41) return 'AKURAT';
      if (score >= 21) return 'CUKUP AKURAT';
      if (score >= 6) return 'KURANG AKURAT';
      return 'SANGAT KURANG AKURAT';
    };

    const norma = (teliti?.category && teliti.category.trim() !== '')
      ? teliti.category
      : (teliti?.score != null ? calculateNorma(teliti.score) : '-');

    // Characteristics & personality dari disc_computed (backend)
    // Fallback ke empty arrays jika DISC tidak ada
    const characteristics = disc_computed
      ? {
        userPublic: disc_computed.characteristics.user_public,
        teammate: disc_computed.characteristics.teammate,
        intimate: disc_computed.characteristics.intimate,
      }
      : { userPublic: [], teammate: [], intimate: [] };

    const personalityDescription = disc_computed?.personality_description ?? '';
    const jobMatch = disc_computed?.job_match ?? [];

    const result: CandidateResult = {
      id: candidate.id.toString(),
      name: candidate.name,
      position: candidate.position,
      phone: candidate.phone_number || undefined,
      nik: candidate.nik || undefined,
      email: candidate.email || undefined,
      gender: candidate.gender || undefined,
      caas: caas?.category ?? '-',
      completedAt: candidate_test.completed_at || undefined,

      adaptability: {
        score: teliti?.score ?? 0,
        correctAnswers: teliti?.score ?? 0,
        totalQuestions: teliti?.total_questions ?? 0,
        norma,
      },

      graphs: disc
        ? {
          most: [{ label: 'D', value: disc.std1_d }, { label: 'I', value: disc.std1_i }, { label: 'S', value: disc.std1_s }, { label: 'C', value: disc.std1_c }],
          least: [{ label: 'D', value: disc.std2_d }, { label: 'I', value: disc.std2_i }, { label: 'S', value: disc.std2_s }, { label: 'C', value: disc.std2_c }],
          change: [{ label: 'D', value: disc.std3_d }, { label: 'I', value: disc.std3_i }, { label: 'S', value: disc.std3_s }, { label: 'C', value: disc.std3_c }],
        }
        : { most: [], least: [], change: [] },

      characteristics,
      personalityDescription,
      jobMatch,
    };

    return result;
  },
};