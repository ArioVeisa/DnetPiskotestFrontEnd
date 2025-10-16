// app/test-distribution/stepper/candidate-distribution/candidate-distribution.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  User,
  MoreVertical,
  Eye,
  Trash2,
  Loader2,
  Check,
  Mail,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import SessionDate from "./dialogs/session-date";

// hooks & services
import type { CandidateWithStatus } from "./hooks/use-candidate";
import { useCandidates } from "./hooks/use-candidate";
import { useInviteEmail } from "./hooks/use-invite-email";
import { useUpdatePackage } from "./hooks/use-update-package";
import type {
  Candidate,
  CreateCandidatePayload,
} from "./service/candidate-service";

// dialogs
import AddCandidateDialog from "./dialogs/add-candidates-dialog";
import CandidateDetailDialog from "./dialogs/candidate-detail-dialog";

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
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Candidate | null>(null);

  // Load session settings from localStorage on mount
  useEffect(() => {
    const savedStart = localStorage.getItem(`session_start_${testPackageId}`);
    const savedEnd = localStorage.getItem(`session_end_${testPackageId}`);
    const savedSentAll = localStorage.getItem(`sent_all_${testPackageId}`);
    
    if (savedStart) {
      setSessionStart(new Date(savedStart));
    }
    if (savedEnd) {
      setSessionEnd(new Date(savedEnd));
    }
    if (savedSentAll === 'true') {
      setSentAll(true);
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
  } = useCandidates(testPackageId);

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

  // status style
  const STATUS_STYLE: Record<string, string> = {
    Pending: "border-blue-200 bg-blue-50 text-blue-600",
    Invited: "border-green-200 bg-green-50 text-green-600",
  };

  function getStatus(
    candidate: CandidateWithStatus
  ): keyof typeof STATUS_STYLE {
    return candidate.localStatus ?? "Pending";
  }

  function formatDate(date: Date | null): string | undefined {
    if (!date) return undefined;
    return date.toISOString().split("T")[0];
  }

  /* =========== actions =========== */
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
      await updatePackage(testPackageId, {
        started_date: formatDate(sessionStart),
        ended_date: formatDate(sessionEnd),
      });

      const candidateIds = candidates.map((c) => c.id);
      console.log('📧 Sending invitations to candidates:', candidateIds);
      
      await sendInvite({
        candidate_ids: candidateIds,
        test_id: testPackageId,
        custom_message: "Anda diundang untuk mengikuti tes psikotes.",
        token: localStorage.getItem('token') || '',
      });

      setSentAll(true); // ✅ cukup ini
      
      // Trigger refresh di parent component setelah berhasil send all
      // Parent akan menangani refresh data dan kembali ke halaman utama
    } catch {
      // Error sudah ditangani di hook
    }
  }

  /* =============================
     RENDER
     ============================= */
  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-8">
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
        {!candidateLoading && candidates.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400 text-sm">
            <div className="space-y-3">
              <div className="text-lg font-medium text-gray-600">
                Belum ada kandidat untuk test ini
              </div>
              <div className="space-y-2">
                <p>• Klik <strong>"Add Candidate"</strong> untuk menambahkan kandidat baru</p>
                <p>• Setiap kandidat harus dibuat khusus untuk test ini</p>
              </div>
            </div>
          </div>
        ) : (
        !candidateLoading && (
          <div className="flex flex-col space-y-3 mb-10">
            {candidates.map((c) => {
              const status = getStatus(c);
              return (
                <div
                  key={c.id}
                  className="relative flex flex-col sm:flex-row items-start sm:items-center bg-white border rounded-xl px-4 py-3 w-full hover:bg-blue-50 gap-3"
                >
                  {/* Row actions & status */}
                  <div className="absolute right-3 top-3 flex items-center gap-2">
                    <span
                      className={`hidden sm:inline-block px-2 py-[2px] rounded-md text-[11px] font-medium ${STATUS_STYLE[status]}`}
                    >
                      {status}
                    </span>

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
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(c);
                            setDetailOpen(true);
                          }}
                          disabled={sentAll || candidateLoading}
                        >
                          <Eye className="w-4 h-4 mr-2" /> View / Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await sendInvite({
                                candidate_ids: [c.id],
                                test_id: testPackageId,
                                custom_message:
                                  "Pengiriman ulang undangan tes psikotes.",
                                token: localStorage.getItem('token') || '',
                              });
                              alert("Undangan berhasil dikirim ulang!");
                            } catch {
                              alert("Gagal mengirim ulang undangan");
                            }
                          }}
                          disabled={inviteLoading || candidateLoading}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          {inviteLoading ? "Sending..." : "Send Invite"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (
                              confirm("Yakin ingin menghapus kandidat ini?")
                            ) {
                              try {
                                await removeCandidate(c.id);
                                console.log(`✅ Kandidat ${c.name} berhasil dihapus`);
                              } catch (error) {
                                console.error('❌ Error deleting candidate:', error);
                                alert('Gagal menghapus kandidat');
                              }
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

                  {/* Status mobile */}
                  <div className="sm:hidden mt-1">
                    <span
                      className={`inline-block px-2 py-[2px] rounded-md text-[11px] font-medium ${STATUS_STYLE[status]}`}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

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
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">
            Invitation Results:
          </h4>
          <p className="text-green-700">{inviteResult.message}</p>
          {inviteResult.data && (
            <div className="mt-2">
              <p className="text-sm text-green-600">
                Successfully invited: {inviteResult.data.length} candidates
              </p>
              {inviteResult.duplicate && inviteResult.duplicate.length > 0 && (
                <p className="text-sm text-yellow-600">
                  Skipped: {inviteResult.duplicate.length} candidates (already invited)
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== NAV ===== */}
      <div className="flex justify-between gap-3 pt-8">
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
                !sessionStart ||
                !sessionEnd ||
                candidates.length === 0
              }
              className="bg-blue-500 text-white"
            >
              {packageLoading || inviteLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {packageLoading || inviteLoading ? "Sending..." : "Send All"}
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
            await refreshAfterAdd(); // Refresh daftar kandidat setelah menambah
            setAddOpen(false);
          } catch {
            // Error sudah ditangani di hook
          }
        }}
        saving={candidateLoading}
        error={candidateError}
        fieldErrors={candidateFieldErrors}
      />

      <CandidateDetailDialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setSelected(null);
            setError(null); // Clear error when dialog closes
          }
        }}
        candidate={selected}
        onSave={async (payload: CreateCandidatePayload) => {
          // pastikan selected ada (harus ada karena dialog dibuka untuk kandidat tertentu)
          if (!selected) return;

          try {
            console.log('💾 Updating candidate:', selected.id, payload);
            await updateCandidate({
              id: selected.id, // id diambil dari selected (backend butuh id)
              name: payload.name,
              email: payload.email,
              phone_number: payload.phone_number,
              position: payload.position,
              department: payload.department,
              birth_date: payload.birth_date,
              gender: payload.gender as "male" | "female",
            });
            console.log('✅ Candidate updated successfully');
            setDetailOpen(false);
            setSelected(null);
            setError(null); // Clear any errors
          } catch (err) {
            console.error('❌ Error updating candidate:', err);
            setError(err instanceof Error ? err.message : String(err));
            // Don't close dialog on error, let user see the error
          }
        }}
        saving={candidateLoading}
        error={candidateError}
      />
    </div>
  );
}
