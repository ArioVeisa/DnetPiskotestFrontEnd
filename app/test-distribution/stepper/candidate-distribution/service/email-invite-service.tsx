// /app/(tes-session)/services/email-invite-service.ts
import axios from "axios";
import { api } from "@services/api";

/* ==============================
   TYPE DEFINITIONS
============================== */
export interface InvitePayload {
  candidate_ids: number[];
  test_distribution_id: number;
  custom_message?: string;
  token: string;
}

export interface InvitedCandidate {
  id: number;
  candidate_id: number;
  test_id: number;
  unique_token: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/** Struktur kandidat duplikat (sudah pernah diundang sebelumnya) */
export interface DuplicateCandidate {
  id: number;
  candidate_id: number;
  email?: string;
  name?: string;
  test_id?: number;
  status?: string;
}

export interface InviteResponse {
  success: boolean;
  message: string;
  data?: InvitedCandidate[];
  success_count?: number;
  total_requested?: number;
  duplicate?: DuplicateCandidate[];
}

/* ==============================
   SERVICE IMPLEMENTATION
============================== */
export const emailInviteService = {
  async sendInvite(payload: InvitePayload): Promise<InviteResponse> {
    try {
      console.log("📧 Email invite payload:", payload);

      const res = await api.post<InviteResponse>(
        "/candidate-tests/invite",
        payload
      );

      console.log("✅ Email invite response:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Email invite error:", error);

      if (axios.isAxiosError(error)) {
        console.error("❌ Response data:", error.response?.data);
        console.error("❌ Response status:", error.response?.status);

        // Jangan tampilkan error SQL ke user
        const responseData = error.response?.data as any;
        let message = "Gagal mengirim undangan email";
        
        if (responseData?.message) {
          // Jika ada message yang user-friendly, gunakan itu
          message = responseData.message;
        } else if (error.response?.status === 500) {
          // Untuk error 500, berikan pesan yang lebih umum
          message = "Terjadi kesalahan pada server. Silakan coba lagi.";
        } else if (error.response?.status === 422) {
          // Untuk error validasi, berikan pesan yang lebih spesifik
          message = "Data yang dikirim tidak valid. Silakan periksa kembali.";
        }
        
        throw new Error(message);
      }

      throw new Error("Terjadi kesalahan tidak dikenal. Silakan coba lagi.");
    }
  },
};
