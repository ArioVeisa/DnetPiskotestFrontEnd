// src/app/users/[id]/components/verification-dialog.tsx
"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Candidate } from "../services/candidate-service";

export function VerificationDialog({
  candidate,
  validateNik,
  onSuccess,
}: {
  candidate: Candidate | null;
  validateNik: (nik: string) => boolean;  // cukup nik saja
  onSuccess: () => void;
}) {
  const [nik, setNik] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!candidate) {
      alert("Data kandidat tidak ditemukan.");
      return;
    }

    setLoading(true);
    const isValid = validateNik(nik); // panggil tanpa candidate
    setLoading(false);

    if (isValid) {
      onSuccess();
    } else {
      alert("NIK tidak sesuai dengan data kandidat.");
    }
  };

  return (
    <Dialog open>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Verifikasi Kandidat</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Masukkan NIK"
          value={nik}
          onChange={(e) => setNik(e.target.value)}
          className="mb-4"
        />
        <Button onClick={handleVerify} disabled={loading || !nik}>
          {loading ? "Memverifikasi..." : "Verifikasi"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
