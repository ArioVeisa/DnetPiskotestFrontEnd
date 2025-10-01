// src/app/user-management/hooks/use-user-management.ts
import { useState, useEffect, useCallback } from "react";
import { fetchUsers, updateUser, deleteUser, createUser } from "../services/user-manage-service"; // Import services untuk pengguna
import { User } from "../services/user-manage-service"; // Import tipe User yang sesuai

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]); // Ganti 'any' dengan tipe User yang sudah didefinisikan
  const [loading, setLoading] = useState<boolean>(true); // Tipe boolean untuk loading
  const [error, setError] = useState<string>(""); // Tipe string untuk error

  const fetchAllUsers = useCallback(() => {
    setLoading(true);
    fetchUsers()
      .then((data) => {
        setUsers(data); // Menyimpan data pengguna yang didapatkan
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load users"); // Menampilkan pesan error jika gagal mengambil data
      })
      .finally(() => {
        setLoading(false); // Menandakan bahwa pemuatan telah selesai
      });
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const updateUserInfo = async (user: User) => {
    await updateUser(user.id, user); // Update data pengguna
    fetchAllUsers(); // Ambil ulang data setelah update
  };

  const removeUser = async (id: string) => {
    await deleteUser(id); // Hapus data pengguna berdasarkan ID
    fetchAllUsers(); // Ambil ulang data setelah delete
  };

  const addUser = async (user: User) => {
    await createUser(user); // Tambah data pengguna baru
    fetchAllUsers(); // Ambil ulang data setelah menambah
  };

  return { users, loading, error, updateUserInfo, removeUser, addUser };
}
