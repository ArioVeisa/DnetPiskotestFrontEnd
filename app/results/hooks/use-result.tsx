// hooks/useResults.ts
import { useState, useEffect } from "react";
import { resultsService } from "../services/result-service";
import type { Result } from "../services/result-service";

export function useResults() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const data = await resultsService.getAll();
        setResults(data);
      } catch (err) {
        setError(err as string);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, []);

  return { results, loading, error };
}
