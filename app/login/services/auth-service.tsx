// /app/login/services/auth-service.ts
import axios from "axios";
import { api } from "@services/api";

export const authService = {
  async login(_email: string, _password: string) {
    try {
      // Gunakan proxy lokal untuk menghindari CORS
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: _email,
          password: _password,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw errorData.message || 'Login gagal!';
      }

      const data = await res.json();

      const { access_token, user } = data;

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
      const token = localStorage.getItem("token");
      await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return true;
    } catch {
      return false;
    }
  },

  async checkSession() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });
      
      if (!res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return null;
      }
      
      const data = await res.json();
      return data;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
  },
};
