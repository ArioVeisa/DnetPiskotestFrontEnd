// services/new-password-service.ts
import { api } from "@services/api";

export const newPasswordService = {
  setNewPassword: async (
    email: string,
    token: string,
    password: string,
    password_confirmation: string
  ) => {
    const res = await api.post(`/reset-password`, {
      email,
      token,
      password,
      password_confirmation,
    });
    return res.data; // { message: "Password reset successful" }
  },
};
