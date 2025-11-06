"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Candidate } from "../services/candidates-service";
import { CandidateEditDialog } from "./candidates-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { useCandidates } from "../hooks/use-candidates";
import TableSkeleton from "./table-skeleton";
import { candidatesService } from "../services/candidates-service";

/* =======================================
   STYLE DEFINITIONS
======================================= */
const POSITION_STYLE: Record<string, string> = {
  "UI/UX Designer": "bg-blue-100 text-blue-700",
  "Quality Assurance": "bg-yellow-100 text-yellow-800",
  Engineer: "bg-green-100 text-green-700",
  "Frontend Dev": "bg-red-100 text-red-700",
};

const STATUS_STYLE: Record<"Active" | "Inactive", string> = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-500",
};

/* =======================================
   MAIN COMPONENT
======================================= */
export function CandidateTable() {
  const {
    candidates,
    loading,
    error,
    deleteCandidate: deleteCandidateFn,
    updateLocalCandidate,
  } = useCandidates();

  const [editCandidate, setEditCandidate] = useState<
    (Candidate & { phone: string }) | null
  >(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Candidate | null>(
    null
  );

  // PAGINATION
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(candidates.length / pageSize);
  const displayedCandidates = candidates.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  /* ===========================
     STATES
  =========================== */
  if (loading) return <TableSkeleton />;
  if (error) return <div className="text-red-500 mt-4">{error}</div>;

  if (candidates.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">
        No candidates have been added yet.
      </div>
    );
  }

  const emptyCandidate: Candidate & { phone: string } = {
    id: "",
    name: "",
    nik: "",
    phoneNumber: "",
    email: "",
    position: "",
    birthDate: "",
    gender: "",
    department: "",
    createdAt: "",
    updatedAt: "",
    status: "Active",
    phone: "",
  };

  return (
    <div>
      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-[900px] w-full table-auto">
          <thead>
            <tr className="text-gray-400 text-[15px] font-semibold">
              {["Candidates", "NIK", "Position", "Actions"].map((h) => (
                <th key={h} className="px-4 pb-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedCandidates.map((c) => (
              <tr key={c.id} className="bg-white">
                {/* Candidates */}
                <td className="px-6 py-4 flex items-center gap-3 align-middle">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-semibold">
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {c.name}
                    </div>
                    <div className="text-xs text-gray-500">{c.email}</div>
                  </div>
                </td>

                {/* NIK */}
                <td className="px-6 py-4 text-[13px] text-gray-800">{c.nik}</td>

                {/* Position */}
                <td className="px-6 py-4 align-middle">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
                      POSITION_STYLE[c.position] ?? "bg-gray-100 text-gray-500"
                    )}
                  >
                    {c.position}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 flex items-center gap-4 align-middle">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-700 px-2 py-2 rounded-md hover:bg-gray-100"
                      >
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="min-w-[140px] rounded-xl py-2 px-1 shadow-lg border border-gray-100"
                    >
                      <DropdownMenuItem
                        onSelect={() => setEditCandidate({ ...c, phone: c.phoneNumber })}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500"
                        onSelect={() => setDeleteCandidate(c)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD */}
      <div className="md:hidden space-y-4">
        {displayedCandidates.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-lg shadow-sm p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-semibold">
                  {c.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <div className="font-semibold text-gray-900">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.email}</div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded hover:bg-gray-100">
                    <MoreVertical className="h-5 w-5 text-gray-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[120px] bg-white rounded-md shadow-md"
                >
                  <DropdownMenuItem
                    onSelect={() => setEditCandidate({ ...c, phone: c.phoneNumber })}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500"
                    onSelect={() => setDeleteCandidate(c)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-3 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">NIK</span>
                <span className="font-medium text-gray-900">{c.nik}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Position</span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-semibold",
                    POSITION_STYLE[c.position] ?? "bg-gray-100 text-gray-500"
                  )}
                >
                  {c.position}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold",
                    STATUS_STYLE[c.status === "Active" ? "Active" : "Inactive"]
                  )}
                >
                  {c.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION FOOTER */}
      <div className="flex items-center justify-between mt-6 text-sm text-gray-600">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="text-sm rounded-lg"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="text-sm rounded-lg"
          >
            Next
          </Button>
        </div>
        <div className="hidden md:block">
          Showing page <span className="font-semibold">{page}</span> of{" "}
          <span className="font-semibold">{totalPages}</span> candidates
        </div>
      </div>

      {/* Edit Dialog (selalu mounted; kontrol via open) */}
      <CandidateEditDialog
        candidate={editCandidate ?? emptyCandidate}
        open={!!editCandidate}
        onOpenChange={(open: boolean) => {
          if (!open) setEditCandidate(null);
        }}
        onSave={async (updated) => {
          // Tutup dialog lebih dulu agar tidak terasa freeze saat request berjalan
          setEditCandidate(null);
          try {
            // Optimistic update ke UI
            updateLocalCandidate({
                id: updated.id,
                name: updated.name,
                nik: updated.nik,
                phoneNumber: updated.phone,
                email: updated.email,
                position: updated.position,
                birthDate: updated.birthDate,
                gender: updated.gender,
                department: updated.department,
              createdAt: updated.createdAt,
              updatedAt: new Date().toISOString(),
                status: updated.status,
            } as Candidate);

            // Persist ke DB (sinkronkan hasil akhir)
            const saved = await candidatesService.updateCandidate({
              id: updated.id,
              name: updated.name,
              nik: updated.nik,
              phoneNumber: updated.phone,
              email: updated.email,
              position: updated.position,
              birthDate: updated.birthDate,
              gender: updated.gender,
              department: updated.department,
              createdAt: updated.createdAt,
              updatedAt: updated.updatedAt,
              status: updated.status,
            } as Candidate);

            updateLocalCandidate(saved);
            // Hard refresh untuk memastikan state bersih dan hindari efek freeze
            setTimeout(() => {
              window.location.reload();
            }, 50);
            } catch (e) {
              console.error(e);
              alert(typeof e === "string" ? e : "Gagal menyimpan perubahan kandidat");
          }
        }}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteCandidate}
        title="Delete Candidate?"
        description={`Are you sure you want to delete "${deleteCandidate?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          if (!deleteCandidate) return;
          try {
            await deleteCandidateFn(deleteCandidate.id);
            window.location.reload();
          } catch {
            // Error logging removed for production
          } finally {
            setDeleteCandidate(null);
          }
        }}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
}
