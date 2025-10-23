"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/TopBar";
import { LogsTable } from "./components/logs-table";
import { useLogs } from "./hooks/use-logs";
import { LogsFilters } from "./services/logs-service";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function LogsPage() {
  const [filters, setFilters] = useState<LogsFilters>({});
  const { logs, loading, error, refreshLogs } = useLogs(filters);

  const handleFiltersChange = (newFilters: LogsFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 bg-white">
        {/* Top bar */}
        <Topbar />

        <main className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
              <p className="text-gray-600 mt-2">
                Monitor and track all system activities and user actions
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Logs Table */}
            <LogsTable
              logs={logs}
              loading={loading}
              onRefresh={refreshLogs}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
