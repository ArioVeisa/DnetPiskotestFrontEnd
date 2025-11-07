"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TEST_TYPES, useCreateNewTestForm } from "./hooks/use-create-package";
import { cn } from "@/lib/utils";
import { Check, ClipboardList, ArrowLeft } from "lucide-react";
import { ICON_MAP, IconKey } from "@/lib/icon-mapping";
import { QuestionType } from "../manage-question/service/manage-question-service";

/* ============================
   Warna sesuai tipe tes
============================ */
const TYPE_COLOR_MAP: Record<string, string> = {
  DISC: "border-blue-400 ring-2 ring-blue-100 bg-blue-50 text-blue-700",
  CAAS: "border-yellow-400 ring-2 ring-yellow-100 bg-yellow-50 text-yellow-700",
  teliti: "border-green-400 ring-2 ring-green-100 bg-green-50 text-green-700",
};

/* ============================
   Props
============================ */
type Props = {
  isEditMode?: boolean;
  defaultValues?: {
    icon: IconKey;
    testName: string;
    selectedTypes: QuestionType[];
  };
  onNext: (data: {
    icon: IconKey;
    testName: string;
    selectedTypes: string[];
  }) => void;
  onBack?: () => void;
  onCancelEdit?: () => void;
};

/* ============================
   Component
============================ */
export default function CreateNewTest({
  isEditMode = false,
  defaultValues,
  onNext,
  onBack,
  onCancelEdit,
}: Props) {
  const {
    icon,
    testName,
    selectedTypes,
    error,
    success,
    setIcon,
    setTestName,
    setSelectedTypes,
    handleTypeToggle,
  } = useCreateNewTestForm();

  /* Prefill form jika edit mode */
  useEffect(() => {
    if (isEditMode && defaultValues) {
      setIcon(defaultValues.icon);
      setTestName(defaultValues.testName);
      setSelectedTypes(
        defaultValues.selectedTypes.map((t, i) => ({
          type: t,
          sequence: i + 1,
        }))
      );
    }
  }, [isEditMode, defaultValues, setIcon, setTestName, setSelectedTypes]);

  /* Hanya kirim data ke parent (tanpa API call) */
  const handleNext = () => {
    if (!testName || selectedTypes.length === 0) return;

    onNext({
      icon,
      testName,
      selectedTypes: selectedTypes.map((t) => t.type),
    });
  };

  return (
    <div className="w-full sm:px-2 md:px-4 lg:px-8 py-4">
      {/* Judul halaman */}
      <h2 className="font-bold text-2xl mb-1">
        {isEditMode ? "Edit Test Package" : "Create New Package"}
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        {isEditMode
          ? "Update the test information as needed"
          : "Set up the test type, number of questions, and time limit"}
      </p>

      {/* Pilih Icon Test */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white border-2 border-blue-200 shadow">
          {ICON_MAP[icon]}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Test Icon</label>
          <div className="flex gap-1 flex-wrap">
            {(Object.keys(ICON_MAP) as Array<keyof typeof ICON_MAP>).map(
              (k) => (
                <Button
                  key={k}
                  type="button"
                  variant={icon === k ? "secondary" : "outline"}
                  size="icon"
                  className={cn(
                    "rounded-full border w-10 h-10",
                    icon === k ? "border-blue-400" : ""
                  )}
                  onClick={() => setIcon(k)}
                >
                  {ICON_MAP[k]}
                </Button>
              )
            )}
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
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
          />
        </div>
      </div>

      {/* Pilih Tipe Tes */}
      <div className="mb-4">
        <label className="block text-sm mb-2 font-medium">Test Type</label>
        <div className="flex flex-wrap gap-3">
          {TEST_TYPES.map((t) => {
            const selected = selectedTypes.some((st) => st.type === t.value);
            return (
              <button
                key={t.value}
                type="button"
                className={cn(
                  "relative flex items-center justify-center px-8 py-3 min-w-[110px] rounded-xl border transition-all bg-white shadow-sm focus:outline-none font-bold text-base",
                  selected
                    ? TYPE_COLOR_MAP[t.value]
                    : "border-gray-200 bg-white text-gray-700"
                )}
                onClick={() => handleTypeToggle(t.value)}
              >
                {t.label}
                {selected && (
                  <span className="absolute top-2 right-2">
                    <Check
                      className={
                        t.value === "DISC"
                          ? "w-4 h-4 text-blue-500"
                          : t.value === "CAAS"
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

      {/* Tombol Aksi */}
      <div className="flex justify-end gap-2 mt-7">
        <div className="flex gap-2">
          {onBack && (
            <Button
              variant="outline"
              type="button"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          <Button type="button" onClick={handleNext} disabled={!testName}>
            {isEditMode ? "Next (Update)" : "Next"}
          </Button>
        </div>
      </div>

      {error && <div className="text-red-500 mt-3">{error}</div>}
      {success && !isEditMode && (
        <div className="text-green-600 mt-3">Test created!</div>
      )}
    </div>
  );
}
