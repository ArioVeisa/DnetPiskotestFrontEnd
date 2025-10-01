// app/results/page.tsx
"use client";

import React, { useState } from "react";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import { TitleBar } from "./components/title-bar";
import { ResultTable } from "./components/result-table";
import { ResultDialog } from "./components/result-dialog";
import { useResults, useResultDetail } from "./hooks/use-result";
import { exportAllResults, exportResultPdf } from "./services/result-service";
import TableSkeleton from "./components/table-skeleton";

export default function ResultsPage() {
  const { results, loading } = useResults();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { detail } = useResultDetail(selectedId);

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
              onView={(id) => setSelectedId(id)}
              onDownload={(id) => exportResultPdf(id)}
            />
          )}

          <ResultDialog
            open={!!selectedId}
            detail={detail}
            onOpenChange={(open: boolean) => {
              if (!open) setSelectedId(null);
            }}
            onDownloadPdf={() => selectedId && exportResultPdf(selectedId)}
          />
        </main>
      </div>
    </div>
  );
}
