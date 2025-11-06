import React from "react";

interface TitleBarProps {
  title: string;
  subtitle: string;
}

export function TitleBar({ title, subtitle }: TitleBarProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}