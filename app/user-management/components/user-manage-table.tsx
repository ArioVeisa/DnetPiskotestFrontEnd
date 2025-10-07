"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "../services/user-manage-service";

const ROLE_STYLE: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  kandidat: "bg-green-100 text-green-700",
};

const formatRole = (role: string): string => {
  if (role === "super_admin") return "Super Admin";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export function UserTable({
  users,
  onEdit,
  onDelete,
  loading = false,
}: UserTableProps) {
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
              {["Name", "Role", "Actions"].map((h) => (
                <th key={h} className="px-6 py-3 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr
                key={u.id}
                className="bg-white hover:bg-gray-50 transition-colors"
              >
                {/* Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-black font-semibold text-sm">
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

                {/* Actions */}
                <td className="px-6 py-4 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(u)}
                    disabled={loading}
                  >
                    <Edit className=" h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(u.id)}
                    disabled={loading}
                  >
                    <Trash2 className=" h-4 w-4" />
                  </Button>
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
                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                  {u.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {u.name}
                  </div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
              </div>
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
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(u)}
                disabled={loading}
                className="flex-1"
              >
                <Edit className="mr-1 h-4 w-4" /> Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(u.id)}
                disabled={loading}
                className="flex-1"
              >
                <Trash2 className="mr-1 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
