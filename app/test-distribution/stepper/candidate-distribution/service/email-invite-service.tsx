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
  failed_count?: number;
  failed_emails?: Array<{
    email: string;
    name: string;
    reason: string;
  }>;
  warning?: string;
  duplicate?: DuplicateCandidate[];
}

/* ==============================
   SERVICE IMPLEMENTATION
============================== */
export const emailInviteService = {
  async sendInvite(payload: InvitePayload): Promise<InviteResponse> {
    try {
      // Use public endpoint to avoid CORS issues
      // Add timeout to prevent hanging (60 seconds)
      const res = await api.post<InviteResponse>(
        "/candidate-tests-public/invite",
        payload,
        {
          timeout: 60000, // 60 seconds timeout
        }
      );

      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {

        // Handle network errors (CORS, timeout, etc.)
        if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
          throw new Error("Request timeout atau masalah koneksi. Silakan coba lagi.");
        }

        // Jangan tampilkan error SQL ke user
        const responseData = error.response?.data as Record<string, unknown>;
        let message = "Gagal mengirim undangan email";
        
        if (responseData?.message && typeof responseData.message === 'string') {
          // Jika ada message yang user-friendly, gunakan itu
          message = responseData.message;
        } else if (error.response?.status === 500) {
          // Untuk error 500, berikan pesan yang lebih umum
          message = "Terjadi kesalahan pada server. Silakan coba lagi.";
        } else if (error.response?.status === 422) {
          // Untuk error validasi, berikan pesan yang lebih spesifik
          message = "Data yang dikirim tidak valid. Silakan periksa kembali.";
        } else if (error.response?.status === 403) {
          message = "Akses ditolak. Silakan login kembali.";
        }
        
        throw new Error(message);
      }

      throw new Error("Terjadi kesalahan tidak dikenal. Silakan coba lagi.");
    }
  },
};
