"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Result } from "../services/result-service";

export interface ResultTableProps {
  results: Result[];
  onView: (candidateId: string) => void;
  onDownload: (candidateId: string) => void;
  pageSize?: number; // optional default 5
}

export function ResultTable({
  results,
  onView,
  onDownload,
  pageSize = 5,
}: ResultTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(results.length / pageSize);

  const paginatedResults = results.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <>
      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-[900px] w-full table-auto">
          <thead>
            <tr className="text-gray-400 text-[15px] font-semibold">
              {["Candidates", "Position", "Period", "Status", "Actions"].map(
                (h) => (
                  <th key={h} className="px-4 pb-3 text-left">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedResults.map((r) => {
              const displayName = r.name.split(" ").slice(0, 2).join(" ");
              return (
                <tr key={r.candidateId}>
                  <td className="px-6 py-4 flex items-center gap-3 align-middle">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-semibold">
                      {r.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {displayName}
                      </div>
                      <div className="text-xs text-gray-500">{r.email}</div>
                    </div>
                  </td>

                  <td className="px-6 py-4 align-middle">
                    <span
                      className={cn(
                        "inline-block px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
                        {
                          "bg-blue-100 text-blue-700":
                            r.position === "UI/UX Designer",
                          "bg-yellow-100 text-yellow-800":
                            r.position === "Quality Assurance",
                          "bg-green-100 text-green-700":
                            r.position === "Engineer",
                          "bg-red-100 text-red-700":
                            r.position === "Frontend Dev",
                        }
                      )}
                    >
                      {r.position}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-800 align-middle">
                    {r.period}
                  </td>

                  <td className="px-6 py-4 align-middle">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
                        r.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-800"
                      )}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 flex items-center gap-3 align-middle">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView(r.candidateId)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-500 text-white hover:bg-blue-600"
                      onClick={() => onDownload(r.candidateId)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE LIST */}
      <div className="md:hidden space-y-4">
        {paginatedResults.map((r) => {
          const displayName = r.name.split(" ").slice(0, 2).join(" ");
          return (
            <div
              key={r.candidateId}
              className="bg-white rounded-lg shadow-sm p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 font-semibold">
                    {r.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {displayName}
                    </div>
                    <div className="text-xs text-gray-500">{r.email}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Position</span>
                  <span
                    className={cn(
                      "inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap",
                      {
                        "bg-blue-100 text-blue-700":
                          r.position === "UI/UX Designer",
                        "bg-yellow-100 text-yellow-800":
                          r.position === "Quality Assurance",
                        "bg-green-100 text-green-700":
                          r.position === "Engineer",
                        "bg-red-100 text-red-700":
                          r.position === "Frontend Dev",
                      }
                    )}
                  >
                    {r.position}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Period</span>
                  <span className="text-gray-900">{r.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
                      r.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-800"
                    )}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="flex justify-between space-x-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onView(r.candidateId)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-500 text-white hover:bg-blue-600"
                    onClick={() => onDownload(r.candidateId)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 text-sm text-gray-600">
          <div className="flex items-center gap-2 mx-auto md:mx-0">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={handlePrev}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <Button
                key={num}
                size="sm"
                variant={page === num ? "default" : "outline"}
                onClick={() => setPage(num)}
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
              onClick={handleNext}
              className="flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="hidden md:block">
            Showing <span className="font-semibold">{page}</span> of{" "}
            <span className="font-semibold">{totalPages}</span> Pages
          </div>
        </div>
      )}
    </>
  );
}
