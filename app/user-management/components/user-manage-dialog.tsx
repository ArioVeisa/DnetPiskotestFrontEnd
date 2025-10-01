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

// User interface
interface User {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "HR" | "Viewer";
  status: "Active" | "Inactive";
  department: string;
  password?: string;
  confirmPassword?: string;
}

interface DialogEditProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedUser: User) => void;
}

export default function DialogEdit({
  user,
  open,
  onOpenChange,
  onSave,
}: DialogEditProps) {
  const [formData, setFormData] = useState<User>({
    id: "",
    name: "",
    email: "",
    role: "Viewer",
    status: "Active",
    department: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof User, string>>>({});

  // Reset form when user changes or dialog opens
  useEffect(() => {
    if (open) {
      if (user) {
        setFormData({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          department: user.department,
          password: "",
          confirmPassword: "",
        });
      } else {
        setFormData({
          id: "",
          name: "",
          email: "",
          role: "Viewer",
          status: "Active",
          department: "",
          password: "",
          confirmPassword: "",
        });
      }
      setErrors({});
      setPasswordVisible(false);
      setConfirmPasswordVisible(false);
    }
  }, [user, open]);

  // Handle input changes
  const handleInputChange = (name: keyof User, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof User, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.department.trim()) {
      newErrors.department = "Department is required";
    }

    // Password validation only for new users or when password is provided
    if (!user || formData.password) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Create clean user data without confirm password
      const { ...userData } = formData;

      // For existing users, only include password if it's provided
      if (user && !formData.password) {
        const { ...userWithoutPassword } = userData;
        onSave(userWithoutPassword as User);
      } else {
        onSave(userData as User);
      }

      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onOpenChange(false);
  };

  return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:w-[80vw] max-w-full sm:max-w-2xl max-h-[100vh] p-4 bg-gradient-to-br from-slate-50 to-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {user ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Update the user information below. Leave password fields empty to keep the current password."
              : "Fill out the form to create a new user account."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh]">
          <form onSubmit={handleSave} className="space-y-4 px-3">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`pl-10 ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Department Field */}
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="department"
                  name="department"
                  placeholder="Enter department"
                  value={formData.department}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                  className={`pl-10 ${errors.department ? "border-destructive" : ""}`}
                />
                {errors.department && (
                  <p className="text-sm text-destructive mt-1">{errors.department}</p>
                )}
              </div>
            </div>

            {/* Role Field */}
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: User["role"]) =>
                  handleInputChange("role", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {!user && "*"}
                {user && (
                  <span className="text-sm text-muted-foreground ml-1">
                    (leave empty to keep current)
                  </span>
                )}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`pl-10 pr-10 ${
                    errors.password ? "border-destructive" : ""
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password {!user && "*"}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={confirmPasswordVisible ? "text" : "password"}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className={`pl-10 pr-10 ${
                    errors.confirmPassword ? "border-destructive" : ""
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() =>
                    setConfirmPasswordVisible(!confirmPasswordVisible)
                  }
                >
                  {confirmPasswordVisible ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </form>

          <div className="mt-4 mb-4 gap-2 flex justify-end">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} type="submit">
              {user ? "Update User" : "Create User"}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

    