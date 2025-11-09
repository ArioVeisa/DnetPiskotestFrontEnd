"use client";

import { useEffect, useState } from "react";
import axios from "axios";
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
      await deleteDistribution(id);
      setDistributions((prev) => prev.filter((t) => t.id !== id));
    } catch (error: unknown) {
      // Extract meaningful error message from backend response
      let errorMessage = 'Unknown error';
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(`Failed to delete distribution: ${errorMessage}`);
      throw error; // Re-throw to let component handle it
    }
  }

  return { distributions, loading, error, create, update, remove, refresh };
}
