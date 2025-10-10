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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Lock, FileText, AlertCircle } from "lucide-react";

// ============= ADD USER DIALOG =============
interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    department: string;
  }) => void;
  loading?: boolean;
}

export function AddUserDialog({ open, onOpenChange, onSave, loading = false }: AddUserDialogProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    department: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setForm({
        name: "",
        email: "",
        password: "",
        role: "",
        department: "",
      });
      setErrors({});
      setTouched({});
    }
  }, [open]);

  const validateField = (field: string, value: string) => {
    let error = "";

    switch (field) {
      case "name":
        if (!value.trim()) {
          error = "Nama lengkap wajib diisi";
        } else if (value.trim().length < 3) {
          error = "Nama minimal 3 karakter";
        }
        break;
      case "email":
        if (!value.trim()) {
          error = "Email wajib diisi";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Format email tidak valid";
        }
        break;
      case "password":
        if (!value) {
          error = "Password wajib diisi";
        } else if (value.length < 8) {
          error = "Password minimal 8 karakter";
        }
        break;
      case "role":
        if (!value) {
          error = "Role wajib dipilih";
        }
        break;
    }

    return error;
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    
    // Validate only if field has been touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field as keyof typeof form]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSave = () => {
    // Validate all required fields
    const newErrors: Record<string, string> = {};
    const requiredFields = ["name", "email", "password", "role"];
    
    requiredFields.forEach((field) => {
      const error = validateField(field, form[field as keyof typeof form]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      role: true,
    });

    // If no errors, proceed with save
    if (Object.keys(newErrors).length === 0) {
      onSave(form);
    }
  };

  const isFormValid = 
    form.name.trim().length >= 3 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.password.length >= 8 &&
    form.role !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl p-0 rounded-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg font-semibold">Tambah User</DialogTitle>
          <DialogDescription>
            Isi data lengkap untuk menambahkan user baru ke sistem.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  className={`pl-10 ${errors.name && touched.name ? "border-red-500" : ""}`}
                  placeholder="Masukkan nama lengkap"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  disabled={loading}
                />
              </div>
              {errors.name && touched.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className={`pl-10 ${errors.email && touched.email ? "border-red-500" : ""}`}
                  placeholder="contoh@email.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  disabled={loading}
                />
              </div>
              {errors.email && touched.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className={`pl-10 ${errors.password && touched.password ? "border-red-500" : ""}`}
                  placeholder="Minimal 8 karakter"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  disabled={loading}
                />
              </div>
              {errors.password && touched.password && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={form.role} 
                onValueChange={(v) => {
                  handleChange("role", v);
                  if (!touched.role) setTouched((prev) => ({ ...prev, role: true }));
                }} 
                disabled={loading}
              >
                <SelectTrigger id="role" className={errors.role && touched.role ? "border-red-500" : ""}>
                  <SelectValue placeholder="Pilih role user" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="kandidat">Kandidat</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && touched.role && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.role}
                </p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="department"
                  className="pl-10"
                  placeholder="Opsional"
                  value={form.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <Separator />

        <div className="flex justify-end gap-3 p-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={loading}
          >
            Batal
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || !isFormValid}
          >
            {loading ? "Menyimpan..." : "Tambah User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}