"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import { TitleBar } from "./components/title-bar";
import { ResultTable } from "./components/result-table";
import { useResults } from "./hooks/use-result"; // ✅ pakai hooks sesuai service
import { resultsService } from "./services/result-service"; // ✅ gunakan object resultsService
import TableSkeleton from "./components/table-skeleton";

export default function ResultsPage() {
  const router = useRouter();
  const { results, loading } = useResults();
  const [, setSelectedId] = useState<string | null>(null);

  // ✅ Handler untuk melihat detail hasil kandidat
  const handleView = (candidateId: string) => {
    setSelectedId(candidateId);
    router.push(`/results/result-candidate/${candidateId}`);
  };

  // ✅ Handler untuk download hasil (PDF)
  const handleDownload = async (candidateId: string) => {
    try {
      await resultsService.downloadResult(candidateId);
      console.log(`✅ PDF hasil kandidat ${candidateId} berhasil diunduh`);
    } catch (error) {
      console.error("❌ Gagal mengunduh hasil kandidat:", error);
    }
  };

  // ✅ Handler untuk export semua hasil (sementara — bisa ditambah endpoint backend)
  const handleExportAll = async () => {
    try {
      // Saat ini belum ada endpoint exportAll di service
      // Kamu bisa ganti dengan fungsi lain jika sudah tersedia di backend
      const allResults = await resultsService.getAll();
      console.log("✅ Semua hasil kandidat berhasil diambil:", allResults);
      alert("Export all berhasil (simulasi).");
    } catch (error) {
      console.error("❌ Gagal export semua hasil:", error);
    }
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
            onExportAll={handleExportAll}
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
