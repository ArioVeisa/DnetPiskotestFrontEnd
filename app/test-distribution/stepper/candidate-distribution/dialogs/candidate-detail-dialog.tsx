// modules/candidates/dialogs/candidate-detail-dialog.tsx
"use client";

/**
 * CandidateDetailDialog
 * - View/Edit dalam satu dialog
 * - Toggle edit di sebelah kanan judul (ikon pensil merah)
 * - Footer selalu: Cancel + Save (Save disabled saat view)
 *
 * Maintenance notes:
 * - NIK dikunci (tidak bisa diubah), konsisten dengan updateCandidateAPI.
 * - Save -> submit form -> onSave(payload).
 * - Cancel:
 *   - Saat view: tutup dialog.
 *   - Saat edit: reset ke data awal & keluar dari mode edit.
 */

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, User, Pencil } from "lucide-react";
import type { Candidate } from "../service/update-package-service";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  candidate: Candidate | null;
  onSave: (payload: Candidate) => Promise<void>;
  saving?: boolean;
  error?: string | null;
};

export default function CandidateDetailDialog({
  open,
  onOpenChange,
  candidate,
  onSave,
  saving,
  error,
}: Props) {
  // local form state
  const [form, setForm] = useState<Candidate>({
    nik: "",
    name: "",
    email: "",
    phone: "",
    status: "Pending",
  });

  // mode view/edit via toggle pensil
  const [editing, setEditing] = useState(false);

  // isi ulang form saat candidate berubah / dialog dibuka
  useEffect(() => {
    if (candidate) {
      setForm({
        nik: candidate.nik ?? "",
        name: candidate.name ?? "",
        email: candidate.email ?? "",
        phone: candidate.phone ?? "",
        status: candidate.status ?? "Pending",
      });
      setEditing(false); // default ke view
    }
  }, [candidate]);

  // submit hanya jika sedang edit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    await onSave(form);
    setEditing(false);
  }

  // Cancel:
  // - saat editing => reset ke data awal + keluar edit
  // - saat view     => tutup dialog
  function handleCancel() {
    if (editing) {
      if (candidate) {
        setForm({
          nik: candidate.nik ?? "",
          name: candidate.name ?? "",
          email: candidate.email ?? "",
          phone: candidate.phone ?? "",
          status: candidate.status ?? "Pending",
        });
      }
      setEditing(false);
    } else {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md p-0 rounded-2xl max-h-[95vh]">
        <DialogHeader>
          {/* Header: judul + toggle pensil di sebelah teks */}
          <div className="flex items-center justify-between gap-3 px-4 sm:px-8 pt-4 sm:pt-6">
            <DialogTitle className="text-lg sm:text-xl font-bold">
              <span className="inline-flex items-center gap-2">
                Candidate Detail
                <Button
                  type="button"
                  variant="ghost"
                  aria-pressed={editing}
                  onClick={() => setEditing((v) => !v)}
                  className={cn(
                    "h-8 w-8 p-0 rounded-full transition",
                    editing ? "bg-red-50 ring-1 ring-red-200" : "hover:bg-red-50"
                  )}
                  title={editing ? "Keluar mode edit" : "Masuk mode edit"}
                >
                  <Pencil
                    className={cn(
                      "w-4 h-4",
                      editing ? "text-red-600" : "text-red-500"
                    )}
                  />
                </Button>
              </span>
            </DialogTitle>
          </div>
        </DialogHeader>

        <form
          className="p-4 sm:p-8 pt-2 space-y-4 sm:space-y-6 overflow-y-auto"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="text-red-500 text-sm py-2 px-3 bg-red-50 rounded-md border border-red-100">
              {error}
            </div>
          )}

          {/* NIK (LOCKED) */}
          <div>
            <label className="block text-sm mb-1 font-semibold">NIK</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={form.nik}
                onChange={(e) => setForm((f) => ({ ...f, nik: e.target.value }))}
                placeholder="e.g. 3271061702980001"
                required
                className="pl-10 text-sm"
                disabled // selalu terkunci (tidak bisa ubah NIK)
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-400">NIK tidak dapat diubah.</p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm mb-1 font-semibold">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Budi Santoso"
                required
                className="pl-10 text-sm"
                disabled={!editing}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm mb-1 font-semibold">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="e.g. budi@example.com"
                required
                className="pl-10 text-sm"
                disabled={!editing}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm mb-1 font-semibold">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="e.g. +62 812 3456 7890"
                required
                className="pl-10 text-sm"
                disabled={!editing}
              />
            </div>
          </div>

          {/* FOOTER: Cancel & Save (Save nonaktif saat view) */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={handleCancel}
              disabled={!!saving}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(
                "w-full sm:w-auto",
                editing ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-400 cursor-not-allowed"
              )}
              disabled={!editing || !!saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
