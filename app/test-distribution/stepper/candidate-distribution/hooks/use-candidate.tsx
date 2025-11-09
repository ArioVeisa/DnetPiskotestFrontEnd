"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  
  // Ref untuk menyimpan candidates terbaru (untuk menghindari closure issues)
  const candidatesRef = useRef<CandidateWithStatus[]>([]);
  
  // Update ref setiap kali candidates berubah
  useEffect(() => {
    candidatesRef.current = candidates;
  }, [candidates]);

  /** Helper: tambahkan default status "Pending" */
  const normalizeCandidates = (data: Candidate[]): CandidateWithStatus[] =>
    data.map((c) => ({ ...c, localStatus: "Pending", isDraft: false }));

  const storageKey = testId ? `draft_candidates_${testId}` : undefined;

  const readDrafts = (): CandidateWithStatus[] => {
    if (!storageKey) return [];
    try {
      const raw = localStorage.getItem(storageKey);
      const arr: unknown[] = raw ? JSON.parse(raw) : [];
      return arr.map((c: unknown) => {
        const candidate = c as Record<string, unknown>;
        return {
          id: candidate.id ?? (-Date.now() + Math.floor(Math.random() * 1000)), // Gunakan ID yang tersimpan jika ada
          ...(typeof c === 'object' && c !== null ? c : {}),
          localStatus: "Pending",
          isDraft: candidate.isDraft ?? true, // Gunakan status draft yang tersimpan
          created_at: candidate.created_at ?? new Date().toISOString(),
          updated_at: candidate.updated_at ?? new Date().toISOString(),
        } as CandidateWithStatus;
      });
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
      } else {
        // No testId, set empty array
        setCandidates([]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  // Load draft candidates saat pertama kali mount
  // Hapus useEffect ini karena sudah di-handle di useEffect yang lebih bawah

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
        // Langsung load dari localStorage sebagai source of truth
        // Ini memastikan kita selalu mendapatkan data terbaru, bahkan jika state kosong
        let sourceCandidates: CandidateWithStatus[] = [];
        
        // Load dari localStorage terlebih dahulu (source of truth untuk draft candidates)
        if (storageKey) {
          const drafts = readDrafts();
          if (drafts.length > 0) {
            sourceCandidates = drafts;
          }
        }

        // Jika tidak ada di localStorage, gunakan state dari ref (selalu ter-update)
        if (sourceCandidates.length === 0) {
          sourceCandidates = candidatesRef.current;
        }

        // Jika masih kosong, berarti memang tidak ada candidate
        if (sourceCandidates.length === 0) {
          setLoading(false);
          throw new Error(`No candidates found. Cannot update candidate with ID: ${payload.id}`);
        }

        // Cari candidate yang akan di-update
        const currentCandidate = sourceCandidates.find((c) => c.id === payload.id);
        
        if (!currentCandidate) {
          setLoading(false);
          throw new Error(`Candidate not found with ID: ${payload.id}`);
        }

        // Buat updated candidate
        const updatedCandidate: CandidateWithStatus = {
          ...currentCandidate,
          ...payload,
          localStatus: currentCandidate.localStatus || "Pending",
          isDraft: currentCandidate.isDraft ?? true,
          updated_at: new Date().toISOString(),
        } as CandidateWithStatus;

        // Update state dan localStorage dalam satu operasi menggunakan functional update
        setCandidates((prevCandidates) => {
          // Gunakan sourceCandidates yang sudah kita load sebagai source of truth
          // Jika sourceCandidates kosong (tidak mungkin karena sudah di-check di atas),
          // gunakan prevCandidates sebagai fallback
          const candidatesToUpdate = sourceCandidates.length > 0 ? sourceCandidates : prevCandidates;
          const updatedList = candidatesToUpdate.map((c) => (c.id === payload.id ? updatedCandidate : c));
          
          // Simpan ke localStorage
          if (storageKey) {
            writeDrafts(updatedList);
          }
          
          return updatedList;
        });
        
        // Reset loading SETELAH state update selesai
        // Pastikan loading di-reset sebelum return untuk menghindari freeze
        setLoading(false);
        
        // Return updated candidate
        return updatedCandidate;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        setLoading(false);
        throw err;
      }
    },
    [storageKey]
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
          await candidateService.remove(id);
          setCandidates((prev) => prev.filter((c) => c.id !== id));
        }
        if (selected?.id === id) setSelected(null);
      } catch (err) {
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
    if (!testId) return;
    
    const shouldAutoLoad = options?.autoLoad !== false;
    if (shouldAutoLoad) {
      refreshCandidates();
    } else {
      // Meskipun autoLoad: false, kita tetap load dari localStorage
      // untuk memastikan candidates tersedia untuk edit
      const drafts = readDrafts();
      if (drafts.length > 0) {
        setCandidates(drafts);
      }
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
