"use client";

import { useEffect, useState } from "react";
import {
  fetchDistributions,
  Distribution,
  addDistribution,
  updateDistribution,
  deleteDistribution,
} from "../services/test-distribution-service";

export function useTestDistributions() {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Load distributions saat pertama kali mount
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchDistributions();
        setDistributions(data);
      } catch {
        setError("Failed to fetch distributions");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 🔹 Refresh distributions
  async function refresh() {
    try {
      setLoading(true);
      const data = await fetchDistributions();
      setDistributions(data);
      setError(null);
    } catch {
      setError("Failed to refresh distributions");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Create new distribution
  async function create(item: Distribution) {
    try {
      const created = await addDistribution(item);
      setDistributions((prev) => [...prev, created]);
    } catch {
      setError("Failed to create distribution");
    }
  }

  // 🔹 Update distribution
  async function update(id: number, data: Partial<Distribution>) {
    try {
      const updated = await updateDistribution(id, data);
      if (updated) {
        setDistributions((prev) =>
          prev.map((t) => (t.id === id ? updated : t))
        );
      }
    } catch {
      setError("Failed to update distribution");
    }
  }

  // 🔹 Delete distribution
  async function remove(id: number) {
    try {
      console.log('🗑️ Hook: Attempting to delete distribution with ID:', id);
      await deleteDistribution(id);
      console.log('✅ Hook: Distribution deleted successfully, updating state...');
      setDistributions((prev) => prev.filter((t) => t.id !== id));
      console.log('✅ Hook: State updated successfully');
    } catch (error) {
      console.error('❌ Hook: Error deleting distribution:', error);
      setError(`Failed to delete distribution: ${error?.message || 'Unknown error'}`);
      throw error; // Re-throw to let component handle it
    }
  }

  return { distributions, loading, error, create, update, remove, refresh };
}
