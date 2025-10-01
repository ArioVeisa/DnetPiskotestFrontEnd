"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getBanks,
  seedBanksIfEmpty,
  type QuestionBank,
} from "../services/bank-question-service";

export function useBankQuestion(auto = true) {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBanks();
      setBanks(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auto) return;
    (async () => {
      try {
        await seedBanksIfEmpty(); // pastikan seed selesai dulu
      } catch (err) {
        console.warn("Seed failed:", err);
      }
      refresh();
    })();
  }, [refresh, auto]);

  return {
    banks,
    loading,
    error,
    isEmpty: !loading && banks.length === 0,
    refresh,
  };
}
