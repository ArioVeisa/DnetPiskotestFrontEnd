"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
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
  ChevronLeft,
  ChevronRight,
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
import EditSessionDialog from "./edit-session-dialog";
import { Distribution } from "../services/test-distribution-service";
import { ICON_MAP } from "@/lib/icon-mapping";

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
  Scheduled: "bg-blue-100 text-blue-700",
  Draft: "bg-gray-100 text-gray-700",
  Expired: "bg-red-100 text-red-700",
};

export default function DistributionTable() {
  const { distributions, loading, error, remove, refresh, update } = useTestDistributions();
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Distribution | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus test distribution ini?')) {
      try {
        console.log('🗑️ Attempting to delete distribution with ID:', id);
        await remove(id);
        console.log('✅ Distribution deleted successfully, refreshing data...');
        await refresh(); // Refresh data setelah delete
        console.log('✅ Data refreshed successfully');
      } catch (error: unknown) {
        console.error('❌ Error deleting distribution:', error);
        console.error('❌ Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          response: axios.isAxiosError(error) ? error.response?.data : undefined,
          status: axios.isAxiosError(error) ? error.response?.status : undefined
        });
        
        // Extract meaningful error message from backend response
        let errorMessage = 'Unknown error';
        if (axios.isAxiosError(error) && error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        alert(`Gagal menghapus test distribution: ${errorMessage}`);
      }
    }
  };

  const handleEdit = (session: Distribution) => {
    setSelectedSession(session);
    setEditDialogOpen(true);
    setEditError(null);
  };

  const handleSaveEdit = async (id: number, data: Partial<Distribution>) => {
    try {
      setSaving(true);
      setEditError(null);
      await update(id, data);
      await refresh(); // Refresh data after update
      setEditDialogOpen(false);
      setSelectedSession(null);
    } catch (error: unknown) {
      console.error('❌ Error updating distribution:', error);
      setEditError(error instanceof Error ? error.message : 'Failed to update session');
    } finally {
      setSaving(false);
    }
  };

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(distributions.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedData = distributions.slice(startIndex, startIndex + pageSize);

  const handlePrev = () => setPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setPage((p) => Math.min(p + 1, totalPages));

  if (loading) return <TableSkeleton />;
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error loading distributions</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
        </div>
      </div>
    </div>
  );

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
            {paginatedData.map((d, i) => (
              <tr key={`desktop-${d.id ?? i}`}>
                {/* Test Name */}
                <td className="px-6 py-4 flex items-center gap-3">
                  <span className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow">
                    {d.iconPath && d.iconPath in ICON_MAP ? (
                      <span className="text-blue-400">
                        {React.cloneElement(ICON_MAP[d.iconPath as keyof typeof ICON_MAP] as React.ReactElement, { size: 22 })}
                      </span>
                    ) : (
                      CATEGORY_ICON[d.category] ?? CATEGORY_ICON["Default"]
                    )}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900 truncate">
                      {d.testName.split(" - ")[0]}
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
                  <User className="w-4 h-4" />
                  {d.candidatesTotal}
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
                      <DropdownMenuItem onClick={() => handleEdit(d)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-500"
                        onClick={() => handleDelete(d.id)}
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
        {paginatedData.map((d, i) => (
          <div
            key={`mobile-${d.id ?? i}`}
            className="bg-white rounded-lg shadow-sm p-4 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow">
                  {d.iconPath && d.iconPath in ICON_MAP ? (
                    <span className="text-blue-400">
                      {React.cloneElement(ICON_MAP[d.iconPath as keyof typeof ICON_MAP] as React.ReactElement, { size: 20 })}
                    </span>
                  ) : (
                    CATEGORY_ICON[d.category] ?? CATEGORY_ICON["Default"]
                  )}
                </span>
                <div>
                  <div className="font-semibold text-gray-900 truncate">
                    {d.testName.split(" - ")[0]}
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
                  <DropdownMenuItem onClick={() => handleEdit(d)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-500"
                    onClick={() => handleDelete(d.id)}
                  >
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

      {/* Edit Session Dialog */}
      <EditSessionDialog
        open={editDialogOpen}
        onOpenChange={(open: boolean) => {
          setEditDialogOpen(open);
          if (!open) {
            // Auto refresh untuk memastikan state bersih dan menghindari freeze overlay
            setTimeout(() => {
              window.location.reload();
            }, 50);
          }
        }}
        session={selectedSession}
        onSave={handleSaveEdit}
        saving={saving}
        error={editError}
      />
    </>
  );
}
