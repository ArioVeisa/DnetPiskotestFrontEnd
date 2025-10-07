"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Mail, FileText, AlertCircle } from "lucide-react";

interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface EditUserDialogProps {
  user: UserType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: UserType) => void;
  loading?: boolean;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSave,
  loading = false,
}: EditUserDialogProps) {
  const [form, setForm] = useState<UserType>({
    id: "",
    name: "",
    email: "",
    role: "",
    department: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // reset form tiap kali dialog dibuka/ditutup
  useEffect(() => {
    if (user && open) {
      setForm(user);
      setErrors({});
      setTouched({});
    } else if (!open) {
      setForm({
        id: "",
        name: "",
        email: "",
        role: "",
        department: "",
      });
    }
  }, [user, open]);

  const validateField = (field: string, value: string) => {
    let error = "";
    switch (field) {
      case "name":
        if (!value.trim()) error = "Nama wajib diisi";
        else if (value.trim().length < 3) error = "Nama minimal 3 karakter";
        break;
      case "email":
        if (!value.trim()) error = "Email wajib diisi";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Format email tidak valid";
        break;
      case "role":
        if (!value) error = "Role wajib dipilih";
        break;
    }
    return error;
  };

  const handleChange = (field: keyof UserType, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof UserType) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    ["name", "email", "role"].forEach((f) => {
      const error = validateField(f, form[f as keyof UserType]);
      if (error) newErrors[f] = error;
    });
    setErrors(newErrors);
    setTouched({ name: true, email: true, role: true });
    if (Object.keys(newErrors).length === 0) {
      onSave(form); // ✅ biarin parent yang nutup dialog
    }
  };

  const handleCancel = () => {
    onOpenChange(false); // ✅ tutup dialog saat cancel
  };

  const isFormValid =
    form.name.trim().length >= 3 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.role !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl p-0 rounded-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg font-semibold">Edit User</DialogTitle>
          <DialogDescription>
            Perbarui informasi user yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama Lengkap *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                className={`pl-10 ${
                  errors.name && touched.name ? "border-red-500" : ""
                }`}
                disabled={loading}
              />
            </div>
            {errors.name && touched.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2 mt-4">
            <Label htmlFor="edit-email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                className={`pl-10 ${
                  errors.email && touched.email ? "border-red-500" : ""
                }`}
                disabled={loading}
              />
            </div>
            {errors.email && touched.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2 mt-4">
            <Label>Role *</Label>
            <Select
              value={form.role}
              onValueChange={(v) => handleChange("role", v)}
              disabled={loading}
            >
              <SelectTrigger
                className={errors.role && touched.role ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="kandidat">Kandidat</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && touched.role && (
              <p className="text-sm text-red-500">{errors.role}</p>
            )}
          </div>

          {/* Department */}
          <div className="space-y-2 mt-4">
            <Label>Department</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={form.department || ""}
                onChange={(e) => handleChange("department", e.target.value)}
                disabled={loading}
                className="pl-10"
              />
            </div>
          </div>
        </ScrollArea>

        <Separator />

        <div className="flex justify-end gap-3 p-4">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={loading || !isFormValid}>
            {loading ? "Menyimpan..." : "Update User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
