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
  name: string;
  email: string;
  status: "Invited" | "Failed";
}

export interface InviteResponse {
  success: boolean;
  message: string;
  data?: InvitedCandidate[];
}

export const emailInviteService = {
  async sendInvite(payload: InvitePayload): Promise<InviteResponse> {
    try {
      const res = await api.post<InviteResponse>("/candidate-tests/invite", payload);
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data?.message || "Gagal mengirim undangan email";
      }
      throw "Terjadi error tidak dikenal";
    }
  },
};
