// services/test-distribution-service.ts

import axios from "axios";
import { api } from "@services/api";

export type DistributionStatus =
  | "Draft"
  | "Scheduled"
  | "Ongoing"
  | "Completed"
  | "Expired";

export interface Distribution {
  id: number;
  testName: string;
  category: string; // contoh: "Managerial", "Fresh Graduates", "All Candidates"
  startDate: string | null;
  endDate: string | null;
  candidatesTotal: number;
  status: DistributionStatus;
  iconPath?: string | null; // Icon dari test package
}

const STORAGE_KEY = "test_distributions";

/* ============================
   UTIL PERSISTENCE
   ============================ */
function loadDistributions(): Distribution[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Distribution[]) : [];
  } catch {
    return [];
  }
}

function persistDistributions(items: Distribution[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/* ============================
   FETCH
   ============================ */
export async function fetchDistributions(): Promise<Distribution[]> {
  try {
    console.log('📋 Fetching test distributions...');
    
    // Ambil data dari backend API menggunakan axios instance
    const response = await api.get('/test-distributions-public');
    
    console.log('✅ Fetched distributions:', response.data);
    
    // Transform backend data to frontend format
    const transformedData = (response.data.data || []).map((item: unknown) => {
      const data = item as {
        id: number;
        name: string;
        target_position?: string;
        started_date: string;
        candidates_count: number;
        status: string;
        icon_path?: string | null;
        test_package?: { icon_path?: string | null } | null;
      };
      return {
        id: data.id,
        testName: data.name,
        category: data.target_position || 'Managerial',
        startDate: data.started_date,
        endDate: null, // Backend doesn't provide end_date
        candidatesTotal: data.candidates_count,
        status: data.status === 'Completed' ? 'Completed' : 
                data.status === 'In Progress' ? 'Ongoing' : 
                data.status === 'Scheduled' ? 'Scheduled' : 'Draft',
        iconPath: data.icon_path || data.test_package?.icon_path || null
      };
    });
    
    return transformedData;
  } catch (error) {
    console.error('❌ Error fetching distributions:', error);
    // Return empty array jika API gagal - tidak ada fallback ke dummy data
    return [];
  }
}

/* ============================
   CREATE
   ============================ */
export async function addDistribution(
  item: Omit<Distribution, "id">
): Promise<Distribution> {
  const saved = loadDistributions();
  const newItem: Distribution = {
    ...item,
    id: Date.now(),
  };
  saved.push(newItem);
  persistDistributions(saved);
  return newItem;
}

/* ============================
   UPDATE
   ============================ */
export async function updateDistribution(
  id: number,
  data: Partial<Distribution>
): Promise<Distribution | null> {
  const saved = loadDistributions();
  const idx = saved.findIndex((t) => t.id === id);
  if (idx >= 0) {
    saved[idx] = { ...saved[idx], ...data };
    persistDistributions(saved);
    return saved[idx];
  }
  return null;
}

/* ============================
   DELETE
   ============================ */
export async function deleteDistribution(id: number): Promise<void> {
  try {
    console.log('🗑️ Deleting test distribution with ID:', id);
    
    // Use the existing api helper
    const response = await api.delete(`/test-distributions-public/${id}`);
    
    console.log('✅ Delete response:', response.data);
    console.log('✅ Response status:', response.status);

    // Also remove from local storage as backup
    const saved = loadDistributions();
    const filtered = saved.filter((t) => t.id !== id);
    persistDistributions(filtered);
    
    console.log('✅ Distribution deleted successfully');
  } catch (error: unknown) {
    console.error('❌ Error deleting distribution:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      response: axios.isAxiosError(error) ? error.response?.data : undefined,
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
      config: axios.isAxiosError(error) ? error.config : undefined
    });
    throw error;
  }
}
