// app/user-management/components/title-bar.tsx

"use client";

import { Button } from "@/components/ui/button";  // Tombol dari UI
import { Plus } from "lucide-react";  // Ikon Plus

type TitleBarProps = {
  onAdd?: () => void; // Fungsi untuk membuka dialog
};

export default function TitleBar({ onAdd }: TitleBarProps) {  // Pastikan ada export default
  return (
    <div className="mb-6 mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage and organize your users efficiently
        </p>
      </div>

      <Button
        onClick={onAdd}
        size="lg"
        className="w-full md:w-auto"
        aria-label="Create new user"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add New User
      </Button>
    </div>
  );
}
