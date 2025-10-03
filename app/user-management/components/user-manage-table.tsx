"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "../services/user-manage-service";
import DialogEdit from "./user-manage-dialog";

// Warna badge role - sesuaikan dengan role yang ada di service
const ROLE_STYLE: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  kandidat: "bg-green-100 text-green-700",
};

// Format role untuk display (capitalize)
const formatRole = (role: string): string => {
  if (role === "super_admin") return "Super Admin";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

interface UserTableProps {
  users: User[];
  onUpdate: (user: User) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export function UserTable({ 
  users, 
  onUpdate, 
  onDelete,
  loading = false 
}: UserTableProps) {
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const handleEdit = (user: User) => {
    setEditUser(user);
  };

  const handleDelete = (id: string) => {
    setDeleteUserId(id);
  };

  const confirmDelete = () => {
    if (deleteUserId) {
      onDelete(deleteUserId);
      setDeleteUserId(null);
    }
  };

  const handleSave = (updatedUser: User | Omit<User, "id">) => {
    if ("id" in updatedUser) {
      onUpdate(updatedUser);
      setEditUser(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No users found</p>
        <p className="text-sm mt-2">Add your first user to get started</p>
      </div>
    );
  }

  return (
    <div>
      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-[900px] w-full table-auto">
          <thead>
            <tr className="text-gray-400 text-sm font-semibold">
              {["Name", "Role", "Department", "Actions"].map((h) => (
                <th key={h} className="px-6 py-3 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="bg-white hover:bg-gray-50 transition-colors">
                {/* Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br bg-gray-50 text-black font-semibold text-sm">
                      {u.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {u.name}
                      </div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                
                {/* Role */}
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "inline-flex px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
                      ROLE_STYLE[u.role] ?? "bg-gray-100 text-gray-700"
                    )}
                  >
                    {formatRole(u.role)}
                  </span>
                </td>
                
                {/* Department */}
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700">
                    {u.department || "-"}
                  </span>
                </td>
                
                {/* Actions */}
                <td className="px-6 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={loading}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem 
                        onClick={() => handleEdit(u)}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(u.id)}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
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
      <div className="md:hidden space-y-3">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-white rounded-lg shadow-sm border p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold">
                  {u.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {u.name}
                  </div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="p-2 rounded hover:bg-gray-100"
                    disabled={loading}
                  >
                    <MoreVertical className="h-5 w-5 text-gray-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem 
                    onClick={() => handleEdit(u)}
                    className="cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDelete(u.id)}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="space-y-2 text-sm pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Role</span>
                <span
                  className={cn(
                    "inline-flex px-2 py-1 rounded-full text-xs font-semibold",
                    ROLE_STYLE[u.role] ?? "bg-gray-100 text-gray-700"
                  )}
                >
                  {formatRole(u.role)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Department</span>
                <span className="font-medium text-gray-900">
                  {u.department || "-"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <DialogEdit
        user={editUser}
        open={!!editUser}
        onOpenChange={(open) => {
          if (!open) setEditUser(null);
        }}
        onSave={handleSave}
        loading={loading}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!deleteUserId} 
        onOpenChange={(open) => !open && setDeleteUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
