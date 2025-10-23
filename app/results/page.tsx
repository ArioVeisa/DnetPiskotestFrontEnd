"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import { TitleBar } from "./components/title-bar";
import { ResultTable } from "./components/result-table";
import { useResults } from "./hooks/use-result"; // ✅ Use hooks according to service
import { resultsService } from "./services/result-service"; // ✅ Use resultsService object
import TableSkeleton from "./components/table-skeleton";

export default function ResultsPage() {
  const router = useRouter();
  const { results, loading } = useResults();
  const [, setSelectedId] = useState<string | null>(null);

  // ✅ Handler to view candidate result details
  const handleView = (candidateId: string) => {
    setSelectedId(candidateId);
    router.push(`/results/result-candidate/${candidateId}`);
  };

  // ✅ Handler to download results (PDF)
  const handleDownload = async (candidateId: string) => {
    try {
      await resultsService.downloadResult(candidateId);
      // console.log(`✅ PDF hasil kandidat ${candidateId} berhasil diunduh`); // Debug logging removed
    } catch (error) {
      // console.error("❌ Gagal mengunduh hasil kandidat:", error); // Error logging removed
      alert(`Failed to download test results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // ✅ Handler to export all results (temporary — can add backend endpoint)
  const handleExportAll = async () => {
    try {
      // Currently no exportAll endpoint in service
      // You can replace with other function if available in backend
      const allResults = await resultsService.getAll();
      // console.log("✅ Semua hasil kandidat berhasil diambil:", allResults); // Debug logging removed
      alert("Export all successful (simulation).");
    } catch (error) {
      // console.error("❌ Gagal export semua hasil:", error); // Error logging removed
    }
  };

  // ✅ Handler to delete individual test results
  const handleDelete = async (candidateId: string) => {
    try {
      await resultsService.deleteResult(candidateId);
      alert("✅ Hasil tes berhasil dihapus!");
      
      // Refresh halaman untuk menampilkan data terbaru
      window.location.reload();
    } catch (error) {
      console.error("❌ Gagal menghapus hasil tes:", error);
      alert(`❌ Gagal menghapus hasil tes: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
              onDelete={handleDelete}
            />
          )}
        </main>
      </div>
    </div>
  );
}
