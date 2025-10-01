// components/TitleBar.tsx
import React from "react";

export function TitleBar() {
  return (
    <div className="md:items-center md:justify-between mb-6 mt-8">
      <h1 className="text-2xl font-bold">Manage Candidates</h1>
      <p className="text-muted-foreground text-sm">
        View and manage the candidate records and their current test status
      </p>
    </div>
  );
}
