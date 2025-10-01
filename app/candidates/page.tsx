// app/candidates/page.tsx
"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/TopBar";
import { TitleBar } from "./components/title-bar";
import { CandidateTable } from "./components/candidates-table";
export default function CandidatesPage() {

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 bg-white">
        {/* Top bar */}
        <Topbar />

        <main className="flex-1 px-8 pt-2 pb-8">
          <TitleBar />

          <CandidateTable />
        </main>
      </div>
    </div>
  );
}
