"use client";

import { useState, useEffect, useCallback } from "react";
import {
  candidateService,
  Candidate,
  CreateCandidatePayload,
  UpdateCandidatePayload,
} from "../service/candidate-service";

/** Kandidat dengan status tambahan di frontend */
export interface CandidateWithStatus extends Candidate {
  localStatus: "Pending" | "Invited";
}

export function useCandidates() {
  const [candidates, setCandidates] = useState<CandidateWithStatus[]>([]);
  const [selected, setSelected] = useState<CandidateWithStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Helper: tambahkan default status "Pending" */
  const normalizeCandidates = (data: Candidate[]): CandidateWithStatus[] => {
    return data.map((c) => ({
      ...c,
      localStatus: "Pending",
    }));
  };

  /** Refresh semua kandidat */
  const refreshCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await candidateService.fetchAll();
      setCandidates(normalizeCandidates(data));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

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
    try {
      const created = await candidateService.create(payload);
      const withStatus: CandidateWithStatus = { ...created, localStatus: "Pending" };
      setCandidates((prev) => [...prev, withStatus]);
      return withStatus;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
    setError, // biar bisa di-clear manual dari luar
    refreshCandidates,
    fetchCandidateById,
    addCandidate,
    updateCandidate,
    removeCandidate,
    updateCandidateStatus,
  };
}
