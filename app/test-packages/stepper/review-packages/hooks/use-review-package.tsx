"use client";

import { useState } from "react";
import {
  reviewPackageService,
  TestPackage,
  UpdateTestPackagePayload,
} from "../service/review-package-service";

/* ======================================================================
 * TYPES
 * ====================================================================== */
export interface TestItem {
  id: number;        // sectionId asli backend
  questions: number; // tetap disimpan untuk UI
  duration: number;  // tetap disimpan untuk UI
}

/* ======================================================================
 * HOOK: AMBIL DATA PACKAGE
 * ====================================================================== */
export function useFetchPackage(testId: number) {
  const [data, setData] = useState<TestPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reviewPackageService.getPackage(testId);
      setData(res);
    } catch (err: unknown) {
      console.error("❌ useFetchPackage error:", err);
      setError(err instanceof Error ? err.message : "Gagal ambil paket tes");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
}

/* ======================================================================
 * HOOK: FINALIZE PACKAGE (langsung ke API)
 * ====================================================================== */
export function useFinalizePackage(testId: number, token?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const finalize = async (
    payload: UpdateTestPackagePayload
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await reviewPackageService.updatePackage(testId, payload, token);
      setSuccess(true);
      return true;
    } catch (err: unknown) {
      console.error("❌ useFinalizePackage error:", err);
      setError(err instanceof Error ? err.message : "Gagal finalize paket tes");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { finalize, loading, error, success };
}

/* ======================================================================
 * HOOK: PUBLISH PACKAGE (urutan section baru dari UI drag/drop)
 * ====================================================================== */
export function usePublishPackage(testId: number, token?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publish = async (tests: TestItem[]): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // mapping drag/drop → payload sequence
      const sections = tests.map((t, index) => ({
        section_id: t.id,
        sequence: index + 1,
      }));

      const payload: UpdateTestPackagePayload = { sections };

      await reviewPackageService.updatePackage(testId, payload, token);

      return true;
    } catch (err: unknown) {
      console.error("❌ usePublishPackage error:", err);
      setError(err instanceof Error ? err.message : "Gagal publish paket tes");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { publish, loading, error };
}
