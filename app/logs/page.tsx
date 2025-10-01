// app/candidates/page.tsx
"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/TopBar";
import ComingSoonPage from "@/components/ComingSoon";

export default function SettingsPage() {

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 bg-white">
        {/* Top bar */}
        <Topbar />

        <main>
          <ComingSoonPage/>
        </main>
      </div>
    </div>
  );
}
