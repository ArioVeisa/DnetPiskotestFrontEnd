"use client";

import { useState, useCallback } from "react";
import {
  createDistributionService,
  CreateDistributionPayload,
  CreateDistributionResponse,
} from "../service/create-distribution-service";

export function useCreateDistribution() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CreateDistributionResponse | null>(null);

  const createDistribution = useCallback(
    async (payload: CreateDistributionPayload) => {
      setLoading(true);
      setError(null);
      try {
        const result = await createDistributionService.createFromPackage(payload);
        setData(result);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createDistribution,
    loading,
    error,
    data,
  };
}

