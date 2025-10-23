// services/candidates-service.ts
import axios from "axios";
import { api } from "@services/api";

export type Candidate = {
  id: string;
  name: string;
  nik: string;
  phoneNumber: string;
  email: string;
  position: string;
  birthDate: string;
  gender: string;
  department: string;
  createdAt: string;
  updatedAt: string;
  status?: "Active" | "Pending" | "Completed" | "Expired"; // opsional
};

// tipe sesuai data dari API (snake_case)
type CandidateApiResponse = {
  id: string;
  name: string;
  nik: string;
  phone_number: string;
  email: string;
  position: string;
  birth_date: string;
  gender: string;
  department: string;
  created_at: string;
  updated_at: string;
};

export const candidatesService = {
  async getCandidates(): Promise<Candidate[]> {
    try {
      // Use public endpoint for testing
      const res = await api.get<CandidateApiResponse[]>("/candidates-public");

      return res.data.map((c) => ({
        id: c.id,
        name: c.name,
        nik: c.nik,
        phoneNumber: c.phone_number,
        email: c.email,
        position: c.position,
        birthDate: c.birth_date,
        gender: c.gender,
        department: c.department,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));
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
          message = "Gagal mengambil data kandidat!";
        }

        throw message;
      }
      throw "Terjadi error tidak dikenal saat mengambil kandidat";
    }
  },

  async deleteCandidate(id: string): Promise<boolean> {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/candidates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        let message: string;

        if (typeof data === "string") {
          message = data;
        } else if (data?.message) {
          message = data.message;
        } else {
          message = "Gagal menghapus kandidat!";
        }

        throw message;
      }
      throw "Terjadi error tidak dikenal saat menghapus kandidat";
    }
  },
};
