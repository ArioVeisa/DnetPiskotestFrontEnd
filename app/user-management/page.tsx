"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/TopBar";
import TitleBar from "./components/title-bar";
import TableSkeleton from "./components/table-skeleton";
import { UserTable } from "./components/user-manage-table";
import { useUserManagement } from "./hooks/use-user-manage";
import { AddUserDialog } from "./components/add-dialog"; // ✅ untuk tambah user
import { EditUserDialog } from "./components/edit-dialog"; // ✅ untuk edit user
import type { User } from "./services/user-manage-service";

export default function UserManagementPage() {
  const { users, loading, error, addUser, updateUserInfo, removeUser, clearError } =
    useUserManagement();

  const [editUser, setEditUser] = useState<User | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // 🔹 Open Add User Dialog
  const handleAddUser = () => setShowAdd(true);

  // 🔹 Save Add User
  const handleAddUserSave = async (data: Omit<User, "id">) => {
    try {
      await addUser(data);
      setShowAdd(false);
    } catch (err) {
      // console.error("Failed to add user:", err); // Error logging removed
    }
  };

  // 🔹 Save Edit User
  const handleEditUserSave = async (data: User) => {
    try {
      await updateUserInfo(data);
      setEditUser(null);
    } catch (err) {
      // console.error("Failed to update user:", err); // Error logging removed
    }
  };

  // 🔹 Delete user
  const handleDeleteUser = async (id: string) => {
    await removeUser(id);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 bg-white">
        <Topbar />

        <main className="flex-1 px-8 pt-2 pb-8">
          <TitleBar onAdd={handleAddUser} />

          {loading && <TableSkeleton />}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mt-4 flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={clearError}
                className="text-red-600 hover:text-red-800 font-bold"
              >
                ×
              </button>
            </div>
          )}

          {!loading && !error && (
            <UserTable
              users={users}
              onEdit={setEditUser} // ✅ ganti jadi onEdit
              onDelete={handleDeleteUser}
              loading={loading}
            />
          )}
        </main>
      </div>

      {/* Dialog Add User */}
      {showAdd && (
        <AddUserDialog
          open={showAdd}
          onOpenChange={setShowAdd}
          onSave={handleAddUserSave} // ✅ khusus Add
          loading={loading}
        />
      )}

      {/* Dialog Edit User */}
      {editUser && (
        <EditUserDialog
          user={editUser}
          open={true} // ✅ pakai true saja, karena kondisi editUser sudah nge-handle
          onOpenChange={(open) => {
            if (!open) {
              setEditUser(null);
              clearError(); // Clear error when dialog closes
            }
          }}
          onSave={handleEditUserSave}
          loading={loading}
        />
      )}
    </div>
  );
}
