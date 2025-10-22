import axios from "axios";
import { api } from "@services/api";

export interface CreateDistributionPayload {
  test_id: number;
  session_name: string;
  start_date: string;
  end_date: string;
}

export interface CreateDistributionResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    target_position: string;
    icon_path: string | null;
    started_date: string;
    access_type: string;
    parent_test_id: number;
    created_at: string;
    updated_at: string;
    sections: Array<{
      id: number;
      test_id: number;
      section_type: string;
      duration_minutes: number;
      question_count: number;
      sequence: number;
      created_at: string;
      updated_at: string;
    }>;
  };
}

export const createDistributionService = {
  async createFromPackage(payload: CreateDistributionPayload): Promise<CreateDistributionResponse> {
    try {
      console.log("🚀 Creating new distribution from package:", payload);
      
      const response = await api.post<CreateDistributionResponse>(
        "/test-distributions-public/create-from-package",
        payload
      );
      
      console.log("✅ Distribution created successfully:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("❌ Error creating distribution:", error);
      
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error("Gagal membuat test distribution baru");
    }
  }
};

