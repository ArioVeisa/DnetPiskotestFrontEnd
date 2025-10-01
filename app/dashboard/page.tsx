"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { StatCards } from "./components/stat-card";
import { LatestTests } from "./components/latest-test";
import { QuickActions } from "./components/quick-action";
import { useDashboard } from "./hooks/use-dashboard";

export default function DashboardPage() {
  const { stats, activities, actions, loading } = useDashboard();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-white">
        <TopBar />
        <main className="flex-1 p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Statistik atas */}
              <StatCards stats={stats} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tes Terbaru */}
                <LatestTests activities={activities} />

                {/* Aksi Cepat */}
                <QuickActions actions={actions} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
