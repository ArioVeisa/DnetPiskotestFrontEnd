"use client";

import { useEffect, useState } from "react";
import { packageService, TestPackage } from "../services/add-package-service";

export function useAddPackage() {
  const [packages, setPackages] = useState<TestPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // ✅ simpan error

  useEffect(() => {
    let mounted = true; // ✅ cegah update state setelah unmount

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const data = await packageService.fetchAll();
        if (mounted) setPackages(data);
      } catch (err) {
        console.error("Gagal load packages:", err);
        if (mounted) {
          const msg = err instanceof Error ? err.message : String(err);
          setError(msg);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false; // ✅ cleanup
    };
  }, []);

  return { packages, loading, error, refetch: () => packageService.fetchAll() };
}
