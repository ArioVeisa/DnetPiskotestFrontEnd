import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface TitleBarProps {
  title: string;
  subtitle: string;
  onExportAll?: () => void;
}

export function TitleBar({ title, subtitle, onExportAll }: TitleBarProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{subtitle}</p>
        </div>
        {onExportAll && (
          <Button
            onClick={onExportAll}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export All
          </Button>
        )}
      </div>
    </div>
  );
}