"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/TopBar";
import TitleBar from "./components/title-bar"; // Jika menggunakan export default
import TableSkeleton from "./components/table-skeleton";
import { UserTable } from "./components/user-manage-table"; // Gunakan komponen UserTable
import { useUserManagement } from "./hooks/use-user-manage"; // Gunakan hook untuk mengambil data pengguna
import DialogEdit from "./components/user-manage-dialog"; // Import DialogEdit untuk Add User
import type { User } from "./services/user-manage-service"; // Import Tipe User

export default function UserManagementPage() {
  const { users, loading, error } = useUserManagement(); // Ambil data pengguna dari hook
  const [editUser, setEditUser] = useState<User | null>(null); // State untuk dialog edit user
  const [showAdd, setShowAdd] = useState(false); // State untuk menampilkan dialog Add User

  // Fungsi untuk membuka dialog Add New User
  const handleAddUser = () => {
    setShowAdd(true); // Menampilkan dialog Add User
  };

  // Fungsi untuk menyimpan data user baru
  const handleSaveUser = (user: User) => {
    // Pastikan parameter user bertipe User
    console.log("Saving user:", user); // Integrasikan dengan backend jika perlu
    setShowAdd(false); // Tutup dialog setelah menyimpan
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
          <TitleBar onAdd={handleAddUser} /> {/* Tombol Add New User */}
          {/* Loading skeleton */}
          {loading && <TableSkeleton />}
          {/* Error message */}
          {error && <div className="text-red-500 mt-4">{error}</div>}
          {/* Actual table */}
          {!loading && !error && <UserTable users={users} />}{" "}
          {/* Menampilkan tabel pengguna */}
        </main>
      </div>

      {showAdd && (
        <DialogEdit
          user={null} // User null untuk menambah pengguna baru
          open={true} // Dialog terbuka
          onOpenChange={(open: boolean) => {
            if (!open) setShowAdd(false); // Menutup dialog setelah selesai
          }}
          onSave={handleSaveUser} // Menyimpan pengguna baru
        />
      )}

      {editUser && (
        <DialogEdit
          user={editUser} // Mengirimkan editUser yang valid
          open={true} // Dialog terbuka
          onOpenChange={(open: boolean) => {
            if (!open) setEditUser(null); // Menutup dialog setelah simpan
          }}
          onSave={handleSaveUser} // Menyimpan perubahan user
        />
      )}
    </div>
  );
}
