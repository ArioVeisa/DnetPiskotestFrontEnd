"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/TopBar";
import TitleBar from "./components/title-bar";
import TableSkeleton from "./components/table-skeleton";
import { UserTable } from "./components/user-manage-table";
import { useUserManagement } from "./hooks/use-user-manage";
import DialogEdit from "./components/user-manage-dialog";
import type { User } from "./services/user-manage-service";

export default function UserManagementPage() {
  // ✅ Ambil SEMUA fungsi dari hook, termasuk addUser, updateUserInfo, removeUser
  const { users, loading, error, addUser, updateUserInfo, removeUser } = useUserManagement();
  
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // Fungsi untuk membuka dialog Add New User
  const handleAddUser = () => {
    setShowAdd(true);
  };

  // ✅ FIX: Fungsi ini HARUS memanggil addUser atau updateUserInfo
  const handleSaveUser = async (userData: User | Omit<User, "id">) => {
    console.log("Saving user:", userData);
    
    try {
      if ("id" in userData) {
        // ✅ Mode Edit - panggil updateUserInfo
        await updateUserInfo(userData as User);
        setEditUser(null);
      } else {
        // ✅ Mode Add - panggil addUser
        await addUser(userData);
        setShowAdd(false);
      }
      
      // Data akan auto-refresh karena fetchAllUsers dipanggil di dalam hook
    } catch (err) {
      console.error("Failed to save user:", err);
    }
  };

  // ✅ Fungsi untuk handle update dari table
  const handleUpdateUser = async (user: User) => {
    await updateUserInfo(user);
  };

  // ✅ Fungsi untuk handle delete dari table
  const handleDeleteUser = async (id: string) => {
    await removeUser(id);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 bg-white">
        {/* Top bar */}
        <Topbar />

        <main className="flex-1 px-8 pt-2 pb-8">
          <TitleBar onAdd={handleAddUser} />
          
          {/* Loading skeleton */}
          {loading && <TableSkeleton />}
          
          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mt-4">
              {error}
            </div>
          )}
          
          {/* ✅ UserTable dengan props yang benar */}
          {!loading && !error && (
            <UserTable 
              users={users}
              onUpdate={handleUpdateUser}
              onDelete={handleDeleteUser}
              loading={loading}
            />
          )}
        </main>
      </div>

      {/* Dialog Add User */}
      {showAdd && (
        <DialogEdit
          user={null}
          open={showAdd}
          onOpenChange={setShowAdd}
          onSave={handleSaveUser}
          loading={loading}
        />
      )}

      {/* Dialog Edit User */}
      {editUser && (
        <DialogEdit
          user={editUser}
          open={!!editUser}
          onOpenChange={(open) => {
            if (!open) setEditUser(null);
          }}
          onSave={handleSaveUser}
          loading={loading}
        />
      )}
    </div>
  );
}
