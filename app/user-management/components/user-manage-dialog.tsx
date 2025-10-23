"use client";

import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, User, Mail, Eye, EyeOff, Lock } from "lucide-react";

// Import User type dari service Anda
// import { User } from "../services/user-manage-service";

// Sementara define di sini (hapus saat sudah import dari service)
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
}

// Untuk create user, API butuh password
interface CreateUserPayload extends Omit<User, "id"> {
  password: string;
}

interface DialogEditProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: User | CreateUserPayload) => void;
  loading?: boolean;
}

export default function DialogEdit({
  user,
  open,
  onOpenChange,
  onSave,
  loading = false,
}: DialogEditProps) {
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    email: string;
    role: string;
    department: string;
    password: string;
  }>({
    name: "",
    email: "",
    role: "",
    department: "",
    password: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  // Reset form when user changes or dialog opens
  useEffect(() => {
    if (open) {
      if (user) {
        // Mode Edit - tidak perlu password
        setFormData({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department ?? "",
          password: "",
        });
      } else {
        // Mode Add - butuh password
        setFormData({
          name: "",
          email: "",
          role: "",
          department: "",
          password: "",
        });
      }
      setErrors({});
      setPasswordVisible(false);
    }
  }, [user, open]);

  const handleInputChange = (name: string, value: string | null) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.role.trim()) {
      newErrors.role = "Role is required";
    }

    // Password hanya wajib saat Add User (bukan Edit)
    if (!user) {
      if (!formData.password.trim()) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      if (user) {
        // Update existing user - tidak kirim password
        const { password, ...updateData } = formData;
        onSave(updateData as User);
      } else {
        // Create new user - harus kirim password
        const { id, ...createData } = formData;
        onSave(createData as CreateUserPayload);
      }
    }
  };

  const handleCancel = () => {
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:w-[80vw] max-w-full sm:max-w-2xl max-h-[90vh] p-4 bg-gradient-to-br from-slate-50 to-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {user ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Update the user information below."
              : "Fill out the form to create a new user account."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 px-1 pb-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter full name"
                  className={`pl-10 ${errors.name ? "border-destructive" : ""}`}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Password - Hanya tampil saat Add User */}
            {!user && (
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={passwordVisible ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter password (min 6 characters)"
                    className={`pl-10 pr-10 ${
                      errors.password ? "border-destructive" : ""
                    }`}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    disabled={loading}
                  >
                    {passwordVisible ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password}</p>
                )}
              </div>
            )}

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
                disabled={loading}
              >
                <SelectTrigger className={errors.role ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="kandidat">Kandidat</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive mt-1">{errors.role}</p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="department"
                  value={formData.department ?? ""}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value || null)
                  }
                  placeholder="Enter department (optional)"
                  className={`pl-10 ${
                    errors.department ? "border-destructive" : ""
                  }`}
                  disabled={loading}
                />
                {errors.department && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.department}
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="mt-4 gap-2 flex justify-end border-t pt-4">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : user ? "Update User" : "Create User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
