"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DistributionTableSkeleton() {
  return (
    <div className="animate-pulse">
      {/* DESKTOP SKELETON */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              {[...Array(6)].map((_, idx) => (
                <th key={idx} className="px-6 py-4">
                  <Skeleton className="h-4 w-3/4" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(4)].map((_, row) => (
              <tr key={row} className="bg-white">
                {/* Test Name */}
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-40" />
                </td>
                {/* Started Date */}
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-28" />
                </td>
                {/* End Date */}
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-28" />
                </td>
                {/* Candidates */}
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                {/* Status */}
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-20 rounded" />
                </td>
                {/* Actions */}
                <td className="px-6 py-4 flex items-center gap-4">
                  <Skeleton className="h-6 w-16 rounded" />
                  <Skeleton className="h-6 w-16 rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE SKELETON */}
      <div className="md:hidden space-y-6">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-16" />
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
