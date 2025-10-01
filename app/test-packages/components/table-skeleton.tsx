// components/TableSkeleton.tsx
"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Desktop Skeleton */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              {[...Array(5)].map((_, idx) => (
                <th key={idx} className="px-6 py-4">
                  <Skeleton className="h-4 w-3/4" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(4)].map((_, row) => (
              <tr key={row} className="bg-white">
                {/* Avatar + Name Skeleton */}
                <td className="px-6 py-4 flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </td>
                {/* Type Skeleton */}
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-20 rounded" />
                </td>
                {/* Period Skeleton */}
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-24 rounded" />
                </td>
                {/* Status Skeleton */}
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-16 rounded" />
                </td>
                {/* Actions Skeleton */}
                <td className="px-6 py-4 flex items-center gap-4">
                  <Skeleton className="h-6 w-16 rounded" />
                  <Skeleton className="h-6 w-16 rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Skeleton */}
      <div className="md:hidden space-y-6">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between gap-3">
                <Skeleton className="h-6 w-full rounded" />
                <Skeleton className="h-6 w-full rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
