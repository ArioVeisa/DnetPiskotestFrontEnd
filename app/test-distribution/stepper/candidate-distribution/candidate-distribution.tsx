// app/test-distribution/stepper/candidate-distribution/candidate-distribution.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
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

  // hooks for candidates management
  const {
    candidates,
    loading: candidateLoading,
    error: candidateError,
    setError,
    addCandidate,
    updateCandidate,
    removeCandidate,
  } = useCandidates();

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
      await sendInvite({
        candidate_ids: candidateIds,
        test_id: testPackageId,
        custom_message: "Anda diundang untuk mengikuti tes psikotes.",
        token: "test-token",
      });

      setSentAll(true); // ✅ cukup ini
      // ❌ jangan langsung onNext()
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
          <p className="text-gray-500 text-sm mb-6">
            Add candidates and manage test distribution
          </p>
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
            Add Candidates
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
          Belum ada kandidat. Tambahkan kandidat terlebih dahulu.
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
                          disabled={sentAll}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelected(c);
                            setDetailOpen(true);
                          }}
                          disabled={sentAll}
                        >
                          <Eye className="w-4 h-4 mr-2" /> View / Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              await sendInvite({
                                candidate_ids: [c.id],
                                test_id: testPackageId,
                                custom_message:
                                  "Pengiriman ulang undangan tes psikotes.",
                                token: "test-token",
                              });
                              alert("Undangan berhasil dikirim ulang!");
                            } catch {
                              alert("Gagal mengirim ulang undangan");
                            }
                          }}
                          disabled={inviteLoading}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          {inviteLoading ? "Sending..." : "Send Invite"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            if (
                              confirm("Yakin ingin menghapus kandidat ini?")
                            ) {
                              removeCandidate(c.id);
                            }
                          }}
                          className="text-red-600"
                          disabled={sentAll}
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
                Successfully invited:{" "}
                {inviteResult.data.filter((d) => d.status === "Invited").length}{" "}
                candidates
              </p>
              {inviteResult.data.filter((d) => d.status === "Failed").length >
                0 && (
                <p className="text-sm text-red-600">
                  Failed:{" "}
                  {
                    inviteResult.data.filter((d) => d.status === "Failed")
                      .length
                  }{" "}
                  candidates
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
            setAddOpen(false);
          } catch {
            // Error sudah ditangani di hook
          }
        }}
        saving={candidateLoading}
        error={candidateError}
      />

      <CandidateDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        candidate={selected}
        onSave={async (payload: CreateCandidatePayload) => {
          // pastikan selected ada (harus ada karena dialog dibuka untuk kandidat tertentu)
          if (!selected) return;

          try {
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
            setDetailOpen(false);
            setSelected(null);
          } catch (err) {
            // tangani error sesuai kebijakan (atau biarkan hook/handler global menangani)
            console.error(err);
          }
        }}
        saving={candidateLoading}
        error={candidateError}
      />
    </div>
  );
}
