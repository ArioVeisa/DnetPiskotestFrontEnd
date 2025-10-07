"use client";
import { Loader2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );
}
