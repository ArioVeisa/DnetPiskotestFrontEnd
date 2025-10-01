import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TestActivity } from "../services/dashboard-service";

interface LatestTestsProps {
  activities: TestActivity[];
}

export function LatestTests({ activities }: LatestTestsProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Tes Terbaru</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {activities.map((act) => (
          <div
            key={act.id}
            className="flex items-center justify-between border rounded-lg px-4 py-3"
          >
            <div>
              <div className="font-semibold text-gray-900">{act.name}</div>
              <div className="text-xs text-gray-500">{act.position}</div>
              <div className="text-xs text-gray-500">{act.types.join(" + ")}</div>
            </div>
            <div className="text-right space-y-1">
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-semibold",
                  act.status === "Selesai"
                    ? "bg-green-100 text-green-700"
                    : act.status === "Berlangsung"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {act.status}
              </span>
              <div className="text-xs text-gray-500">{act.date}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
