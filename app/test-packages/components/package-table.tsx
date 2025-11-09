"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Edit,
  Trash2,
  Briefcase,
} from "lucide-react";
import { useTests } from "../hooks/use-test-package";
import TableSkeleton from "./table-skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ICON_MAP } from "@/lib/icon-mapping";

/* ======================================================================
 * TYPE STYLE
 * ====================================================================== */
const TYPE_STYLE: Record<string, string> = {
  DISC: "bg-blue-100 text-blue-700",
  CAAS: "bg-yellow-100 text-yellow-800",
  teliti: "bg-green-100 text-green-700",
};

/* ======================================================================
 * COMPONENT
 * ====================================================================== */
export default function TestTable({
  onEdit,
  page,
  pageSize,
  onPageChange,
}: {
  onEdit: (testId: string) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const { tests, loading, error, handleDelete } = useTests();

  const totalPages = Math.ceil(tests.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedTests = tests.slice(startIndex, startIndex + pageSize);

  if (loading) return <TableSkeleton />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <>
      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-[900px] w-full table-auto">
          <thead>
            <tr className="text-gray-400 text-[15px] font-semibold">
              {["Package Name", "Type", "Questions", "Duration", "Actions"].map(
                (h) => (
                  <th key={h} className="px-4 pb-2 text-left">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedTests.map((test, i) => (
              <tr key={`desktop-${test.id ?? i}`}>
                {/* Test Name */}
                <td className="px-6 py-4 flex items-center gap-3 align-middle">
                  <span className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow overflow-hidden">
                    {ICON_MAP[test.icon_path as keyof typeof ICON_MAP] ?? (
                      <Briefcase size={25} className="text-gray-400" />
                    )}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900 truncate">
                      {test.name}
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td className="px-6 py-4 align-middle">
                  <div className="flex gap-2 flex-wrap">
                    {test.types?.map((type, idx) => (
                      <span
                        key={`desktop-${type}-${idx}`}
                        className={cn(
                          "inline-block px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap",
                          TYPE_STYLE[type] || "bg-gray-100 text-gray-500"
                        )}
                      >
                        {type === "teliti" ? "Fast Accuracy" : type}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Questions */}
                <td className="px-6 py-4 text-sm text-gray-900 font-medium align-middle">
                  {test.questions}
                </td>

                {/* Duration */}
                <td className="px-6 py-4 text-sm text-gray-900 font-medium align-middle">
                  {test.duration}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 flex items-center gap-4 align-middle">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-700 px-2 py-2 rounded-md hover:bg-gray-100"
                      >
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="min-w-[160px] rounded-xl py-2 px-1 shadow-lg border border-gray-100"
                    >
                      <DropdownMenuItem onClick={() => onEdit(test.id)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Package
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => handleDelete(test.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD */}
      <div className="md:hidden space-y-6">
        {paginatedTests.map((test, i) => (
          <div
            key={`mobile-${test.id ?? i}`}
            className="bg-white rounded-lg shadow-sm p-4 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow overflow-hidden">
                  {ICON_MAP[test.icon_path as keyof typeof ICON_MAP] ?? (
                    <Briefcase size={20} className="text-gray-400" />
                  )}
                </span>
                <div>
                  <div className="font-semibold text-gray-900 truncate">
                    {test.name}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <MoreVertical size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[120px] rounded-lg"
                >
                  <DropdownMenuItem onClick={() => onEdit(test.id)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Package
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={() => handleDelete(test.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Type</span>
                <div className="flex gap-2">
                  {test.types?.map((type, idx) => (
                    <span
                      key={`mobile-${type}-${idx}`}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold",
                        TYPE_STYLE[type] || "bg-gray-100 text-gray-500"
                      )}
                    >
                      {(type === "teliti" ? "Fast Accuracy" : type).charAt(0)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Questions</span>
                <span className="text-gray-900 font-medium">
                  {test.questions}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="text-gray-900 font-medium">
                  {test.duration}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
