// /app/login/services/auth-service.ts
"use client";

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

      // Simpan ke localStorage untuk frontend
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      // Simpan token ke cookie agar bisa diakses middleware (server-side)
      document.cookie = `token=${access_token}; path=/; max-age=${60 * 60 * 24}; secure; samesite=strict`;

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

  async checkSession() {
    try {
      const res = await api.get("/user"); // token otomatis diinject
      return res.data;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      document.cookie = "token=; path=/; max-age=0";
      return null;
    }
  },
};
