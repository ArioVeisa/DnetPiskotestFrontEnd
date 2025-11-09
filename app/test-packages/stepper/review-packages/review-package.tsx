"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  Clock,
  NotebookText,
  GripVertical,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { ICON_MAP } from "@/lib/icon-mapping";
import { usePublishPackage } from "./hooks/use-review-package";
import { reviewPackageService } from "./service/review-package-service";
import { Section } from "./service/review-package-service";

/* =============================================================================
 * Types
 * ============================================================================= */
type TestItem = {
  key: string; // untuk drag-drop
  sectionId: number;
  title: string;
  questions: number;
  duration: number;
  bgColor: string;
  borderColor: string;
  textColor: string;
};

type PublishTestPageProps = {
  testId: number;
  testName: string;
  testIcon: keyof typeof ICON_MAP;
  token?: string;
  onPublishSuccess: () => void;
  onBack: () => void;
  hideNavigation?: boolean;
  onPublishStateChange?: (loading: boolean, disabled: boolean) => void;
};

type UIItem = {
  key: string;
  sectionId: number;
  title: string;
  questions: number;
  duration: number;
  bgColor: string;
  borderColor: string;
  textColor: string;
};

/* =============================================================================
 * Mapping tipe → kartu (styling only)
 * ============================================================================= */
const TEST_ITEM_MAP: Record<
  string,
  Omit<TestItem, "questions" | "duration" | "sectionId">
> = {
  DISC: {
    key: "DISC",
    title: "DISC Assessment",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
  },
  CAAS: {
    key: "CAAS",
    title: "CAAS Evaluation",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700",
  },
  teliti: {
    key: "teliti",
    title: "Fast Accuracy",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
  },
};

/* =============================================================================
 * SortableCard
 * ============================================================================= */
function SortableCard({ test }: { test: TestItem }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: test.key });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex flex-col sm:flex-row pl-12 pr-5 py-4 gap-4 border-2 rounded-xl shadow-sm",
        test.borderColor,
        test.bgColor
      )}
    >
      <div
        className="absolute left-4 top-1/2 -translate-y-1/2"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="w-5 h-5 text-gray-500 cursor-grab" />
      </div>

      <div className="flex-1">
        <h1 className={cn("font-semibold", test.textColor)}>{test.title}</h1>
        <div className="flex items-center gap-2 mt-4 text-sm">
          <span className="inline-flex items-center gap-1 rounded-full border bg-white/70 px-2.5 py-1">
            <NotebookText className="w-4 h-4" />
            <span>{test.questions} Questions</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border bg-white/70 px-2.5 py-1">
            <Clock className="w-4 h-4" />
            <span>{test.duration} min</span>
          </span>
        </div>
      </div>
    </Card>
  );
}

/* =============================================================================
 * Page
 * ============================================================================= */
export default function PublishTestPage({
  testId,
  testName,
  testIcon,
  token,
  onPublishSuccess,
  onBack,
  hideNavigation = false,
  onPublishStateChange,
}: PublishTestPageProps) {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Hook publish → langsung gunakan tests
  // yang benar → kasih testId ke hook
  const { publish, loading, error } = usePublishPackage(testId, token);

  // Fetch package detail dari API
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true);
        setFetchError(null);

        const pkg = await reviewPackageService.getPackage(testId);
        const mapped: UIItem[] = (pkg.sections ?? []).map((s: Section) => {
          const base = TEST_ITEM_MAP[
            s.section_type as keyof typeof TEST_ITEM_MAP
          ] ?? {
            title: s.section_type || "Unknown",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
            textColor: "text-gray-700",
          };

          return {
            ...base,
            key: `${s.section_type ?? "section"}-${s.id}`,
            sectionId: s.id,
            questions: s.question_count ?? 0,
            duration: s.duration_minutes ?? 0,
          };
        });

        setTests(mapped);
      } catch (err) {
        console.error("❌ Gagal fetch package detail:", err);
        setFetchError("Gagal memuat data package");
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, [testId, token]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const i0 = tests.findIndex((t) => t.key === active.id);
      const i1 = tests.findIndex((t) => t.key === over.id);
      setTests((arr) => arrayMove(arr, i0, i1));
    }
  };

  const handlePublish = async () => {
    const success = await publish(
      tests.map((t) => ({
        id: t.sectionId,
        questions: t.questions,
        duration: t.duration,
      }))
    );
    if (success) {
      onPublishSuccess();
    }
  };

  const hasValidTests =
    tests.length > 0 &&
    tests.some((test) => test.questions > 0 && test.duration > 0);

  // Update parent state untuk fixed navigation
  useEffect(() => {
    if (onPublishStateChange) {
      const isDisabled = loading || !hasValidTests || tests.length === 0 || loadingData;
      onPublishStateChange(loading, isDisabled);
    }
  }, [loading, hasValidTests, tests.length, loadingData, onPublishStateChange]);

  return (
    <div className="w-full sm:px-2 md:px-4 lg:px-8 py-4 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full border-2 border-blue-200 bg-white text-blue-500 text-3xl">
            {ICON_MAP[testIcon]}
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <h2 className="text-lg sm:text-xl font-bold truncate">
              {testName}
            </h2>
          </div>
        </div>
      </div>

      {/* Error state */}
      {fetchError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {loadingData ? (
        <div className="text-center text-gray-500">Loading test package...</div>
      ) : (
        <>
          {/* Validation Warning */}
          {tests.length > 0 && !hasValidTests && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Beberapa test memiliki konfigurasi yang tidak valid (questions
                atau duration = 0). Pastikan semua test sudah benar.
              </AlertDescription>
            </Alert>
          )}

          {/* TEST CONFIGURATION */}
          <h3 className="font-semibold text-lg">Test Configuration</h3>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tests.map((t) => t.key)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {tests.length > 0 ? (
                  tests.map((t) => <SortableCard key={t.key} test={t} />)
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Tidak ada section ditemukan.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}

      {/* NAVIGATION - Hidden jika hideNavigation = true */}
      {!hideNavigation && (
        <div className="flex justify-end gap-3 pt-8">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={loading || loadingData}
            className="min-w-[90px] px-6 py-2"
          >
            Back
          </Button>
          <Button
            onClick={handlePublish}
            disabled={loading || !hasValidTests || tests.length === 0}
            className="min-w-[90px] px-6 py-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Publishing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Save Package
              </>
            )}
          </Button>
        </div>
      )}
      {/* Hidden navigation button untuk fixed navigation di parent */}
      {hideNavigation && (
        <div style={{ display: 'none' }}>
          <Button
            data-publish-package
            onClick={handlePublish}
            disabled={loading || !hasValidTests || tests.length === 0 || loadingData}
          >
            Save Package
          </Button>
        </div>
      )}
    </div>
  );
}
