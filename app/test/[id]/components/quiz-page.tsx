"use client";
import React, { useState, useEffect } from "react";
import { Question } from "./question-card";
import { useQuizTimer } from "../hooks/use-quiz-timer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Flag, AlertTriangle } from "lucide-react";

/* ---------------- Progress Ring ---------------- */
function ProgressRing({ value, max }: { value: number; max: number }) {
  const radius = 30;
  const stroke = 5;
  const normalized = radius - stroke / 2;
  const circumference = normalized * 2 * Math.PI;
  const pct = Math.max(0, Math.min(1, value / max || 1));
  const dashoffset = circumference * (1 - pct);

  return (
    <svg width={radius * 2} height={radius * 2}>
      <circle
        stroke="#eef2fd"
        fill="transparent"
        strokeWidth={stroke}
        r={normalized}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#2563eb"
        fill="transparent"
        strokeWidth={stroke}
        r={normalized}
        cx={radius}
        cy={radius}
        style={{
          strokeDasharray: circumference,
          strokeDashoffset: dashoffset,
          transition: "stroke-dashoffset 0.4s",
          strokeLinecap: "round",
        }}
      />
    </svg>
  );
}

/* ---------------- Types ---------------- */
export interface Test {
  id: string;
  name: string;
  questionCount: number;
  duration: number;
  index: number;
  total: number;
}

interface QuizPageProps {
  questions: Question[];
  test: Test;
  timer: number; // detik
  onFinish: () => void;
  onExpire: () => void;
}

/* ---------------- Main Component ---------------- */
export function QuizPage({
  questions,
  timer,
  onFinish,
  onExpire,
}: QuizPageProps) {
  const { timeLeft, start, reset } = useQuizTimer(timer, onExpire);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flags, setFlags] = useState<Record<number, boolean>>({});
  const [showReminder, setShowReminder] = useState(false);
  const [current, setCurrent] = useState(0);

  /* Timer lifecycle */
  useEffect(() => {
    start();
    return () => reset();
    // eslint-disable-next-line
  }, [timer]);

  /* Guard: kalau gak ada soal */
  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-gray-500">No questions available for this test.</p>
      </div>
    );
  }

  /* Helper */
  const handleAnswer = (idx: number, val: string) =>
    setAnswers((a) => ({ ...a, [idx]: val }));

  const toggleFlag = (idx: number) =>
    setFlags((f) => ({ ...f, [idx]: !f[idx] }));

  const handleFinishClick = () => {
    const hasUnanswered = questions.some((_, i) => !answers[i]);
    if (hasUnanswered) {
      setShowReminder(true);
    } else {
      onFinish();
    }
  };

  /* Pastikan current selalu valid */
  const safeIndex = Math.min(Math.max(current, 0), questions.length - 1);
  const currentQuestion = questions[safeIndex];

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start justify-stretch p-4">
      {/* Main Card */}
      <div className="flex-1">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="mb-1 text-xs text-gray-400">
            Question {safeIndex + 1}/{questions.length}
          </div>
          <div className="font-semibold text-[1.1rem] mb-4 leading-relaxed">
            {currentQuestion.text}
          </div>
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAnswer(safeIndex, opt)}
                className={[
                  "w-full flex items-center px-4 py-3 rounded-lg border text-left transition",
                  answers[safeIndex] === opt
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                    : "border-gray-200 hover:bg-gray-50",
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-flex items-center justify-center w-5 h-5 mr-3 border rounded-full transition",
                    answers[safeIndex] === opt
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300",
                  ].join(" ")}
                >
                  {answers[safeIndex] === opt && (
                    <span className="w-3 h-3 rounded-full bg-white block" />
                  )}
                </span>
                {opt}
              </button>
            ))}
          </div>
          {/* Bottom nav */}
          <div className="flex flex-wrap gap-2 mt-6">
            <Button
              variant={flags[safeIndex] ? undefined : "outline"}
              size="sm"
              onClick={() => toggleFlag(safeIndex)}
              className={[
                "flex items-center gap-2",
                flags[safeIndex]
                  ? "bg-yellow-400 hover:bg-yellow-500 text-white border-yellow-400"
                  : "",
              ].join(" ")}
            >
              <Flag
                className={`w-4 h-4 ${
                  flags[safeIndex] ? "text-white" : "text-yellow-500"
                }`}
              />
              <span className={flags[safeIndex] ? "text-white" : ""}>
                Mark for Review
              </span>
            </Button>
            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                disabled={safeIndex === 0}
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  setCurrent((c) => Math.min(questions.length - 1, c + 1))
                }
                disabled={safeIndex === questions.length - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-full md:w-[280px] flex-shrink-0 flex flex-col gap-4">
        {/* Time Remaining */}
        <div className="bg-[#f6f8fd] border border-[#e5e9f6] rounded-2xl px-5 py-4 flex flex-col items-center">
          <div className="font-semibold text-sm mb-1 text-gray-700">
            Time Remaining
          </div>
          <div className="mb-1">
            <ProgressRing value={timeLeft} max={timer} />
          </div>
          <div className="text-xs text-gray-400 mb-1">Time</div>
          <div
            className="font-bold text-2xl text-[#222] tracking-wide font-mono"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
            {String(timeLeft % 60).padStart(2, "0")}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white p-4 rounded-xl shadow-sm mt-2">
          <div className="font-semibold text-sm mb-2">Question Navigation</div>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, i) => {
              let style =
                "w-8 h-8 rounded flex items-center justify-center border cursor-pointer transition";
              if (i === safeIndex)
                style += " bg-blue-500 text-white font-bold border-blue-500";
              else if (answers[i])
                style += " bg-green-500 text-white border-green-500";
              else if (flags[i])
                style += " bg-yellow-400 text-white border-yellow-400";
              else style += " bg-gray-100 text-gray-500 border-gray-200";

              return (
                <button key={i} className={style} onClick={() => setCurrent(i)}>
                  {i + 1}
                </button>
              );
            })}
          </div>
          {/* Legend */}
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Current
              Question
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400" /> Marked for
              Review
            </div>
          </div>
        </div>
        <Button
          onClick={handleFinishClick}
          className="mt-4 w-full"
          variant="default"
        >
          Finish Test
        </Button>
      </aside>

      {/* Reminder Modal */}
      {showReminder && (
        <Dialog open onOpenChange={() => setShowReminder(false)}>
          <DialogContent className="max-w-md flex flex-col items-center justify-center py-8">
            <DialogTitle className="sr-only">Warning</DialogTitle>
            <div className="flex flex-col items-center w-full">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
              <span className="font-bold text-lg text-red-600 mb-2 tracking-wide">
                WARNING
              </span>
              <p className="text-gray-600 text-center mb-6">
                Masih ada soal yang belum dijawab.
              </p>
              <div className="flex gap-4 w-full justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowReminder(false)}
                  className="min-w-[100px]"
                >
                  Batal
                </Button>
                <Button
                  onClick={() => {
                    setShowReminder(false);
                    onFinish();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white min-w-[140px]"
                >
                  Tetap Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
