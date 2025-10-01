"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TEST_TYPES, useCreateNewTestForm } from "./hooks/use-create-package";
import { cn } from "@/lib/utils";
import { Check, ClipboardList, Users2 } from "lucide-react";
import { ICON_MAP, IconKey } from "@/lib/icon-mapping";

// Warna sesuai tipe tes
const TYPE_COLOR_MAP: Record<string, string> = {
  DISC: "border-blue-400 ring-2 ring-blue-100 bg-blue-50 text-blue-700",
  CAAS: "border-yellow-400 ring-2 ring-yellow-100 bg-yellow-50 text-yellow-700",
  "teliti":
    "border-green-400 ring-2 ring-green-100 bg-green-50 text-green-700",
};

// Opsi posisi target
const POSITION_OPTIONS = ["Managerial", "Staff", "Add New Position"];

type Props = {
  onNext: (data: {
    testName: string;
    icon: IconKey;
    targetPosition: string;
    selectedTypes: string[];
  }) => void;
};

export default function CreateNewTest({ onNext }: Props) {
  const form = useCreateNewTestForm();
  const [customPosition, setCustomPosition] = useState("");
  const [isCustomPosition, setIsCustomPosition] = useState(false);

  const { success, testName, icon, setSuccess, selectedTypes } = form;

  // Efek ketika sukses -> auto ke step berikutnya
  useEffect(() => {
    const currentTargetPosition = isCustomPosition
      ? customPosition
      : form.targetPosition;
    if (success) {
      const t = setTimeout(() => {
        setSuccess(false);
        onNext({
          testName,
          icon,
          targetPosition: currentTargetPosition,
          selectedTypes: selectedTypes.map((t) => t.type), // kirim hanya type
        });
      }, 400);
      return () => clearTimeout(t);
    }
  }, [
    success,
    testName,
    icon,
    isCustomPosition,
    customPosition,
    onNext,
    setSuccess,
    selectedTypes,
    form.targetPosition,
  ]);

  // Handle perubahan posisi
  function handlePositionChange(val: string) {
    if (val === "Add New Position") {
      setIsCustomPosition(true);
      setCustomPosition("");
      form.setSelectedTypes([]); // Reset pilihan tes
      return;
    }
    setIsCustomPosition(false);
    form.setTargetPosition(val);

    // Auto pilih default minimal 1 test type
    if (val === "Managerial") {
      form.setSelectedTypes([{ type: "DISC", sequence: 1 }]);
    }
    if (val === "Staff") {
      form.setSelectedTypes([{ type: "CAAS", sequence: 1 }]);
    }
  }

  const finalTargetPosition = isCustomPosition
    ? customPosition
    : form.targetPosition;

  return (
    <div className="w-full sm:px-2 md:px-4 lg:px-8 py-4">
      {/* Judul halaman */}
      <h2 className="font-bold text-2xl mb-1">Create New Package</h2>
      <p className="text-gray-500 text-sm mb-6">
        Set up the test type, number of questions, and time limit
      </p>

      {/* Pilih Icon Test */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white border-2 border-blue-200 shadow">
          {ICON_MAP[form.icon]}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Test Icon</label>
          <div className="flex gap-1 flex-wrap">
            {(Object.keys(ICON_MAP) as Array<keyof typeof ICON_MAP>).map((k) => (
              <Button
                key={k}
                type="button"
                variant={form.icon === k ? "secondary" : "outline"}
                size="icon"
                className={cn(
                  "rounded-full border w-10 h-10",
                  form.icon === k ? "border-blue-400" : ""
                )}
                onClick={() => form.setIcon(k)}
              >
                {ICON_MAP[k]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Nama Tes */}
      <div className="mb-4">
        <label className="block text-sm mb-1 font-medium">Package Name</label>
        <div className="relative">
          <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9 pr-3 py-2"
            placeholder="e.g. Leadership Assessment"
            value={form.testName}
            onChange={(e) => form.setTestName(e.target.value)}
          />
        </div>
      </div>

      {/* Posisi Target */}
      <div className="mb-4">
        <label className="block text-sm mb-1 font-medium">Target Position</label>
        {isCustomPosition ? (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Users2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9 pr-3 py-2"
                placeholder="Type new position..."
                value={customPosition}
                onChange={(e) => setCustomPosition(e.target.value)}
              />
            </div>
            <Select value="Add New Position" onValueChange={handlePositionChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POSITION_OPTIONS.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="relative">
            <Users2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Select value={form.targetPosition} onValueChange={handlePositionChange}>
              <SelectTrigger className="w-full pl-9">
                <SelectValue placeholder="Select target position" />
              </SelectTrigger>
              <SelectContent>
                {POSITION_OPTIONS.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Pilih Tipe Tes */}
      <div className="mb-4">
        <label className="block text-sm mb-2 font-medium">Test Type</label>
        <div className="flex flex-wrap gap-3">
          {TEST_TYPES.map((t) => {
            const selected = form.selectedTypes.some(
              (st) => st.type === t.value
            );
            return (
              <button
                key={t.value}
                type="button"
                className={cn(
                  "relative flex items-center justify-center px-8 py-3 min-w-[110px] rounded-xl border transition-all bg-white shadow-sm focus:outline-none font-bold text-base",
                  selected
                    ? TYPE_COLOR_MAP[t.label]
                    : "border-gray-200 bg-white text-gray-700"
                )}
                onClick={() => form.handleTypeToggle(t.value)}
              >
                {t.label}
                {selected && (
                  <span className="absolute top-2 right-2">
                    <Check
                      className={
                        t.label === "DISC"
                          ? "w-4 h-4 text-blue-500"
                          : t.label === "CAAS"
                          ? "w-4 h-4 text-yellow-500"
                          : "w-4 h-4 text-green-500"
                      }
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4 text-xs text-gray-400">
        <span>
          <span className="font-bold">Note:</span> Choosing a{" "}
          <b>Target Position</b> will automatically select the recommended test
          type for that position. You can still add or remove test types
          manually.
        </span>
      </div>

      <div className="flex justify-end gap-2 mt-7">
        <Button
          type="button"
          onClick={() =>
            form.handleSubmit({ overrideTargetPosition: finalTargetPosition })
          }
          disabled={form.loading || !form.testName || !finalTargetPosition}
        >
          {form.loading ? "Saving..." : "Next"}
        </Button>
      </div>

      {form.error && <div className="text-red-500 mt-3">{form.error}</div>}
      {form.success && (
        <div className="text-green-600 mt-3">Test created!</div>
      )}
    </div>
  );
}
