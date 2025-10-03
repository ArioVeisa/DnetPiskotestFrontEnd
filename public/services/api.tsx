// services/api.ts
import axios, { AxiosError } from "axios";

const API_URL = process.env.NEXT_PRIVATE_API_URL || "https://humble-space-broccoli-rv46xjr57g5fpxp6-8000.app.github.dev/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// tipe error response dari backend
interface ErrorResponse {
  message?: string;
  [key: string]: unknown; // fleksibel kalau ada field tambahan
}

// inject token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// handle expired / unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    const status = error.response?.status;
    const data = error.response?.data;

    const isUnauthenticated =
      status === 401 ||
      (status === 500 &&
        typeof data?.message === "string" &&
        data.message.toLowerCase().includes("unauthenticated"));

    if (isUnauthenticated) {
      // hapus session
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // trigger universal dialog
      window.dispatchEvent(new Event("session-expired"));
    }

    return Promise.reject(error);
  }
);
