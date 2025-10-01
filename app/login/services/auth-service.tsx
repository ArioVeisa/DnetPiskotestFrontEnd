// /app/login/services/auth-service.ts
import axios from "axios";
import { api } from "@services/api";

export const authService = {
  async login(_email: string, _password: string) {
    try {
      const res = await api.post("/login", {
        email: _email,
        password: _password,
      });

      const { access_token, user } = res.data;

      // simpan token & user ke localStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      return user;
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
          message = "Login gagal!";
        }

        throw message;
      }
      throw "Terjadi error tidak dikenal saat login";
    }
  },

  async logout() {
    try {
      await api.post("/logout"); // token otomatis diinject
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return true;
    } catch {
      return false;
    }
  },

  async checkSession() {
    try {
      const res = await api.get("/user"); // token otomatis diinject
      return res.data;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
  },
};
