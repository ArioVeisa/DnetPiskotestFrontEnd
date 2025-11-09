"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Distribution } from "../services/test-distribution-service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { candidateService, type Candidate } from "../stepper/candidate-distribution/service/candidate-service";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Distribution | null;
  onSave: (id: number, data: Partial<Distribution>) => Promise<void>;
  saving?: boolean;
  error?: string | null;
};

export default function EditSessionDialog({
  open,
  onOpenChange,
  session,
  onSave,
  saving = false,
  error = null,
}: Props) {
  const [form, setForm] = useState({
    testName: "",
    status: "Draft" as "Draft" | "Scheduled" | "Ongoing" | "Completed" | "Expired",
  });

  // Resend email state
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]); // berisi candidate_test_id jika ada
  const [sending, setSending] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Invitation email has been resent.");

  // Populate form when session changes
  useEffect(() => {
    if (session) {
      setForm({
        testName: session.testName || "",
        status: session.status || "Draft",
      });
      (async () => {
        try {
          setLoadingCandidates(true);
          const list = await candidateService.getTestDistributionCandidates(session.id);
          setCandidates(list ?? []);
          setSelectedIds([]);
        } catch (e) {
          // Silent error handling
        } finally {
          setLoadingCandidates(false);
        }
      })();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    try {
      await onSave(session.id, {
        testName: form.testName,
        status: form.status,
      });
      onOpenChange(false);
    } catch (error) {
      // Silent error handling
    }
  };

  const isValid = form.testName.trim() !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Test Session</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Test Name */}
          <div className="space-y-2">
            <Label htmlFor="testName">Test Name</Label>
            <Input
              id="testName"
              value={form.testName}
              onChange={(e) => setForm(prev => ({ ...prev, testName: e.target.value }))}
              placeholder="Enter test name"
              required
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as "Draft" | "Scheduled" | "Ongoing" | "Completed" | "Expired" }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Draft">Draft</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>

        {/* Resend Email Section */}
        <div className="mt-4 space-y-3">
          <div className="font-medium">Resend Invitations</div>
          <div className="text-xs text-muted-foreground">Pilih kandidat yang tidak menerima email untuk kirim ulang.</div>
          <div className="max-h-40 overflow-auto rounded border">
            {loadingCandidates ? (
              <div className="p-3 text-sm text-muted-foreground">Loading candidates...</div>
            ) : candidates.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">Belum ada kandidat pada sesi ini.</div>
            ) : (
              <ul className="divide-y">
                {candidates.map((c) => {
                  // Gunakan test_distribution_candidate_id (c.id) untuk resend
                  const key = c.id; // ini adalah test_distribution_candidate_id
                  const checked = selectedIds.includes(key);
                  return (
                    <li key={c.id} className="flex items-center gap-2 p-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedIds((prev) =>
                            e.target.checked ? [...prev, key] : prev.filter((id) => id !== key)
                          );
                        }}
                      />
                      <div className="text-sm">
                        <div className="font-medium">{c.name}</div>
                        <div className="text-muted-foreground text-xs">{c.email}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={!session || selectedIds.length === 0 || sending}
              onClick={async () => {
                if (!session) return;
                try {
                  setSending(true);
                  await candidateService.resendInvitations(session.id, selectedIds);
                  setSelectedIds([]);
                  setSuccessMessage("Invitation email has been resent.");
                  setSuccessOpen(true);
                } catch (e) {
                  console.error(e);
                  setSuccessMessage(
                    typeof e === "string" ? e : "Failed to resend invitation."
                  );
                  setSuccessOpen(true);
                } finally {
                  setSending(false);
                }
              }}
            >
              {sending ? "Sending..." : "Resend Email"}
            </Button>
          </div>
        </div>
      </DialogContent>
      {/* Success Popup */}
      <AlertDialog open={successOpen} onOpenChange={(open) => {
        setSuccessOpen(open);
        if (!open) {
          // close parent dialog to trigger reload in parent
          onOpenChange(false);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{successMessage}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
