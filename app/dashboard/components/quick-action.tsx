// components/quick-actions.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { QuickAction } from "../services/dashboard-service";

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Aksi Cepat</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((a, idx) => (
          <Button
            key={a.label}
            onClick={a.onClick}
            size="lg"
            variant={idx === 0 ? "default" : "outline"}
            className={`
              w-full h-16 flex items-center justify-center gap-2
              ${idx === 0 ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
            `}
          >
            {a.icon}
            {a.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
