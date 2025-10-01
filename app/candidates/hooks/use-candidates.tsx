// hooks/use-candidates.ts
import { useState, useEffect, useCallback } from "react";
import type { Candidate } from "../services/candidates-service";
import { candidatesService } from "../services/candidates-service";

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await candidatesService.getCandidates();
      setCandidates(data);
    } catch (err) {
      console.error(err);
      setError(typeof err === "string" ? err : "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCandidate = useCallback(async (id: string) => {
    try {
      await candidatesService.deleteCandidate(id);
      // 🔄 setelah hapus → refetch data terbaru dari API
      await fetchCandidates();
      return true;
    } catch (err) {
      console.error(err);
      setError(typeof err === "string" ? err : "Failed to delete candidate");
      return false;
    }
  }, [fetchCandidates]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  return { 
    candidates, 
    loading, 
    error, 
    refetch: fetchCandidates, 
    deleteCandidate 
  };
}
