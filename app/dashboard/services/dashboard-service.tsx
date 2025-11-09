import {
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  FileText,
  BarChart2,
  User,
} from "lucide-react";
import React from "react";
import { api } from "@services/api";
import axios from "axios";

export interface StatCard {
  title: string;
  value: number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
}

export interface TestActivity {
  id: string;
  name: string;
  position: string;
  types: string[];
  status: "Selesai" | "Berlangsung" | "Belum Mulai";
  date: string;
}

export interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  path?: string; // 👈 Tambahkan ini untuk navigasi
}

// API Response interfaces
export interface DashboardApiResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      total_tests_completed: number;
      total_tests_in_progress: number;
      total_tests_pending: number;
      completion_rate: string;
      total_candidates: number;
      total_hrd_users: number;
    };
    recent_activities: Array<{
      user_name: string;
      description: string;
      timestamp: string;
    }>;
  };
}

// API Service functions
export const getDashboardData = async (): Promise<DashboardApiResponse> => {
  try {
    console.log("🔍 [dashboard] Fetching dashboard data...");
    const response = await api.get<DashboardApiResponse>("/dashboard-public");
    console.log("✅ [dashboard] Dashboard data received:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ [dashboard] Error fetching dashboard data:", error);
    if (axios.isAxiosError(error)) {
      console.error("❌ [dashboard] Response:", error.response?.data);
      console.error("❌ [dashboard] Status:", error.response?.status);
      throw new Error(
        error.response?.data?.message || "Gagal mengambil data dashboard"
      );
    }
    throw new Error(
      "Terjadi error tidak dikenal saat mengambil data dashboard"
    );
  }
};

// Convert API data to StatCard format
export const convertApiDataToStats = (
  apiData: DashboardApiResponse["data"]
): StatCard[] => [
  {
    title: "Total Candidates",
    value: apiData.summary.total_candidates,
    change: 0, // API tidak menyediakan perubahan
    changeLabel: "",
    icon: <Users className="w-5 h-5 text-blue-500" />,
  },
  {
    title: "Ongoing Tests",
    value: apiData.summary.total_tests_in_progress,
    change: 0,
    changeLabel: "",
    icon: <Clock className="w-5 h-5 text-blue-500" />,
  },
  {
    title: "Completed Tests",
    value: apiData.summary.total_tests_completed,
    change: 0,
    changeLabel: "",
    icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
  },
  {
    title: "Pending Tests",
    value: apiData.summary.total_tests_pending,
    change: 0,
    changeLabel: "",
    icon: <AlertCircle className="w-5 h-5 text-blue-500" />,
  },
];

// Fallback dummy data generators (untuk development)
export const getStats = (): StatCard[] => [
  {
    title: "Total Candidates",
    value: 0,
    change: 0,
    changeLabel: "",
    icon: <Users className="w-5 h-5 text-blue-500" />,
  },
  {
    title: "Ongoing Tests",
    value: 0,
    change: 0,
    changeLabel: "",
    icon: <Clock className="w-5 h-5 text-blue-500" />,
  },
  {
    title: "Completed Tests",
    value: 0,
    change: 0,
    changeLabel: "",
    icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
  },
  {
    title: "Pending Tests",
    value: 0,
    change: 0,
    changeLabel: "",
    icon: <AlertCircle className="w-5 h-5 text-blue-500" />,
  },
];

// Convert API recent activities to TestActivity format
export const convertApiDataToActivities = (
  apiData: DashboardApiResponse["data"]
): TestActivity[] => {
  return apiData.recent_activities.map((activity, index) => ({
    id: (index + 1).toString(),
    name: activity.user_name,
    position: "System Activity", // API tidak menyediakan position
    types: ["Activity"],
    status: "Selesai" as const,
    date: activity.timestamp.split(" ")[0], // Ambil hanya tanggal
  }));
};

// Fallback dummy data generators (untuk development) - hanya tes yang sudah selesai
export const getLatestTests = (): TestActivity[] => [
  {
    id: "1",
    name: "Ahmad Rizki",
    position: "Software Engineer",
    types: ["DISC", "CAAS"],
    status: "Selesai",
    date: "2025-10-07",
  },
  {
    id: "2",
    name: "Sari Dewi",
    position: "Marketing Manager",
    types: ["DISC", "Fast Accuracy"],
    status: "Selesai",
    date: "2025-06-27",
  },
  {
    id: "3",
    name: "Budi Santoso",
    position: "HR Specialist",
    types: ["CAAS"],
    status: "Selesai",
    date: "2025-10-06",
  },
  {
    id: "4",
    name: "Citra Lestari",
    position: "Finance Manager",
    types: ["DISC", "Fast Accuracy"],
    status: "Selesai",
    date: "2025-10-05",
  },
  {
    id: "5",
    name: "Doni Firmansyah",
    position: "IT Manager",
    types: ["DISC", "CAAS"],
    status: "Selesai",
    date: "2025-10-04",
  },
];

export const getQuickActions = (): QuickAction[] => [
  {
    label: "Set Up Test Package",
    icon: <Plus className="w-5 h-5" />,
    path: "/test-packages", // 👈 arahkan ke halaman test packages
  },
  {
    label: "Manage Questions",
    icon: <FileText className="w-5 h-5" />,
    path: "/questions-bank", // 👈 halaman manajemen soal
  },
  {
    label: "View Report",
    icon: <BarChart2 className="w-5 h-5" />,
    path: "/results", // 👈 halaman laporan
  },
  {
    label: "Candidate",
    icon: <User className="w-5 h-5" />,
    path: "/candidates", // 👈 halaman kandidat
  },
];
