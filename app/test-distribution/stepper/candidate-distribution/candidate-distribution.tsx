// app/test-distribution/stepper/candidate-distribution/candidate-distribution.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  MoreVertical,
  Trash2,
  Loader2,
  Check,
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import SessionDate from "./dialogs/session-date";

// hooks & services
import type { CandidateWithStatus } from "./hooks/use-candidate";
import { useCandidates } from "./hooks/use-candidate";
import { useInviteEmail } from "./hooks/use-invite-email";
import { useUpdatePackage } from "./hooks/use-update-package";
import { useCreateDistribution } from "./hooks/use-create-distribution";
import type {
  Candidate,
  CreateCandidatePayload,
} from "./service/candidate-service";

// dialogs
import AddCandidateDialog from "./dialogs/add-candidates-dialog";
import ImportCandidatesDialog from "./dialogs/import-candidates-dialog";

/* =============================
   helpers
   ============================= */
function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 1)
    .toUpperCase();
}

function shortName(name: string) {
  return name.split(" ").slice(0, 1).join(" ");
}

type Props = {
  onBack: () => void;
  onNext: () => void;
  testPackageId: number;
};

/* =============================
   COMPONENT
   ============================= */
export default function CandidatesDistributions({
  onBack,
  onNext,
  testPackageId,
}: Props) {
  // local state
  // local state
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [sessionEnd, setSessionEnd] = useState<Date | null>(null);
  const [sentAll, setSentAll] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  // Load session settings from localStorage on mount
  useEffect(() => {
    const savedStart = localStorage.getItem(`session_start_${testPackageId}`);
    const savedEnd = localStorage.getItem(`session_end_${testPackageId}`);
    
    if (savedStart) {
      setSessionStart(new Date(savedStart));
    }
    if (savedEnd) {
      setSessionEnd(new Date(savedEnd));
    }
  }, [testPackageId]);

  // Save session settings to localStorage when changed
  useEffect(() => {
    if (sessionStart) {
      localStorage.setItem(`session_start_${testPackageId}`, sessionStart.toISOString());
    }
  }, [sessionStart, testPackageId]);

  useEffect(() => {
    if (sessionEnd) {
      localStorage.setItem(`session_end_${testPackageId}`, sessionEnd.toISOString());
    }
  }, [sessionEnd, testPackageId]);

  useEffect(() => {
    localStorage.setItem(`sent_all_${testPackageId}`, sentAll.toString());
  }, [sentAll, testPackageId]);

  // State untuk trigger re-render kandidat list saja
  const [candidateListKey, setCandidateListKey] = useState(0);

  // hooks for candidates management
  const {
    candidates,
    loading: candidateLoading,
    error: candidateError,
    fieldErrors: candidateFieldErrors,
    setError,
    addCandidate,
    updateCandidate,
    removeCandidate,
    refreshAfterAdd,
    refreshCandidates,
    saveDraftsTo,
    importFromExcel,
    downloadTemplate,
  } = useCandidates(testPackageId, { autoLoad: false });

  // hooks for email invitation
  const {
    loading: inviteLoading,
    error: inviteError,
    result: inviteResult,
    sendInvite,
  } = useInviteEmail();

  // hooks for updating test package dates
  const {
    loading: packageLoading,
    error: packageError,
    updatePackage,
  } = useUpdatePackage();

  // hooks for creating new distribution
  const {
    loading: createLoading,
    error: createError,
    createDistribution,
  } = useCreateDistribution();

  // Load candidates from localStorage on mount (karena autoLoad: false)
  useEffect(() => {
    if (testPackageId) {
      const storageKey = `draft_candidates_${testPackageId}`;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const drafts = JSON.parse(raw);
          if (Array.isArray(drafts) && drafts.length > 0) {
            // Candidates akan di-load oleh hook, tapi kita pastikan data tersedia
            console.log(`📋 Found ${drafts.length} candidates in localStorage for test ${testPackageId}`);
          }
        }
      } catch (err) {
        console.error('Error reading candidates from localStorage:', err);
      }
    }
  }, [testPackageId]);

  // Load sentAll state from localStorage after candidates are loaded
  useEffect(() => {
    const savedSentAll = localStorage.getItem(`sent_all_${testPackageId}`);
    
    // Only set sentAll to true if there are actually candidates and invitations were sent
    // For new distributions, always start with sentAll = false
    if (savedSentAll === 'true' && candidates.length > 0) {
      setSentAll(true);
    } else {
      setSentAll(false);
    }
  }, [testPackageId, candidates.length]);

  // Reset sentAll if no candidates
  useEffect(() => {
    if (candidates.length === 0 && sentAll) {
      setSentAll(false);
    }
  }, [candidates.length, sentAll]);

  function formatDate(date: Date | null): string | undefined {
    if (!date) return undefined;
    // Bangun string tanggal lokal (YYYY-MM-DD) tanpa konversi timezone ke UTC
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /* =========== actions =========== */
  const handleImportExcel = async (file: File) => {
    try {
      const token = localStorage.getItem('token') || '';
      await importFromExcel(file, token);
      setImportOpen(false);
    } catch (error) {
      // Error sudah ditangani di hook
      console.error('Import failed:', error);
    }
  };

  async function handleSendAll() {
    if (!sessionStart || !sessionEnd) {
      alert("Pilih start & end date dulu.");
      return;
    }
    if (candidates.length === 0) {
      alert("Tambahkan minimal 1 kandidat.");
      return;
    }

    try {
      // 1. Create new test distribution from package
      console.log('🚀 Creating new distribution from package:', testPackageId);
      const distributionResult = await createDistribution({
        test_id: testPackageId,
        session_name: 'Test Distribution Session', // Backend will generate name with date
        start_date: formatDate(sessionStart)!,
        end_date: formatDate(sessionEnd)!,
      });

      const newDistributionId = distributionResult.data.id;
      console.log('✅ New distribution created with ID:', newDistributionId);

      // 2. Persist drafts then send invitations using finalized IDs from backend
      const candidateIds = await saveDraftsTo(newDistributionId);
      console.log('📧 Sending invitations to candidates:', candidateIds);
      
      try {
        await sendInvite({
          candidate_ids: candidateIds,
          test_distribution_id: newDistributionId, // kirim ID distribusi sesuai backend
          custom_message: "Anda diundang untuk mengikuti tes psikotes.",
          token: localStorage.getItem('token') || '',
        });

        setSentAll(true); // ✅ Set sentAll setelah berhasil
        console.log('✅ Invitations sent successfully');
      } catch (inviteError) {
        console.error('❌ Error sending invitations:', inviteError);
        // Tampilkan error message ke user
        const errorMessage = inviteError instanceof Error 
          ? inviteError.message 
          : 'Gagal mengirim undangan email. Silakan coba lagi.';
        alert(errorMessage);
        // Jangan set sentAll jika gagal
        throw inviteError; // Re-throw untuk ditangani di catch block luar
      }
    } catch (error) {
      console.error('❌ Error in handleSendAll:', error);
      // Error sudah ditangani, loading state akan direset oleh hook
      // Jangan set sentAll jika ada error
    }
  }

  /* =============================
     RENDER
     ============================= */
  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-8 pb-20"> {/* Added pb-20 for sticky footer space */}
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
        <div>
          <h2 className="font-bold text-2xl mb-1">Manage Candidates</h2>
          <p className="text-gray-500 text-sm mb-2">
            Add candidates and manage test distribution
          </p>
          {candidates.length > 0 && (
            <p className="text-xs text-blue-600 mb-4">
              {candidates.length} candidate{candidates.length > 1 ? 's' : ''} added to this test
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setImportOpen(true)}
            disabled={sentAll || candidateLoading}
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Candidate
          </Button>
          <Button
            onClick={() => {
              setAddOpen(true);
              setError(null);
            }}
            disabled={sentAll || candidateLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* ===== ERROR DISPLAY ===== */}
      {(candidateError || inviteError || packageError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {candidateError || inviteError || packageError}
        </div>
      )}

      {/* ===== LOADING ===== */}
      {candidateLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading candidates...</span>
        </div>
      )}

      {/* ===== LIST ===== */}
      <div key={candidateListKey}>
        {!candidateLoading && candidates.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400 text-sm">
            <div className="space-y-3">
              <div className="text-lg font-medium text-gray-600">
                Belum ada kandidat untuk test ini
              </div>
              <div className="space-y-2">
                <p>• Klik <strong>Add Candidate</strong> untuk menambahkan kandidat baru</p>
                <p>• Setiap kandidat harus dibuat khusus untuk test ini</p>
              </div>
            </div>
          </div>
        ) : (
        !candidateLoading && (
          <div className="flex flex-col space-y-3 mb-10">
            {candidates.map((c) => {
              return (
                <div
                  key={c.id}
                  className="relative flex flex-col sm:flex-row items-start sm:items-center bg-white border rounded-xl px-4 py-3 w-full hover:bg-blue-50 gap-3"
                >
                  {/* Row actions */}
                  <div className="absolute right-3 top-3 flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 p-0"
                          disabled={sentAll || candidateLoading}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await removeCandidate(c.id);
                              console.log(`✅ Kandidat ${c.name} berhasil dihapus`);
                            } catch (error) {
                              console.error('❌ Error deleting candidate:', error);
                            }
                          }}
                          className="text-red-600"
                          disabled={sentAll || candidateLoading}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Avatar & Info */}
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-black">
                      {initials(c.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {shortName(c.name)}
                      </div>
                      <div className="text-gray-500 text-xs truncate">
                        {c.email}
                      </div>
                      <div className="text-gray-400 text-xs truncate">
                        {c.position} • {c.department}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
      </div>

      {/* ===== SESSION SETTINGS ===== */}
      <div className="mb-8">
        <h3 className="font-bold text-lg mb-3">Session Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SessionDate
            label="Start Date"
            value={sessionStart}
            onChange={setSessionStart}
            disabled={sentAll}
          />
          <SessionDate
            label="End Date"
            value={sessionEnd}
            onChange={setSessionEnd}
            disabled={sentAll}
          />
        </div>
        {sentAll && (
          <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
            <Check className="w-4 h-4" /> Invitations sent — schedule locked.
          </p>
        )}
      </div>

      {/* ===== INVITE RESULT ===== */}
      {inviteResult && (
        <div className={`mb-6 p-4 border rounded-lg ${
          inviteResult.success 
            ? inviteResult.failed_count && inviteResult.failed_count > 0
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <h4 className={`font-semibold mb-2 ${
            inviteResult.success 
              ? inviteResult.failed_count && inviteResult.failed_count > 0
                ? 'text-yellow-800'
                : 'text-green-800'
              : 'text-red-800'
          }`}>
            Invitation Results:
          </h4>
          <p className={
            inviteResult.success 
              ? inviteResult.failed_count && inviteResult.failed_count > 0
                ? 'text-yellow-700'
                : 'text-green-700'
              : 'text-red-700'
          }>{inviteResult.message}</p>
          
          {/* Warning message (e.g., MAIL_MAILER=log) */}
          {inviteResult.warning && (
            <div className="mt-3 p-3 bg-orange-100 border border-orange-300 rounded">
              <p className="text-sm font-semibold text-orange-800">⚠️ Warning:</p>
              <p className="text-sm text-orange-700">{inviteResult.warning}</p>
            </div>
          )}
          
          {/* Success count */}
          {inviteResult.success_count !== undefined && inviteResult.success_count > 0 && (
            <div className="mt-2">
              <p className="text-sm text-green-600">
                ✅ Successfully invited: {inviteResult.success_count} candidates
              </p>
            </div>
          )}
          
          {/* Failed emails */}
          {inviteResult.failed_count !== undefined && inviteResult.failed_count > 0 && (
            <div className="mt-3">
              <p className="text-sm font-semibold text-red-700 mb-2">
                ❌ Failed to send email to {inviteResult.failed_count} candidate(s):
              </p>
              <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                {inviteResult.failed_emails?.map((failed, index) => (
                  <li key={index}>
                    <span className="font-medium">{failed.name}</span> ({failed.email}): {failed.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Duplicate candidates */}
          {inviteResult.duplicate && inviteResult.duplicate.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-yellow-600">
                ⚠️ Skipped: {inviteResult.duplicate.length} candidates (already invited)
              </p>
            </div>
          )}
        </div>
      )}

      {/* ===== NAV STICKY ===== */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[260px] border-t bg-white py-3 px-6 md:px-8 flex justify-between gap-3 shadow-lg z-50">
        <Button variant="outline" type="button" onClick={onBack}>
          Back
        </Button>

        <div className="flex gap-2">
          {!sentAll && (
            <Button
              type="button"
              onClick={handleSendAll}
              disabled={
                packageLoading ||
                inviteLoading ||
                createLoading ||
                !sessionStart ||
                !sessionEnd ||
                candidates.length === 0
              }
              className="bg-blue-500 text-white"
            >
              {packageLoading || inviteLoading || createLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {packageLoading || inviteLoading || createLoading ? "Sending..." : "Send All"}
            </Button>
          )}

          {sentAll && (
            <Button
              type="button"
              onClick={onNext}
              className="bg-green-500 text-white"
            >
              Finish
            </Button>
          )}
        </div>
      </div>

      {/* ===== DIALOGS ===== */}
      <AddCandidateDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={async (formData: CreateCandidatePayload) => {
          try {
            await addCandidate(formData);
            setAddOpen(false);
          } catch {
            // Error sudah ditangani di hook
          }
        }}
        saving={candidateLoading}
        error={candidateError}
        fieldErrors={candidateFieldErrors}
      />

      <ImportCandidatesDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onUploadExcel={handleImportExcel}
        uploading={candidateLoading}
        error={candidateError}
      />
    </div>
  );
}
