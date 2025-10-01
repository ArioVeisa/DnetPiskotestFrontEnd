"use client";

import { useEffect, useState, useCallback } from "react";
import { testPackageService, Test } from "../services/test-package-service";

export function useTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Fungsi untuk fetch data test package
  const fetchTests = useCallback(async () => {
    setLoading(true);
    setError(""); // Reset error state

    try {
      const data = await testPackageService.fetchAll();
      setTests(data);
    } catch (err) {
      console.error(err);
      setError(typeof err === "string" ? err : "Failed to load test packages");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fungsi untuk menghapus test package
  const handleDelete = useCallback(async (id: string) => {
    try {
      await testPackageService.deleteById(id); // Panggil service untuk menghapus
      // Fetch ulang data setelah penghapusan
      await fetchTests();
      return true;
    } catch (err) {
      console.error(err);
      setError(typeof err === "string" ? err : "Failed to delete test package");
      return false;
    }
  }, [fetchTests]);

  // Load data saat komponen pertama kali dimuat
  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  return { 
    tests, 
    loading, 
    error, 
    refetch: fetchTests, // Untuk manual refresh data
    handleDelete 
  };
}
