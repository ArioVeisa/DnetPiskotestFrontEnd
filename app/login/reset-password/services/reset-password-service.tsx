// /app/services/reset-password-service.ts
import { api } from "@services/api";

export const resetPasswordService = {
  async requestReset(email: string) {
    const res = await api.post("/forgot-password", { email });
    return res.data; 
    // biasanya: { message, email, reset_token_for_testing }
  },

  async confirmReset(token: string, password: string) {
    const res = await api.post("/reset-password", {
      token,
      password,
    });
    return res.data; 
    // biasanya: { message: "Password reset successful" }
  },
};
