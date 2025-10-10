"use client";

import { useState, useEffect, useCallback } from "react";
import {
  candidateService,
  Candidate,
  CreateCandidatePayload,
  UpdateCandidatePayload,
} from "../service/candidate-service";
import { AxiosError } from "axios";

/** Kandidat dengan status tambahan di frontend */
export interface CandidateWithStatus extends Candidate {
  localStatus: "Pending" | "Invited";
}

export function useCandidates(testId?: number) {
  const [candidates, setCandidates] = useState<CandidateWithStatus[]>([]);
  const [selected, setSelected] = useState<CandidateWithStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /** Helper: tambahkan default status "Pending" */
  const normalizeCandidates = (data: Candidate[]): CandidateWithStatus[] =>
    data.map((c) => ({ ...c, localStatus: "Pending" }));

  /** Refresh kandidat yang tersedia (belum pernah test) */
  const refreshCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await candidateService.fetchAvailableCandidates(testId);
      setCandidates(normalizeCandidates(data));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  /** Ambil detail kandidat */
  const fetchCandidateById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await candidateService.fetchById(id);
      const withStatus: CandidateWithStatus = { ...data, localStatus: "Pending" };
      setSelected(withStatus);
      return withStatus;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Tambah kandidat */
  const addCandidate = useCallback(async (payload: CreateCandidatePayload) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const created = await candidateService.create(payload);
      const withStatus: CandidateWithStatus = { ...created, localStatus: "Pending" };
      setCandidates((prev) => [...prev, withStatus]);
      return withStatus;
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 422 && err.response.data?.errors) {
          const errors: Record<string, string[]> = err.response.data.errors;
          const fieldErrors: Record<string, string> = {};
          Object.entries(errors).forEach(([field, msgs]) => {
            if (msgs.length > 0) fieldErrors[field] = msgs[0];
          });
          setFieldErrors(fieldErrors);
          setError(null);
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
          setFieldErrors({});
        } else {
          setError(err.message);
          setFieldErrors({});
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Refresh kandidat setelah menambahkan kandidat baru */
  const refreshAfterAdd = useCallback(async () => {
    await refreshCandidates();
  }, [refreshCandidates]);

  /** Update kandidat */
  const updateCandidate = useCallback(
    async (payload: UpdateCandidatePayload & { id: number }) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await candidateService.update(payload.id, payload);
        const withStatus: CandidateWithStatus = {
          ...updated,
          localStatus:
            candidates.find((c) => c.id === payload.id)?.localStatus || "Pending",
        };
        setCandidates((prev) =>
          prev.map((c) => (c.id === payload.id ? withStatus : c))
        );
        if (selected?.id === payload.id) setSelected(withStatus);
        return withStatus;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selected, candidates]
  );

  /** Hapus kandidat */
  const removeCandidate = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        await candidateService.remove(id);
        setCandidates((prev) => prev.filter((c) => c.id !== id));
        if (selected?.id === id) setSelected(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selected]
  );

  /** Update status lokal kandidat */
  const updateCandidateStatus = useCallback(
    (id: number, status: "Pending" | "Invited") => {
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, localStatus: status } : c))
      );
      if (selected?.id === id) {
        setSelected({ ...selected, localStatus: status });
      }
    },
    [selected]
  );

  /** Auto load awal */
  useEffect(() => {
    refreshCandidates();
  }, [refreshCandidates]);

  return {
    candidates,
    selected,
    loading,
    error,
    fieldErrors,
    setError,
    refreshCandidates,
    refreshAfterAdd,
    fetchCandidateById,
    addCandidate,
    updateCandidate,
    removeCandidate,
    updateCandidateStatus,
  };
}
