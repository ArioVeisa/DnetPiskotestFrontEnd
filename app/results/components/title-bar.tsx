// components/TitleBar.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export interface TitleBarProps {
  title: string;
  subtitle: string;
  onExportAll: () => void;
}

export function TitleBar({ onExportAll }: TitleBarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6 mt-8">
      <div>
        <h1 className="text-2xl font-bold">Test Results</h1>
        <p className="text-muted-foreground text-sm">
          View and analyze psychometric test results{" "}
        </p>
      </div>
      <Button onClick={onExportAll} size="lg" className="w-full md:w-auto">
        <Download /> Export All
      </Button>
    </div>
  );
}
