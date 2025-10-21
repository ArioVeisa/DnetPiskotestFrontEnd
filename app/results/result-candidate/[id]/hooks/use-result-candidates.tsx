// /result-candidates/[id]/hooks/use-result-candidates.tsx

import { useState, useEffect } from "react";
import { resultCandidatesService, CandidateResult } from "../services/result-candidates-service";

export const useResultCandidates = (id: string) => {
  const [data, setData] = useState<CandidateResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await resultCandidatesService.getCandidateById(id);
        setData(result);
      } catch (err) {
        console.error("Error in useResultCandidates:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data kandidat");
        // Tetap set data dummy sebagai fallback
        setData(resultCandidatesService.getDummyCandidateData(id));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { data, loading, error };
};