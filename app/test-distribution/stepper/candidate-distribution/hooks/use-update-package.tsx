"use client";

import { useState, useCallback } from "react";
import {
  testPackageService,
  TestPackage,
  UpdateTestPackagePayload,
} from "../service/update-package-service";

export function useUpdatePackage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TestPackage | null>(null);

  const updatePackage = useCallback(
    async (id: number, payload: Partial<UpdateTestPackagePayload>) => {
      setLoading(true);
      setError(null);
      try {
        // ✅ ambil data lama dulu
        const current = await testPackageService.fetchById(id);

        // ✅ gabungkan data lama + payload baru
        const mergedPayload: UpdateTestPackagePayload = {
          name: current.name,
          target_position: current.target_position,
          started_date: payload.started_date ?? current.started_date!,
          ended_date: payload.ended_date ?? current.ended_date ?? undefined,
          sections: current.sections ?? [],
          access_type: current.access_type ?? "Public",
          token: localStorage.getItem("token")!,
        };

        const updated = await testPackageService.update(id, mergedPayload);
        setData(updated);
        return updated;
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
    updatePackage,
    loading,
    error,
    data,
  };
}
