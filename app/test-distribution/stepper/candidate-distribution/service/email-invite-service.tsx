// /app/(tes-session)/services/email-invite-service.ts
import axios from "axios";
import { api } from "@services/api";

export interface InvitePayload {
  candidate_ids: number[];
  test_id: number;
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

export interface InviteResponse {
  message: string;
  data?: InvitedCandidate[];
  duplicate?: any[];
}

export const emailInviteService = {
  async sendInvite(payload: InvitePayload): Promise<InviteResponse> {
    try {
      console.log('📧 Email invite payload:', payload);
      
      const res = await api.post<InviteResponse>("/candidate-tests/invite", payload);
      
      console.log('✅ Email invite response:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Email invite error:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ Response data:', error.response?.data);
        console.error('❌ Response status:', error.response?.status);
        throw error.response?.data?.message || "Gagal mengirim undangan email";
      }
      throw "Terjadi error tidak dikenal";
    }
  },
};
