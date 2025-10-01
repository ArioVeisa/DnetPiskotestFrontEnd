import {
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  FileText,
  BarChart2,
  Download,
} from "lucide-react";
import React from "react";

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
  onClick: () => void;
}

// Dummy data generators
export const getStats = (): StatCard[] => [
  {
    title: "Total Kandidat",
    value: 156,
    change: 12,
    changeLabel: "% dari bulan lalu",
    icon: <Users className="w-5 h-5 text-blue-500" />,
  },
  {
    title: "Tes Berlangsung",
    value: 23,
    change: 5,
    changeLabel: "% dari bulan lalu",
    icon: <Clock className="w-5 h-5 text-blue-500" />,
  },
  {
    title: "Tes Selesai",
    value: 89,
    change: 18,
    changeLabel: "% dari bulan lalu",
    icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
  },
  {
    title: "Menunggu Review",
    value: 44,
    change: -3,
    changeLabel: "% dari bulan lalu",
    icon: <AlertCircle className="w-5 h-5 text-blue-500" />,
  },
];

export const getLatestTests = (): TestActivity[] => [
  {
    id: "1",
    name: "Ahmad Rizki",
    position: "Software Engineer",
    types: ["DISC", "CAAS"],
    status: "Selesai",
    date: "2025-06-27",
  },
  {
    id: "2",
    name: "Sari Dewi",
    position: "Marketing Manager",
    types: ["DISC", "Fast Accuracy"],
    status: "Berlangsung",
    date: "2025-06-27",
  },
  {
    id: "3",
    name: "Budi Santoso",
    position: "HR Specialist",
    types: ["CAAS"],
    status: "Belum Mulai",
    date: "2025-06-26",
  },
];

export const getQuickActions = (): QuickAction[] => [
  { label: "Tambah Kandidat", icon: <Plus className="w-5 h-5" />, onClick: () => {} },
  { label: "Kelola Soal", icon: <FileText className="w-5 h-5" />, onClick: () => {} },
  { label: "Lihat Laporan", icon: <BarChart2 className="w-5 h-5" />, onClick: () => {} },
  { label: "Export Data", icon: <Download className="w-5 h-5" />, onClick: () => {} },
];
