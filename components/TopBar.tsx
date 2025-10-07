"use client";

import { useEffect, useState } from "react";
import { LogOut, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { api } from "@services/api";
import { useRouter } from "next/navigation";

export default function TopBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string>("Guest");
  const router = useRouter();

  useEffect(() => {
    // Ambil user dari localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.name || user.full_name || user.email || "User");
      } catch {
        setUserName("User");
      }
    }
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.warn("Gagal logout di server:", error);
    } finally {
      // Bersihkan semua data auth
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      document.cookie = "token=; path=/; max-age=0";

      router.push("/login");
    }
  };

  return (
    <div
      className="w-full flex items-center justify-between px-4 sm:px-6 py-6
    sticky top-0 z-40 bg-white/80 backdrop-blur shadow-sm"
    >
      {/* Search Bar */}
      <div className="relative flex-1 max-w-xs md:max-w-md hidden md:block">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <Input
          type="search"
          placeholder="Search by test name, position, or category..."
          className="pl-10 w-full"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1 md:flex-none" />

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-3 focus:outline-none cursor-pointer"
        >
          <div className="text-right leading-tight hidden sm:block">
            <p className="text-gray-500 text-xs">Hello!</p>
            <p className="font-semibold text-gray-900">{userName}</p>
          </div>
          <Avatar>
            <AvatarFallback>{getInitials(userName)}</AvatarFallback>
          </Avatar>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-44 bg-white border rounded shadow-md z-50">
            <ul className="text-sm text-gray-700">
              <li
                className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut size={14} /> Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
