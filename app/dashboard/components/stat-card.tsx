import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StatCard } from "../services/dashboard-service";

interface StatCardsProps {
  stats: StatCard[];
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.title} className="bg-white">
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 font-medium">{s.title}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className={cn("text-sm", s.change >= 0 ? "text-green-500" : "text-red-500")}>
                {s.change >= 0 ? "+" : ""}
                {s.change}
                {s.changeLabel}
              </div>
            </div>
            <div className="p-2 bg-blue-50 rounded-full">{s.icon}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
