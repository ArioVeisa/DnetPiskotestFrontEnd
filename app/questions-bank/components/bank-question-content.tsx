"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BankSkeleton from "./card-skeleton";
import { useBankQuestion } from "../hooks/use-bank-question";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale"; // kalau mau bahasa Indonesia

import { Clock } from "lucide-react";

import { touchBank } from "../services/bank-question-service";
import type { QuestionBank } from "../services/bank-question-service";

type Props = {
  /** buka stepper Add Questions dengan data bank terpilih */
  onStartAddQuestions?: (bank: QuestionBank) => void;
};

export default function BankQuestionContent({ onStartAddQuestions }: Props) {
  const { banks, loading } = useBankQuestion();

  const handleStart = (bank: QuestionBank) => {
    touchBank(bank.id);

    onStartAddQuestions?.(bank);
  };

  return (
    <div>
      {/* Loading Skeleton */}
      {loading && <BankSkeleton />}

      {/* Empty state */}
      {!loading && banks.length === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Belum ada question bank. Klik{" "}
          <span className="font-medium">+ Add New Test</span> untuk membuat.
        </div>
      )}

      {/* List bank */}
      {!loading && banks.length > 0 && (
        <div className="space-y-3">
          {banks.map((b) => {
            const initial = b.name?.charAt(0).toUpperCase() ?? "?";

            return (
              <div
                key={b.id}
                className="group flex items-center justify-between rounded-xl p-4 ring-1 ring-black/5 transition hover:shadow-sm"
              >
                {/* Left Section */}
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-xl border bg-gray-50 text-lg font-bold text-gray-700">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{b.name}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge className="border-transparent bg-blue-50 text-blue-500 hover:bg-blue-100">
                        <Clock className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                        <span className="font-medium tabular-nums">
                          {b.updatedAt
                            ? formatDistanceToNow(new Date(b.updatedAt), {
                                addSuffix: true,
                                locale: id,
                              })
                            : "No update"}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                  {/* Mobile */}
                  <div className="flex gap-2 md:hidden">
                    <Button
                      size="icon"
                      aria-label={`Add questions for ${b.name}`}
                      title="Add"
                      onClick={() => handleStart(b)}
                    >
                      +
                    </Button>
                  </div>
                  {/* Desktop */}
                  <div className="hidden items-center gap-2 md:flex">
                    <Button size="sm" onClick={() => handleStart(b)}>
                      Add Question
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
