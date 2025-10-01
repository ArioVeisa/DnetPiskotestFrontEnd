// src/app/users/[id]/components/TopBarTest.tsx
"use client";
import React from "react";
import { Briefcase } from "lucide-react";

interface TopBarTestProps {
  testTitle: string;
  testType: string;
  candidateName: string;
  candidateRole: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TopBarTest({
  testTitle,
  testType,
  candidateName,
  candidateRole,
}: TopBarTestProps) {
  return (
    <div className="w-full flex items-center justify-between px-6 py-3 border-b bg-white">
      {/* Kiri: Icon + Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Icon bulat */}
        <span className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
          {/* Custom SVG icon (bisa diganti) */}
          <span className="w-14 h-14 flex items-center justify-center">
            <Briefcase size={20} className="text-blue-500" />
          </span>
        </span>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-sm text-gray-900 truncate">
            {testTitle}
          </span>
          <span className="text-xs text-gray-400">{testType}</span>
        </div>
      </div>
      {/* Kanan: Nama + Role + Inisial */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="text-right mr-2 min-w-0">
          <span className="block text-sm font-medium text-gray-900 truncate">
            {candidateName}
          </span>
          <span className="block text-xs text-gray-400">{candidateRole}</span>
        </div>
        {/* Avatar Inisial */}
        <span className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-base border border-blue-200 select-none">
          {getInitials(candidateName)}
        </span>
      </div>
    </div>
  );
}
