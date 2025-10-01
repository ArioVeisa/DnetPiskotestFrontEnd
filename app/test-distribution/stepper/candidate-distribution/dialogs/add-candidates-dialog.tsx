"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { CreateCandidatePayload } from "../service/candidate-service"; // sesuaikan path

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (payload: CreateCandidatePayload) => Promise<void> | void;
  saving?: boolean;
  error?: string | null;
};

export default function AddCandidateDialog({
  open,
  onOpenChange,
  onSave,
  saving,
  error,
}: Props) {
  const initialForm: CreateCandidatePayload = {
    nik: "",
    name: "",
    phone_number: "",
    email: "",
    position: "",
    birth_date: "",
    gender: "male",
    department: "",
  };

  const [form, setForm] = useState<CreateCandidatePayload>(initialForm);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await onSave(form);
    setForm(initialForm);
    onOpenChange(false);
  }

  const isValid =
    form.nik.trim() !== "" &&
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.phone_number.trim() !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:w-[80vw] max-w-full sm:max-w-2xl max-h-[100vh] p-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex h-full flex-col">
          <DialogHeader className="px-4 sm:px-6 pb-2 sm:pt-6 flex flex-col items-center">
            <DialogTitle className="text-base sm:text-lg font-semibold">
              Add Candidate
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Lengkapi data kandidat dengan benar.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[70vh]">
            <form
              onSubmit={handleSubmit}
              className="px-4 sm:px-6 pb-6 pt-2 space-y-4"
            >
              {error && (
                <div className="text-red-500 text-sm py-2 px-3 bg-red-50 rounded-md border border-red-100">
                  {error}
                </div>
              )}

              {/* NIK */}
              <div>
                <Label className="block text-xs sm:text-sm font-medium">
                  NIK
                </Label>
                <Input
                  value={form.nik}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nik: e.target.value }))
                  }
                  placeholder="3201010101010001"
                  required
                  className="text-sm"
                />
              </div>

              {/* Full Name */}
              <div>
                <Label className="block text-xs sm:text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Budi Santoso"
                  required
                  className="text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <Label className="block text-xs sm:text-sm font-medium">
                  Email
                </Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="budi@example.com"
                  required
                  className="text-sm"
                />
              </div>

              {/* Phone */}
              <div>
                <Label className="block text-xs sm:text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  value={form.phone_number}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone_number: e.target.value }))
                  }
                  placeholder="081234567890"
                  required
                  className="text-sm"
                />
              </div>

              {/* Position + Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="block text-xs sm:text-sm font-medium">
                    Position
                  </Label>
                  <Input
                    value={form.position}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, position: e.target.value }))
                    }
                    placeholder="Staff / Manager"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="block text-xs sm:text-sm font-medium">
                    Department
                  </Label>
                  <Input
                    value={form.department}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, department: e.target.value }))
                    }
                    placeholder="HRD / IT"
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Birth Date + Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="block text-xs sm:text-sm font-medium">
                    Birth Date
                  </Label>
                  <Input
                    type="date"
                    value={form.birth_date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, birth_date: e.target.value }))
                    }
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="block text-xs sm:text-sm font-medium">
                    Gender
                  </Label>
                  <Select
                    value={form.gender}
                    onValueChange={(val) =>
                      setForm((f) => ({ ...f, gender: val as "male" | "female" }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="min-w-[96px]"
                  disabled={!!saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="min-w-[96px] bg-blue-500 text-white"
                  disabled={!isValid || !!saving}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
