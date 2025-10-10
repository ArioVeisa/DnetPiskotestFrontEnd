"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ICON_MAP } from "@/lib/icon-mapping";
import {
  Search,
  BookPlus,
  Edit,
  Clock,
  ListOrdered,
  BriefcaseBusiness,
  Trash,
} from "lucide-react";

/* ===========================
   DIALOGS
   =========================== */
import AddQuestionDialog from "./dialogs/add-question-dialog";

/* ===========================
   SERVICES & TYPES
   =========================== */
import { QuestionType } from "./service/manage-question-service";

/* ===========================
   HOOKS
   =========================== */
import { useManageQuestions } from "./hooks/use-manage-question";

/* ============================================================================
   COMPONENT PROPS
   ============================================================================ */
type ManageQuestionsProps = {
  testName: string;
  testIcon: keyof typeof ICON_MAP;
  targetPosition: string;
  allowedTypes?: QuestionType[];
  onNext: () => void;
  onBack: () => void;
  testId: number;
  sectionIds: Record<QuestionType, number>;
  token: string; // Required berdasarkan service
};

/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */
export default function ManageQuestions({
  testName,
  testIcon,
  targetPosition,
  allowedTypes = ["DISC", "CAAS", "teliti"],
  onNext,
  onBack,
  testId,
  sectionIds,
  token,
}: ManageQuestionsProps) {
  const [activeType, setActiveType] = useState<QuestionType>(allowedTypes[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  /* ========================================================================
     DATA & ACTIONS - MURNI DARI HOOK/BACKEND
     ======================================================================== */
  const {
    questions,
    search,
    setSearch,
    loading,
    error,
    handleDelete,
    duration,
    setDuration,
    questionCount,
    handleAdd,
    syncAllSections, // 👈 tambahin
  } = useManageQuestions(
    activeType,
    testId,
    sectionIds[activeType],
    token,
    sectionIds
  );

  /* ========================================================================
     SAFETY CHECK
     ======================================================================== */
  // Tambahkan di atas return (setelah semua useState lain)
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // cek apakah user sudah scroll > 100px
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!allowedTypes.includes(activeType)) {
      setActiveType(allowedTypes[0]);
    }
  }, [allowedTypes, activeType]);

  const hasEmptyConfig = Object.values(sectionIds).some((sid) => !sid);
  if (hasEmptyConfig) {
    alert("⚠️ Ada section lain yang belum dikonfigurasi.");
  }

  const existingIds = questions.map((q) => Number(q.id));

  /* ========================================================================
     TABS
     ======================================================================== */
  const TABS = useMemo(
    () =>
      allowedTypes.map((t) => ({
        key: t,
        label: t,
      })),
    [allowedTypes]
  );

  /* ========================================================================
     ERROR HANDLING
     ======================================================================== */
  if (error) {
    return (
      <div className="w-full px-4 py-4">
        <div className="text-red-600 text-center">
          Error: {error}
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="ml-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  /* ========================================================================
     RENDER
     ======================================================================== */
  return (
    <div className="w-full sm:px-2 md:px-4 lg:px-8 py-4">
      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-5 sm:mb-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center rounded-full border-blue-200 border-2 bg-white text-blue-500 text-2xl sm:text-3xl shadow shrink-0">
            {ICON_MAP[testIcon]}
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <h2 className="text-base sm:text-xl font-bold truncate">
              {testName}
            </h2>
            <div className="flex items-center gap-3 mt-1 text-gray-500 text-xs sm:text-sm flex-wrap">
              <span className="flex items-center gap-2 truncate">
                <BriefcaseBusiness className="w-4 h-4" />
                {targetPosition}
              </span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-between">
          <h2 className="hidden sm:block text-base sm:text-lg font-semibold">
            Test Question
          </h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none"
            >
              <BookPlus className="w-4 h-4 mr-1.5 sm:mr-2" />
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add Question</span>
            </Button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="mb-5">
        <div className="rounded-xl bg-muted/60 p-1.5 sm:p-2">
          <div
            className="grid gap-1 sm:gap-2"
            style={{ gridTemplateColumns: `repeat(${TABS.length}, 1fr)` }}
          >
            {TABS.map((tab) => {
              const active = activeType === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveType(tab.key)}
                  className={cn(
                    "group w-full rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-center transition",
                    active
                      ? "bg-white shadow text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="text-xs sm:text-sm font-semibold">
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TEST CONFIG (per type) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1">
            Test Duration
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="E.g. 30"
              className="pl-9 text-sm"
              value={duration}
              onChange={(e) => setDuration(e.target.value.replace(/\D/, ""))}
              inputMode="numeric"
            />
          </div>
        </div>
        <div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">
              Question Count
            </label>
            <div className="relative">
              <ListOrdered className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                value={questionCount}
                readOnly
                className="pl-9 text-sm disabled"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search questions..."
          className="pl-9 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LIST HEADER */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm sm:text-base">Question List</h3>
        <Button
          size="icon"
          variant={editMode ? "secondary" : "ghost"}
          onClick={() => setEditMode((v) => !v)}
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>

      {/* QUESTION LIST */}
      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : questions.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Belum ada pertanyaan
        </p>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-xl border bg-white px-3 sm:px-4 py-3"
            >
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground mb-1">
                <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[10px]">
                  {idx + 1}
                </div>
                <span>Question:</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm sm:text-base font-medium">
                  {q.question_text || "Soal tidak ada"}
                </p>
                {editMode && (
                  <div className="shrink-0 flex gap-1">
                    <Button
                      size="icon"
                      variant="destructive"
                      className="w-8 h-8"
                      onClick={() => handleDelete(q.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER */}
      <div
        className={cn(
          "bg-white border-t py-3 px-8 flex justify-end gap-3 transition-all duration-300",
          isScrolled
            ? "fixed bottom-0 left-[260px] right-0 shadow-md z-40"
            : "relative mt-8"
        )}
      >
        <Button variant="outline" type="button" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={async () => {
            const hasEmpty = Object.values(sectionIds).some((sid) => !sid);
            if (hasEmpty) return;
            const ok = await syncAllSections();
            if (ok) onNext();
          }}
        >
          Next
        </Button>
      </div>

      {/* DIALOGS - REVISED SESUAI SERVICE */}
      <AddQuestionDialog
        open={showAddModal}
        onOpenChange={setShowAddModal}
        activeType={activeType}
        token={token}
        onSave={(id) => handleAdd(id, activeType)} // 👈 fix disini
        existingIds={existingIds}
      />
    </div>
  );
}
