// components/CandidateTable.tsx
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

// warna badge posisi
const POSITION_STYLE: Record<string, string> = {
  "UI/UX Designer": "bg-blue-100 text-blue-700",
  "Quality Assurance": "bg-yellow-100 text-yellow-800",
  Engineer: "bg-green-100 text-green-700",
  "Frontend Dev": "bg-red-100 text-red-700",
};

// status
const STATUS_STYLE: Record<"Active" | "Inactive", string> = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-500",
};

export function CandidateTable() {
  const {
    candidates,
    loading,
    error,
    deleteCandidate: deleteCandidateFn,
  } = useCandidates();

  const [editCandidate, setEditCandidate] = useState<
    (Candidate & { phone: string }) | null
  >(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Candidate | null>(null);

  // 🔄 Loading
  if (loading) return <TableSkeleton />;

  // ⚠️ Error
  if (error) return <div className="text-red-500 mt-4">{error}</div>;

  // 📭 Empty state
  if (candidates.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">
        Belum ada kandidat ditambahkan.
      </div>
    );
  }
  return (
    <div>
      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-[900px] w-full table-auto">
          <thead>
            <tr className="text-gray-400 text-[15px] font-semibold">
              {["Candidates", "NIK", "Position", "Status", "Actions"].map(
                (h) => (
                  <th key={h} className="px-4 pb-2 text-left">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
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
                      STATUS_STYLE[
                        c.status === "Active" ? "Active" : "Inactive"
                      ]
                    )}
                  >
                    {c.status}
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
                        onSelect={() => setEditCandidate({ ...c, phone: "" })}
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
        {candidates.map((c) => {
          return (
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
                      onSelect={() => setEditCandidate({ ...c, phone: "" })}
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
                <div className="flex justify-between">
                  <span className="text-gray-500">Period</span>
                  {/* <span className="font-medium text-gray-900">{periodLabel}</span> */}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold",
                      STATUS_STYLE[
                        c.status === "Active" ? "Active" : "Inactive"
                      ]
                    )}
                  >
                    {c.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      {editCandidate && (
        <CandidateEditDialog
          candidate={editCandidate}
          open={true}
          onOpenChange={(open: boolean) => {
            if (!open) setEditCandidate(null);
          }}
          onSave={(updated) => {
            // Sementara, integrasi dengan backend di sini
            console.log("Updated candidate:", updated);
            setEditCandidate(null);
          }}
        />
      )}

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
            window.location.reload(); // refresh full page
          } catch (err) {
            console.error(err);
          } finally {
            setDeleteCandidate(null);
          }
        }}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
}
