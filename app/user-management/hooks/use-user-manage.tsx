import { useState, useEffect, useCallback } from "react";
import { userManagementService, User } from "../services/user-manage-service";

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);        // loading fetch list
  const [actionLoading, setActionLoading] = useState(false); // loading CRUD
  const [error, setError] = useState<string | null>(null);

  // Ambil semua user
  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
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
    setActionLoading(true);
    try {
      await userManagementService.update(user.id, user);
      await fetchAllUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete user
  const removeUser = async (id: string) => {
    setActionLoading(true);
    try {
      await userManagementService.deleteById(id);
      await fetchAllUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  // Create user
  const addUser = async (user: Omit<User, "id">) => {
    setActionLoading(true);
    try {
      await userManagementService.create(user);
      await fetchAllUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to add user");
    } finally {
      setActionLoading(false);
    }
  };

  return {
    users,
    loading,
    actionLoading,
    error,
    fetchAllUsers,
    updateUserInfo,
    removeUser,
    addUser,
    isLoading: loading || actionLoading, // ✨ tambahan opsional
  };
}
