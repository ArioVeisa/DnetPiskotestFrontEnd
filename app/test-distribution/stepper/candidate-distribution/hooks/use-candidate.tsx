"use client";

import { useState, useEffect, useCallback } from "react";
import {
  candidateService,
  Candidate,
  CreateCandidatePayload,
  UpdateCandidatePayload,
} from "../service/candidate-service";
import { importCandidatesFromXlsx, downloadCandidateTemplate } from "../services/candidate-import-service";
import { AxiosError } from "axios";

/** Kandidat dengan status tambahan di frontend */
export interface CandidateWithStatus extends Candidate {
  localStatus: "Pending" | "Invited";
  isDraft?: boolean;
}

export function useCandidates(testId?: number, options?: { autoLoad?: boolean }) {
  const [candidates, setCandidates] = useState<CandidateWithStatus[]>([]);
  const [selected, setSelected] = useState<CandidateWithStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /** Helper: tambahkan default status "Pending" */
  const normalizeCandidates = (data: Candidate[]): CandidateWithStatus[] =>
    data.map((c) => ({ ...c, localStatus: "Pending", isDraft: false }));

  const storageKey = testId ? `draft_candidates_${testId}` : undefined;

  const readDrafts = (): CandidateWithStatus[] => {
    if (!storageKey) return [];
    try {
      const raw = localStorage.getItem(storageKey);
      const arr: unknown[] = raw ? JSON.parse(raw) : [];
      return arr.map((c: any) => ({
        id: c.id ?? (-Date.now() + Math.floor(Math.random() * 1000)), // Gunakan ID yang tersimpan jika ada
        ...(typeof c === 'object' && c !== null ? c : {}),
        localStatus: "Pending",
        isDraft: c.isDraft ?? true, // Gunakan status draft yang tersimpan
        created_at: c.created_at ?? new Date().toISOString(),
        updated_at: c.updated_at ?? new Date().toISOString(),
      })) as CandidateWithStatus[];
    } catch {
      return [];
    }
  };

  const writeDrafts = (items: CandidateWithStatus[]) => {
    if (!storageKey) return;
    // Simpan semua candidates (draft dan non-draft) dengan ID untuk backup
    const payload = items.map((c) => ({
      id: c.id, // Simpan ID untuk memastikan data tidak hilang
      nik: c.nik,
      name: c.name,
      phone_number: c.phone_number,
      email: c.email,
      position: c.position,
      birth_date: c.birth_date,
      gender: (c.gender as "male" | "female") ?? "male",
      department: c.department,
      isDraft: c.isDraft ?? false, // Simpan status draft
    }));
    localStorage.setItem(storageKey, JSON.stringify(payload));
  };

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

  // Load draft candidates saat pertama kali mount
  useEffect(() => {
    if (testId && options?.autoLoad !== false) {
      const drafts = readDrafts();
      if (drafts.length > 0) {
        // Load dari localStorage (termasuk yang sudah di-update)
        setCandidates(drafts);
        console.log(`✅ Loaded ${drafts.length} candidates from localStorage (including updated ones)`);
      } else {
        // Jika tidak ada draft, coba load dari backend (jika sudah ada test distribution)
        // Tapi di step 2, belum ada test distribution, jadi skip
        console.log(`ℹ️ No draft candidates found for test ${testId}`);
      }
    }
  }, [testId, options?.autoLoad]);

  /** Ambil detail kandidat */
  const fetchCandidateById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await candidateService.fetchById(id);
      const withStatus: CandidateWithStatus = { ...data, localStatus: "Pending" } as CandidateWithStatus;
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

  /** Tambah kandidat sebagai draft (belum simpan DB) */
  const addCandidate = useCallback(async (payload: CreateCandidatePayload) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      if (!testId) {
        throw new Error('Test ID is required to add candidate');
      }

      const draft: CandidateWithStatus = {
        id: -Date.now(),
        localStatus: "Pending",
        isDraft: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...payload,
      } as unknown as CandidateWithStatus;

      setCandidates((prev) => {
        // Cek duplicate berdasarkan NIK atau email
        const existingNiks = new Set(prev.map(c => c.nik));
        const existingEmails = new Set(prev.map(c => c.email));
        
        if (existingNiks.has(payload.nik) || existingEmails.has(payload.email)) {
          throw new Error('NIK atau email sudah ada dalam daftar kandidat');
        }
        
        const next = [draft, ...prev];
        writeDrafts(next);
        return next;
      });

      console.log(`✅ Candidate saved as draft`);
      return draft;
    } catch (err) {
      if (err instanceof AxiosError) {
        const errorData = err.response?.data as { errors?: Record<string, string[]>; message?: string };
        if (err.response?.status === 422 && errorData?.errors) {
          const errors: Record<string, string[]> = errorData.errors;
          const fieldErrors: Record<string, string> = {};
          Object.entries(errors).forEach(([field, msgs]) => {
            if ((msgs as string[]).length > 0) fieldErrors[field] = (msgs as string[])[0];
          });
          setFieldErrors(fieldErrors);
          setError(null);
        } else if (errorData?.message) {
          setError(errorData.message);
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
        const current = candidates.find((c) => c.id === payload.id);
        if (current?.isDraft) {
          const next = candidates.map((c) => (c.id === payload.id ? { ...c, ...payload } as CandidateWithStatus : c));
          setCandidates(next);
          writeDrafts(next);
          return next.find((c) => c.id === payload.id)!;
        } else {
          console.log(`✏️ Updating candidate with ID: ${payload.id}`, payload);
          const updated = await candidateService.update(payload.id, payload);
          const withStatus: CandidateWithStatus = {
            ...updated,
            localStatus: current?.localStatus || "Pending",
            isDraft: false,
          } as CandidateWithStatus;
          
          // Update state dengan data terbaru dari backend
          const updatedList = candidates.map((c) => (c.id === payload.id ? withStatus : c));
          setCandidates(updatedList);
          
          // Simpan semua candidates (termasuk yang sudah di-update) ke localStorage
          // untuk memastikan data tidak hilang saat refresh
          if (storageKey) {
            // Pastikan data tersimpan dengan benar
            writeDrafts(updatedList);
            console.log(`💾 Saved ${updatedList.length} candidates to localStorage after update`);
          }
          
          if (selected?.id === payload.id) setSelected(withStatus);
          
          console.log(`✅ Candidate updated in state and localStorage:`, withStatus);
          return withStatus;
        }
      } catch (err) {
        console.error('❌ Error updating candidate:', err);
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selected?.id, candidates, storageKey]
  );

  /** Hapus kandidat */
  const removeCandidate = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        const current = candidates.find((c) => c.id === id);
        if (current?.isDraft) {
          const filtered = candidates.filter((c) => c.id !== id);
          setCandidates(filtered);
          writeDrafts(filtered);
        } else {
          console.log(`🗑️ Removing candidate with ID: ${id}`);
          await candidateService.remove(id);
          setCandidates((prev) => prev.filter((c) => c.id !== id));
        }
        if (selected?.id === id) setSelected(null);
      } catch (err) {
        console.error('❌ Error removing candidate:', err);
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selected?.id, candidates]
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

  /** Auto load candidates yang sudah di-add untuk test ini (bisa dimatikan) */
  useEffect(() => {
    const shouldAutoLoad = options?.autoLoad !== false;
    if (shouldAutoLoad && testId) {
      console.log(`🔄 Auto-loading candidates for test ${testId}`);
      refreshCandidates();
    } else if (!shouldAutoLoad) {
      const drafts = readDrafts();
      setCandidates(drafts);
      console.log(`ℹ️ Auto-load disabled, loaded ${drafts.length} drafts from storage`);
    }
  }, [testId, refreshCandidates, options?.autoLoad]);

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
    /** Simpan seluruh draft ke backend untuk distribution tertentu dan kembalikan daftar ID final */
    saveDraftsTo: async (distributionId: number): Promise<number[]> => {
      const drafts = candidates.filter((c) => c.isDraft);
      console.log(`💾 Saving ${drafts.length} drafts to distribution ${distributionId}`);
      
      if (drafts.length === 0) {
        // Tidak ada draft, ambil ID dari backend agar akurat
        const backendNow = await candidateService.getTestDistributionCandidates(distributionId);
        const ids = backendNow.map((c) => c.id);
        console.log(`📋 No drafts, returning existing IDs:`, ids);
        setCandidates(normalizeCandidates(backendNow));
        return ids;
      }
      
      const createdIds: number[] = [];
      for (const d of drafts) {
        console.log(`➕ Saving draft:`, d.name, d.email);
        const created = await candidateService.addToTestDistribution({
          test_distribution_id: distributionId,
          nik: d.nik,
          name: d.name,
          email: d.email,
          phone_number: d.phone_number,
          position: d.position,
          birth_date: d.birth_date,
          gender: (d.gender as "male" | "female") ?? "male",
          department: d.department,
        });
        console.log(`✅ Created candidate:`, created);
        createdIds.push(created.id);
      }
      
      const backend = await candidateService.getTestDistributionCandidates(distributionId);
      const list = normalizeCandidates(backend);
      setCandidates(list);
      if (storageKey) localStorage.removeItem(storageKey);
      
      const finalIds = backend.map((c) => c.id);
      console.log(`🎯 Final candidate IDs for distribution ${distributionId}:`, finalIds);
      return finalIds;
    },

    /** Import candidates dari Excel */
    importFromExcel: async (file: File, token: string) => {
      if (!testId) {
        throw new Error('Test Package ID is required for import');
      }

      setLoading(true);
      setError(null);
      try {
        const result = await importCandidatesFromXlsx(file, testId, token);
        
        // Simpan candidates ke local cache sebagai draft
        if (result.candidates && result.candidates.length > 0) {
          const draftCandidates: CandidateWithStatus[] = result.candidates.map((c, index) => ({
            id: -Date.now() - index, // Negative ID untuk draft
            nik: c.nik,
            name: c.name,
            email: c.email,
            phone_number: c.phone_number,
            position: c.position,
            birth_date: c.birth_date,
            gender: c.gender as "male" | "female",
            department: c.department,
            localStatus: "Pending",
            isDraft: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));
          
          // Gabungkan dengan candidates yang sudah ada, hindari duplicate
          const existingCandidates = readDrafts();
          const existingNiks = new Set(existingCandidates.map(c => c.nik));
          const existingEmails = new Set(existingCandidates.map(c => c.email));
          
          // Filter out candidates yang sudah ada (berdasarkan NIK atau email)
          const newCandidates = draftCandidates.filter(candidate => 
            !existingNiks.has(candidate.nik) && !existingEmails.has(candidate.email)
          );
          
          if (newCandidates.length > 0) {
            const allCandidates = [...existingCandidates, ...newCandidates];
            setCandidates(allCandidates);
            writeDrafts(allCandidates);
            console.log(`✅ Added ${newCandidates.length} new candidates (${draftCandidates.length - newCandidates.length} duplicates skipped)`);
          } else {
            console.log(`ℹ️ All ${draftCandidates.length} candidates already exist, no duplicates added`);
          }
          
          console.log(`✅ Imported ${result.candidates.length} candidates to local cache as drafts`);
        }
        
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Gagal mengimpor kandidat';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },

    /** Download template Excel */
    downloadTemplate: async () => {
      try {
        await downloadCandidateTemplate();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Gagal mendownload template';
        setError(errorMessage);
        throw err;
      }
    },

    /** Clear all draft candidates */
    clearDrafts: () => {
      if (storageKey) {
        localStorage.removeItem(storageKey);
        setCandidates([]);
        console.log('✅ All draft candidates cleared');
      }
    },
  };
}
