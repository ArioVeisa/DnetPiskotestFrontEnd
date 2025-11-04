// services/api.ts
import axios, { AxiosError } from "axios";

// Resolve API base URL robustly. Prevent accidental relative "/api" hitting Next.js dev server (3000).
function resolveApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL_LOCAL;

  // If env is provided and looks absolute (starts with http), use it
  if (envUrl && /^https?:\/\//i.test(envUrl)) {
    return envUrl.replace(/\/$/, "");
  }

  // If env provided but not absolute, warn and fall back
  if (envUrl && typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.warn(
      `Invalid NEXT_PUBLIC_API_URL value: "${envUrl}". Falling back to http://localhost:8000/api`
    );
  }

  return "http://localhost:8000/api";
}

const API_URL = resolveApiBaseUrl();

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
    const url = error.config?.url;

    // Jangan trigger session expired untuk login endpoint
    const isLoginEndpoint = url?.includes('/login');
    
    const isUnauthenticated =
      (status === 401 && !isLoginEndpoint) ||
      (status === 500 &&
        typeof data?.message === "string" &&
        data.message.toLowerCase().includes("unauthenticated"));

    if (isUnauthenticated) {
      // hapus session
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // ❌ DISABLED: Tidak perlu dialog session expired yang mengganggu
      // window.dispatchEvent(new Event("session-expired"));
      
      // ✅ Langsung redirect ke login tanpa dialog
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
