// src/app/user-management/services/user-management-service.ts
import { api } from "@services/api";
import axios from "axios";

/* ============================
   Frontend Model
============================ */
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;          // bebas string
  department: string | null;
}

/* ============================
   API Response Types
============================ */
interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string | null;
  created_at: string;
  updated_at: string;
}

/* ============================
   Mapper Function
============================ */
function mapApiToUser(apiData: UserResponse): User {
  return {
    id: apiData.id.toString(),
    name: apiData.name,
    email: apiData.email,
    role: apiData.role,
    department: apiData.department,
  };
}

/* ============================
   Service Functions
============================ */
export const userManagementService = {
  // Fetch all users
  async fetchAll(): Promise<User[]> {
    try {
      const res = await api.get<UserResponse[]>("/users");
      console.log("✅ [fetchAll] Response:", res.data);

      return res.data.map((item) => mapApiToUser(item));
    } catch (error) {
      console.error("❌ [fetchAll] Error:", error);
      if (axios.isAxiosError(error)) {
        console.error("❌ [fetchAll] Response:", error.response?.data);
        const message =
          error.response?.data?.message || "Gagal mengambil data pengguna";
        throw message;
      }
      throw "Terjadi error tidak dikenal saat mengambil data pengguna";
    }
  },

  // Fetch user by ID
  async fetchById(id: string): Promise<User> {
    try {
      const res = await api.get<UserResponse>(`/users/${id}`);
      return mapApiToUser(res.data);
    } catch (error) {
      console.error("❌ [fetchById] Error:", error);
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Gagal mengambil detail pengguna";
        throw message;
      }
      throw "Terjadi error tidak dikenal saat mengambil detail pengguna";
    }
  },

  // Create new user
  async create(payload: Omit<User, "id">): Promise<User> {
    try {
      const res = await api.post<UserResponse>("/users", payload);
      return mapApiToUser(res.data);
    } catch (error) {
      console.error("❌ [create] Error:", error);
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Gagal menambahkan pengguna";
        throw message;
      }
      throw "Terjadi error tidak dikenal saat menambahkan pengguna";
    }
  },

  // Update user by ID
  async update(id: string, payload: Partial<User>): Promise<User> {
    try {
      const res = await api.put<UserResponse>(`/users/${id}`, payload);
      return mapApiToUser(res.data);
    } catch (error) {
      console.error("❌ [update] Error:", error);
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Gagal memperbarui pengguna";
        throw message;
      }
      throw "Terjadi error tidak dikenal saat memperbarui pengguna";
    }
  },

  // Delete user by ID
  async deleteById(id: string): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error("❌ [deleteById] Error:", error);
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Gagal menghapus pengguna";
        throw message;
      }
      throw "Terjadi error tidak dikenal saat menghapus pengguna";
    }
  },
};
