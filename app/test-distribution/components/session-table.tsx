"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Briefcase,
  UserCheck,
  GraduationCap,
  Heart,
  Trash2,
  User,
  Edit,
} from "lucide-react";
import { useTestDistributions } from "../hooks/use-test-distribution";
import TableSkeleton from "./table-skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/* ==========================
   ICONS UNTUK CATEGORY
   ========================== */
const CATEGORY_ICON: Record<string, React.ReactNode> = {
  Managerial: <Briefcase size={22} className="text-blue-400" />,
  "All Candidates": <UserCheck size={22} className="text-green-400" />,
  "Fresh Graduates": <GraduationCap size={22} className="text-yellow-400" />,
  "HR Staff": <Heart size={22} className="text-red-400" />,
  Default: <Briefcase size={22} className="text-gray-400" />,
};

/* ==========================
   BADGE STATUS
   ========================== */
const STATUS_STYLE: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  Ongoing: "bg-yellow-100 text-yellow-700",
  Draft: "bg-gray-100 text-gray-700",
  Expired: "bg-red-100 text-red-700",
};

export default function DistributionTable() {
  const { distributions, loading, error } = useTestDistributions();

  if (loading) return <TableSkeleton />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <>
      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-[950px] w-full table-auto">
          <thead>
            <tr className="text-gray-400 text-[15px] font-semibold">
              {[
                "Session Name",
                "Started Date",
                "Candidates",
                "Status",
                "Actions",
              ].map((h) => (
                <th key={h} className="px-4 pb-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {distributions.map((d, i) => (
              <tr key={`desktop-${d.id ?? i}`} className="bg-white">
                {/* Test Name */}
                <td className="px-6 py-4 flex items-center gap-3">
                  <span className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow">
                    {CATEGORY_ICON[d.category] ?? CATEGORY_ICON["Default"]}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900 truncate">
                      {d.testName}
                    </div>
                    <div className="text-xs text-gray-500">{d.category}</div>
                  </div>
                </td>

                {/* Start Date */}
                <td className="px-6 py-4 text-gray-700">
                  {d.startDate || "-"}
                </td>

                {/* Candidates */}
                <td className="px-6 py-4 text-gray-700 font-medium flex items-center gap-2">
                   <User className="w-4 h-4"></User>{d.candidatesTotal}
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap",
                      STATUS_STYLE[d.status] || "bg-gray-100 text-gray-500"
                    )}
                  >
                    {d.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 flex items-center gap-4">
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
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">
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
        {distributions.map((d, i) => (
          <div
            key={`mobile-${d.id ?? i}`}
            className="bg-white rounded-lg shadow-sm p-4 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow">
                  {CATEGORY_ICON[d.category] ?? CATEGORY_ICON["Default"]}
                </span>
                <div>
                  <div className="font-semibold text-gray-900 truncate">
                    {d.testName}
                  </div>
                  <div className="text-xs text-gray-500">{d.category}</div>
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
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Start</span>
                <span className="text-gray-900 font-medium">
                  {d.startDate || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Candidates</span>
                <span className="text-gray-900 font-medium">
                  {d.candidatesTotal}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold",
                    STATUS_STYLE[d.status] || "text-gray-500"
                  )}
                >
                  {d.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
