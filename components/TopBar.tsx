"use client";

import { useState } from "react";
import { Bell, LogOut, User, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function TopBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="w-full flex items-center justify-between px-4 sm:px-6 py-6
  sticky top-0 z-40 bg-white/80 backdrop-blur shadow-sm"
    >
      {/* Search Bar - Visible on md and up, takes available space */}
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

      {/* Spacer for mobile, or to push elements apart on desktop */}
      <div className="flex-1 md:flex-none" />

      {/* Notification on left - hidden on mobile, visible on sm+ */}
      <div className="relative p-2 rounded-full bg-gray-100 hidden sm:flex">
        <Bell className="text-gray-700" size={18} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      </div>

      {/* Profile on right */}
      <div className="relative">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-3 focus:outline-none cursor-pointer"
        >
          {/* Greeting only sm+ */}
          <div className="text-right leading-tight hidden sm:block">
            <p className="text-gray-500 text-xs">Hello!</p>
            <p className="font-semibold text-gray-900">James Clear</p>
          </div>
          {/* Avatar using ShadCN */}
          <Avatar>
            <AvatarFallback>JC</AvatarFallback>
          </Avatar>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-44 bg-white border rounded shadow-md z-50">
            <ul className="text-sm text-gray-700">
              {/* Notification appears in dropdown if mobile */}
              <li className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 sm:hidden cursor-pointer">
                <Bell size={14} /> Notifications
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                <User size={14} /> Profile
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                <LogOut size={14} /> Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
