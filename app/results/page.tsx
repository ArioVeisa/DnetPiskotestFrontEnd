// app/results/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Tambahkan router
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import { TitleBar } from "./components/title-bar";
import { ResultTable } from "./components/result-table";
import { useResults } from "./hooks/use-result";
import { exportAllResults, exportResultPdf } from "./services/result-service";
import TableSkeleton from "./components/table-skeleton";

export default function ResultsPage() {
  const router = useRouter(); // ✅ Inisialisasi router
  const { results, loading } = useResults();
  const [, setSelectedId] = useState<string | null>(null);

  // ✅ Handler untuk View
  const handleView = (id: string) => {
    setSelectedId(id);
    router.push(`/results/result-candidate/${id}`);
  };

  // ✅ Handler untuk Download
  const handleDownload = (id: string) => {
    exportResultPdf(id);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 bg-white">
        {/* Top bar */}
        <TopBar />

        {/* Page content */}
        <main className="flex-1 px-8 pt-2 pb-8">
          <TitleBar
            title="Psychotest Results"
            subtitle="View and analyze psychometric test results"
            onExportAll={() => exportAllResults()}
          />

          {loading ? (
            <TableSkeleton />
          ) : (
            <ResultTable
              results={results}
              onView={handleView}
              onDownload={handleDownload}
            />
          )}
        </main>
      </div>
    </div>
  );
}
