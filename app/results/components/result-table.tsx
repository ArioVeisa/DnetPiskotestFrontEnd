// components/ResultTable.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Result } from "../services/result-service";

export interface ResultTableProps {
  results: Result[];
  onView: (candidateId: string) => void;
  onDownload: (candidateId: string) => void;
}

// warna badge untuk type
const TYPE_STYLE: Record<string, string> = {
  DISC: "bg-blue-100 text-blue-700",
  CAAS: "bg-yellow-100 text-yellow-800",
  "Fast Accuracy": "bg-green-100 text-green-700",
};

export function ResultTable({ results, onView, onDownload }: ResultTableProps) {
  return (
    <>
      {/* DESKTOP: tabel tanpa garis antar baris */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-[900px] w-full table-auto">
          <thead>
            <tr className="text-gray-400 text-[15px] font-semibold">
              {["Candidates", "Type", "Period", "Status", "Actions"].map(
                (h) => (
                  <th key={h} className="px-4 pb-2 text-left">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {results.map((r) => {
              // potong nama jadi dua kata pertama
              const displayName = r.name.split(" ").slice(0, 2).join(" ");
              return (
                <tr key={r.candidateId} className="bg-white">
                  {/* Candidates */}
                  <td className="px-6 py-4 flex items-center gap-3 align-middle">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-semibold">
                      {r.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {displayName}
                      </div>
                      <div className="text-xs text-gray-500">{r.email}</div>
                      <div className="mt-1">
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
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex gap-2 flex-wrap">
                      {r.types.map((type) => (
                        <span
                          key={type}
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
                            TYPE_STYLE[type] || "bg-gray-100 text-gray-500"
                          )}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Period */}
                  <td className="px-6 py-4 text-sm text-gray-800 align-middle">
                    {r.period}
                  </td>

                  {/* Status */}
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

                  {/* Actions */}
                  <td className="px-6 py-4 flex items-center gap-4 align-middle">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onView(r.candidateId)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300"
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

      {/* MOBILE: card list dengan nama 2 kata pertama */}
      <div className="md:hidden space-y-4">
        {results.map((r) => {
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
                <div>
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
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <div className="flex gap-2 flex-wrap">
                    {r.types.map((type) => (
                      <span
                        key={type}
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
                          TYPE_STYLE[type] || "bg-gray-100 text-gray-500"
                        )}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
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
                    variant="default"
                    className="flex-1"
                    onClick={() => onView(r.candidateId)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1 bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300"
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
    </>
  );
}
