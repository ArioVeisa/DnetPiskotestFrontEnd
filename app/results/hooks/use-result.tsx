// hooks/useResults.ts
import { useState, useEffect } from "react";
import { getResults, getResultDetail } from "../services/result-service";
import type { Result, ResultDetail } from "../services/result-service";

export function useResults() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResults().then(data => {
      setResults(data);
      setLoading(false);
    });
  }, []);

  return { results, loading };
}

export function useResultDetail(candidateId: string | null) {
  const [detail, setDetail] = useState<ResultDetail | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!candidateId) return;
    setLoading(true);
    getResultDetail(candidateId).then(d => {
      setDetail(d);
      setLoading(false);
    });
  }, [candidateId]);

  return { detail, loading };
}
