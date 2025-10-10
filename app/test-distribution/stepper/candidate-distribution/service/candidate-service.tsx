// /app/(tes-session)/services/candidate-service.ts
import axios from "axios";
import { api } from "@services/api";

export interface Candidate {
  id: number;
  nik: string;
  name: string;
  phone_number: string;
  email: string;
  position: string;
  birth_date: string; // format "YYYY-MM-DD"
  gender: "male" | "female" | string;
  department: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCandidatePayload {
  nik: string;
  name: string;
  phone_number: string;
  email: string;
  position: string;
  birth_date: string;
  gender: "male" | "female";
  department: string;
}

export interface UpdateCandidatePayload {
  name?: string;
  phone_number?: string;
  email?: string;
  position?: string;
  birth_date?: string;
  gender?: "male" | "female";
  department?: string;
}

export const candidateService = {
  async fetchAll(): Promise<Candidate[]> {
    try {
      const res = await api.get("/candidates");
      return res.data.data ?? res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data?.message || "Gagal mengambil kandidat";
      }
      throw "Terjadi error tidak dikenal";
    }
  },

  async fetchAvailableCandidates(testId?: number): Promise<Candidate[]> {
    try {
      const url = testId 
        ? `/candidates/available?test_id=${testId}`
        : "/candidates/available";
      const res = await api.get(url);
      return res.data.data ?? res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data?.message || "Gagal mengambil kandidat yang tersedia";
      }
      throw "Terjadi error tidak dikenal";
    }
  },

  async fetchById(id: number): Promise<Candidate> {
    try {
      const res = await api.get(`/candidates/${id}`);
      return res.data.data ?? res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data?.message || "Gagal mengambil detail kandidat";
      }
      throw "Terjadi error tidak dikenal";
    }
  },

  async create(payload: CreateCandidatePayload): Promise<Candidate> {
    try {
      console.log('Creating candidate with payload:', payload);
      const res = await api.post("/candidates", payload);
      console.log('Candidate created successfully:', res.data);
      return res.data.data ?? res.data;
    } catch (error) {
      console.error('Error creating candidate:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error response:', error.response);
        console.error('Error response data:', error.response?.data);
        // Don't throw here, let the hook handle the error
        throw error;
      }
      throw "Terjadi error tidak dikenal";
    }
  },

  async update(id: number, payload: UpdateCandidatePayload): Promise<Candidate> {
    try {
      const res = await api.put(`/candidates/${id}`, payload);
      return res.data.data ?? res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data?.message || "Gagal update kandidat";
      }
      throw "Terjadi error tidak dikenal";
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await api.delete(`/candidates/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data?.message || "Gagal menghapus kandidat";
      }
      throw "Terjadi error tidak dikenal";
    }
  },
};
