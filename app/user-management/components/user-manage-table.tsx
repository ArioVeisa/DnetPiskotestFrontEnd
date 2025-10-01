"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "../services/user-manage-service"; // Menggunakan tipe User
import DialogEdit from "./user-manage-dialog"; // Import DialogEdit

// warna badge role
const ROLE_STYLE: Record<string, string> = {
  "Super Admin": "bg-blue-100 text-blue-700",
  "Admin HR": "bg-yellow-100 text-yellow-800",
  Viewer: "bg-green-100 text-green-700",
};

// status
const STATUS_STYLE: Record<"Active" | "Inactive", string> = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-500",
};

export function UserTable({ users }: { users: User[] }) {
  const [editUser, setEditUser] = useState<User | null>(null);

  return (
    <div>
      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-[900px] w-full table-auto">
          <thead>
            <tr className="text-gray-400 text-sm font-semibold">
              {["Name", "Role", "Department","Status", "Actions"].map((h) => (
                <th key={h} className="px-4 pb-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="bg-white">
                {/* Name */}
                <td className="px-6 py-4 flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-semibold">
                    {u.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {u.name}
                    </div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </div>
                </td>
                {/* Role */}
                <td className="px-6 py-4 align-middle">
                  <span
                    className={cn(
                      "px-3 py-2 rounded text-xs font-semibold whitespace-nowrap",
                      ROLE_STYLE[u.role] ?? "bg-gray-100 text-gray-500"
                    )}
                  >
                    {u.role}
                  </span>
                </td>
                {/* Department */}
                <td className="px-6 py-4 align-middle">{u.department}</td>
                {/* Status */}
                <td className="px-6 py-4 align-middle">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
                      STATUS_STYLE[
                        u.status === "Active" ? "Active" : "Inactive"
                      ]
                    )}
                  >
                    {u.status}
                  </span>
                </td>
                {/* Actions */}
                <td className="px-6 py-4 flex items-center gap-4 align-middle">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-700 px-2 py-2 rounded-md hover:bg-gray-100"
                      >
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="min-w-[140px] rounded-xl py-2 px-1 shadow-lg border border-gray-100"
                    >
                      <DropdownMenuItem onSelect={() => setEditUser(u)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
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
      <div className="md:hidden space-y-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-white rounded-lg shadow-sm p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-semibold">
                  {u.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <div className="font-semibold text-gray-900">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded hover:bg-gray-100">
                    <MoreVertical className="h-5 w-5 text-gray-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[120px] bg-white rounded-md shadow-md"
                >
                  <DropdownMenuItem onSelect={() => setEditUser(u)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Role</span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-semibold",
                    ROLE_STYLE[u.role]
                  )}
                >
                  {u.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Department</span>
                <span className="font-medium text-gray-900">
                  {u.department}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold",
                    STATUS_STYLE[u.status === "Active" ? "Active" : "Inactive"]
                  )}
                >
                  {u.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      {editUser && (
        <DialogEdit
          user={editUser}
          open={true} // Mengatur dialog terbuka
          onOpenChange={(open: boolean) => {
            if (!open) setEditUser(null); // Menutup dialog jika open = false
          }}
          onSave={(updatedUser) => {
            console.log("Updated User:", updatedUser);
            setEditUser(null); // Menutup dialog setelah menyimpan perubahan
          }}
        />
      )}
    </div>
  );
}
