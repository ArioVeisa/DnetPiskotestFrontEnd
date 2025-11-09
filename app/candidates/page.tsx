// app/candidates/page.tsx
"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/TopBar";
import { TitleBar } from "./components/title-bar";
import { CandidateTable } from "./components/candidates-table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCandidates } from "./hooks/use-candidates";

export default function CandidatesPage() {
  const { candidates } = useCandidates();
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(candidates.length / pageSize);

  const handlePagePrev = () => setPage((p) => Math.max(p - 1, 1));
  const handlePageNext = () => setPage((p) => Math.min(p + 1, totalPages));
  const handlePageChange = (newPage: number) => setPage(newPage);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 bg-white">
        {/* Top bar */}
        <div className="sticky top-0 z-50 bg-white shadow-sm">
          <Topbar />
        </div>

        <div className="flex flex-col flex-1 relative overflow-hidden">
          <main className="flex-1 px-8 pt-2 overflow-y-auto" style={{ paddingBottom: totalPages > 1 ? '90px' : '20px' }}>
            <TitleBar />

            <CandidateTable page={page} pageSize={pageSize} />
          </main>

          {/* Fixed Pagination */}
          {totalPages > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40 px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 mx-auto md:mx-0">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={handlePagePrev}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <Button
                      key={num}
                      size="sm"
                      variant={page === num ? "default" : "outline"}
                      onClick={() => handlePageChange(num)}
                      className={cn(
                        "w-8 h-8",
                        page === num && "bg-blue-500 hover:bg-blue-600 text-white"
                      )}
                    >
                      {num}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={handlePageNext}
                    className="flex items-center gap-1"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="hidden md:block">
                  Showing page <span className="font-semibold">{page}</span> of{" "}
                  <span className="font-semibold">{totalPages}</span> candidates
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
