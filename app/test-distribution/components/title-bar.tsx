"use client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type TitleBarProps = {
  onAddTest?: () => void; // ✅ sudah benar
};

export default function TitleBar({ onAddTest }: TitleBarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6 mt-8">
      <div>
        <h1 className="text-2xl font-bold">Test Distribution</h1>
        <p className="text-muted-foreground text-sm">
          Create and manage test sessions for your candidates
        </p>
      </div>
      <Button onClick={onAddTest} size="lg" className="w-full md:w-auto">
        <Plus className="mr-2 h-4 w-4" /> Create Session
      </Button>
    </div>
  );
}
