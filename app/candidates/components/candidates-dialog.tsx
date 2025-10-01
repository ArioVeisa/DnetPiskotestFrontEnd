"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, User, Mail, Phone } from "lucide-react";
import type { Candidate } from "../services/candidates-service";

interface FormData {
  nik: string;
  name: string;
  email: string;
  phone: string;
}

export interface CandidateEditDialogProps {
  candidate: Candidate & { phone: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: Candidate & { phone: string }) => void;
}

export function CandidateEditDialog({
  candidate,
  open,
  onOpenChange,
  onSave,
}: CandidateEditDialogProps) {
  const [form, setForm] = useState<FormData>({
    nik: "",
    name: "",
    email: "",
    phone: "",
  });

  // Reset form when candidate changes
  useEffect(() => {
    setForm({ nik: "", name: "", email: "", phone: "" });
  }, [candidate]);

  const FIELDS: {
    label: string;
    name: keyof FormData;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    placeholder: string;
  }[] = [
    {
      label: "NIK (National Identity Number)",
      name: "nik",
      icon: FileText,
      placeholder: candidate.nik,
    },
    {
      label: "Full Name",
      name: "name",
      icon: User,
      placeholder: candidate.name,
    },
    {
      label: "Email",
      name: "email",
      icon: Mail,
      placeholder: candidate.email,
    },
    {
      label: "Phone Number",
      name: "phone",
      icon: Phone,
      placeholder: candidate.phone,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:w-[80vw] max-w-full sm:max-w-2xl max-h-[100vh] p-4 bg-gradient-to-br from-slate-50 to-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {candidate ? "Edit Candidate" : "Add New Candidate"}
          </DialogTitle>
          <DialogDescription>
            {candidate
              ? "Update the candidate's information below. Leave the fields empty if you don't want to change them."
              : "Fill out the form to create a new candidate account."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4 px-3">
            {FIELDS.map(({ label, name, icon: Icon, placeholder }) => (
              <div key={name} className="space-y-2">
                <Label htmlFor={name} className="text-sm">
                  {label}
                </Label>
                <div className="relative">
                  <Icon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id={name}
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [name]: e.target.value,
                      }))
                    }
                    className="pl-10 border-none focus:ring-0"
                  />
                </div>
              </div>
            ))}
          </form>
          <DialogFooter className="flex justify-end gap-2 px-3 mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const updated: Candidate & { phone: string } = {
                  ...candidate,
                  nik: form.nik || candidate.nik,
                  name: form.name || candidate.name,
                  email: form.email || candidate.email,
                  phone: form.phone || candidate.phone,
                };
                onSave(updated);
                onOpenChange(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
