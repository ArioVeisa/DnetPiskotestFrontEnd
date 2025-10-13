// services/test-distribution-service.ts

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
    const response = await api.get('/test-distributions');
    
    console.log('✅ Fetched distributions:', response.data);
    return response.data.data || [];
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
    const response = await api.delete(`/test-distributions/${id}`);
    
    console.log('✅ Delete response:', response.data);

    // Also remove from local storage as backup
    const saved = loadDistributions();
    const filtered = saved.filter((t) => t.id !== id);
    persistDistributions(filtered);
    
    console.log('✅ Distribution deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting distribution:', error);
    throw error;
  }
}
