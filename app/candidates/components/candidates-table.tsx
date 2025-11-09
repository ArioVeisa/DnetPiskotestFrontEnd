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

const STATUS_STYLE: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-purple-100 text-purple-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Expired: "bg-red-100 text-red-700",
  Inactive: "bg-gray-100 text-gray-500",
};

/* =======================================
   MAIN COMPONENT
======================================= */
export function CandidateTable({ 
  page, 
  pageSize 
}: { 
  page: number; 
  pageSize: number; 
}) {
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

  // PAGINATION - menggunakan props dari parent
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
        <table className="min-w-[1000px] w-full table-auto">
          <thead>
            <tr className="text-gray-400 text-[15px] font-semibold">
              {["Candidates", "NIK", "Position", "Status", "Actions"].map((h) => (
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

                {/* Status */}
                <td className="px-6 py-4 align-middle">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
                      STATUS_STYLE[c.status || "Active"] ?? STATUS_STYLE["Active"]
                    )}
                  >
                    {c.status || "Active"}
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
                        onSelect={async () => {
                          try {
                            await deleteCandidateFn(c.id);
                            // State akan di-update otomatis oleh hook melalui fetchCandidates()
                            // Tidak perlu reload untuk menghindari freeze
                          } catch (error) {
                            console.error('❌ Error deleting candidate:', error);
                          }
                        }}
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
                    onSelect={async () => {
                      try {
                        await deleteCandidateFn(c.id);
                        // State akan di-update otomatis oleh hook melalui fetchCandidates()
                        // Tidak perlu reload untuk menghindari freeze
                      } catch (error) {
                        console.error('❌ Error deleting candidate:', error);
                      }
                    }}
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
                    STATUS_STYLE[c.status || "Active"] ?? STATUS_STYLE["Active"]
                  )}
                >
                  {c.status || "Active"}
                </span>
              </div>
            </div>
          </div>
        ))}
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

    </div>
  );
}
