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

  /** Refresh kandidat dari test distribution candidates table */
  const refreshCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (testId) {
        // Load candidates from test_distribution_candidates table
        const data = await candidateService.getTestDistributionCandidates(testId);
        setCandidates(normalizeCandidates(data));
        console.log(`✅ Loaded ${data.length} candidates from test distribution for test ${testId}`);
      } else {
        // No testId, set empty array
        setCandidates([]);
        console.log('ℹ️ No testId provided, setting empty candidates list');
      }
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
      if (!testId) {
        throw new Error('Test ID is required to add candidate');
      }

      console.log(`➕ Adding candidate to test distribution ${testId}:`, payload);
      const created = await candidateService.addToTestDistribution({
        ...payload,
        test_id: testId,
      });
      
      const withStatus: CandidateWithStatus = { ...created, localStatus: "Pending" };
      setCandidates((prev) => [withStatus, ...prev]); // Add to beginning of list
      console.log(`✅ Candidate added to test distribution and UI updated`);
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
  }, [testId]);

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
        console.log(`✏️ Updating candidate with ID: ${payload.id}`, payload);
        const updated = await candidateService.update(payload.id, payload);
        
        // Get current status before updating
        const currentCandidate = candidates.find((c) => c.id === payload.id);
        const withStatus: CandidateWithStatus = {
          ...updated,
          localStatus: currentCandidate?.localStatus || "Pending",
        };
        
        // Update candidates list
        setCandidates((prev) => {
          const updatedList = prev.map((c) => (c.id === payload.id ? withStatus : c));
          console.log(`✅ Candidate updated in UI`, updatedList.find(c => c.id === payload.id));
          return updatedList;
        });
        
        // Update selected if it's the same candidate
        if (selected?.id === payload.id) {
          setSelected(withStatus);
        }
        
        console.log(`✅ Candidate ${payload.id} successfully updated`);
        return withStatus;
      } catch (err) {
        console.error('❌ Error updating candidate:', err);
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selected?.id, candidates.length]
  );

  /** Hapus kandidat */
  const removeCandidate = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        console.log(`🗑️ Removing candidate with ID: ${id}`);
        await candidateService.remove(id);
        setCandidates((prev) => {
          const filtered = prev.filter((c) => c.id !== id);
          console.log(`✅ Candidate removed. Remaining: ${filtered.length}`);
          return filtered;
        });
        if (selected?.id === id) setSelected(null);
        console.log(`✅ Candidate ${id} successfully removed from UI`);
      } catch (err) {
        console.error('❌ Error removing candidate:', err);
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selected?.id]
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
    [selected?.id]
  );


  /** Auto load candidates yang sudah di-add untuk test ini */
  useEffect(() => {
    if (testId) {
      console.log(`🔄 Auto-loading candidates for test ${testId}`);
      refreshCandidates();
    }
  }, [testId, refreshCandidates]);

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
