// src/app/user-management/hooks/use-user-management.ts
import { useState, useEffect, useCallback } from "react";
import { userManagementService, User } from "../services/user-manage-service";

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Ambil semua user
  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await userManagementService.fetchAll();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  // Update user
  const updateUserInfo = async (user: User) => {
    try {
      setLoading(true);
      await userManagementService.update(user.id, user);
      await fetchAllUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const removeUser = async (id: string) => {
    try {
      setLoading(true);
      await userManagementService.deleteById(id);
      await fetchAllUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  // Create user
  const addUser = async (user: Omit<User, "id">) => {
    try {
      setLoading(true);
      await userManagementService.create(user);
      await fetchAllUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, error, fetchAllUsers, updateUserInfo, removeUser, addUser };
}
