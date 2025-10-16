// /result-candidates/[id]/services/result-candidates-service.ts
import { api } from "@services/api";
import axios from "axios";

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
  most_d: number;
  most_i: number;
  most_s: number;
  most_c: number;
  least_d: number;
  least_i: number;
  least_s: number;
  least_c: number;
  diff_d: number;
  diff_i: number;
  diff_s: number;
  diff_c: number;
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

export interface CandidateResult {
  id: string;
  name: string;
  position: string;
  caas: string;
  adaptability: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
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
}

// =======================
// Service Implementation
// =======================

// =======================
// Service Implementation
// =======================

export const resultCandidatesService = {
  async getCandidateById(id: string): Promise<CandidateResult> {
    const token = localStorage.getItem("token");

    try {
      const [candidateRes, discRes, caasRes, telitiRes] = await Promise.all([
        api.get<{ data: Candidate }>(`/candidates/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get<{ data: DiscResult }>(`/disc-results/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get<{ data: CaasResult }>(`/caas-results/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get<{ data: TelitiResult }>(`/teliti-results/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const candidate = candidateRes.data.data;
      const disc = discRes.data.data;
      const caas = caasRes.data.data;
      const teliti = telitiRes.data.data;

      if (!candidate) throw new Error("Candidate not found");
      if (!disc) throw new Error("DISC result not found for candidate");

      // 🔹 Helper untuk menentukan dominant type berdasar skor tertinggi
      const getDominantType = (
        d: number,
        i: number,
        s: number,
        c: number
      ): string => {
        const max = Math.max(d, i, s, c);
        if (max === d) return "D";
        if (max === i) return "I";
        if (max === s) return "S";
        return "C";
      };

      const mostType = getDominantType(
        disc.most_d,
        disc.most_i,
        disc.most_s,
        disc.most_c
      );
      const leastType = getDominantType(
        disc.least_d,
        disc.least_i,
        disc.least_s,
        disc.least_c
      );
      const diffType = getDominantType(
        disc.diff_d,
        disc.diff_i,
        disc.diff_s,
        disc.diff_c
      );

      // 🔹 Template karakteristik berdasarkan tipe DISC
      const characteristicTemplates: Record<
        string,
        { public: string[]; teammate: string[]; intimate: string[] }
      > = {
        D: {
          public: ["Decisive", "Leader", "Goal-Oriented"],
          teammate: ["Dominant", "Assertive", "Direct Communicator"],
          intimate: ["Strong-willed", "Confident", "Protective"],
        },
        I: {
          public: ["Enthusiastic", "Optimistic", "Sociable"],
          teammate: ["Inspiring", "Friendly", "Talkative"],
          intimate: ["Cheerful", "Open", "Expressive"],
        },
        S: {
          public: ["Calm", "Supportive", "Reliable"],
          teammate: ["Patient", "Good Listener", "Team Player"],
          intimate: ["Loyal", "Kind", "Peace-Seeking"],
        },
        C: {
          public: ["Accurate", "Analytical", "Precise"],
          teammate: ["Detail-Oriented", "Cautious", "Organized"],
          intimate: ["Perfectionist", "Responsible", "Structured"],
        },
      };

      // 🔹 Pilih karakteristik berdasarkan tipe dominan
      const randomize = (arr: string[], count = 3): string[] =>
        arr.sort(() => Math.random() - 0.5).slice(0, count);

      const userPublic =
        characteristicTemplates[mostType]?.public ??
        characteristicTemplates.C.public;
      const teammate =
        characteristicTemplates[leastType]?.teammate ??
        characteristicTemplates.S.teammate;
      const intimate =
        characteristicTemplates[diffType]?.intimate ??
        characteristicTemplates.I.intimate;

      // 🔹 Susun hasil unified
      const result: CandidateResult = {
        id: candidate.id.toString(),
        name: candidate.name,
        position: candidate.position,
        caas: caas.category,

        adaptability: {
          score: teliti?.score ?? 0,
          correctAnswers: teliti?.score ?? 0,
          totalQuestions: teliti?.total_questions ?? 0,
        },

        graphs: {
          most: [
            { label: "D", value: disc.most_d },
            { label: "I", value: disc.most_i },
            { label: "S", value: disc.most_s },
            { label: "C", value: disc.most_c },
          ],
          least: [
            { label: "D", value: disc.least_d },
            { label: "I", value: disc.least_i },
            { label: "S", value: disc.least_s },
            { label: "C", value: disc.least_c },
          ],
          change: [
            { label: "D", value: disc.diff_d },
            { label: "I", value: disc.diff_i },
            { label: "S", value: disc.diff_s },
            { label: "C", value: disc.diff_c },
          ],
        },

        characteristics: {
          userPublic: randomize(userPublic),
          teammate: randomize(teammate),
          intimate: randomize(intimate),
        },

        personalityDescription: [
          disc.interpretation,
          disc.interpretation_2,
          disc.interpretation_3,
        ]
          .filter(Boolean)
          .join("\n"),
      };

      return result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        let message: string;

        if (typeof data === "string") {
          message = data;
        } else if (data?.message) {
          message = data.message;
        } else if (data?.errors) {
          const firstKey = Object.keys(data.errors)[0];
          message = data.errors[firstKey][0];
        } else {
          message = "Gagal mengambil data hasil kandidat!";
        }

        throw message;
      }

      throw "Terjadi kesalahan tak terduga saat mengambil hasil kandidat!";
    }
  },
};
