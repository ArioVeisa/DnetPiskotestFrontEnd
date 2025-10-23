"use client";
import React, { useState, useEffect } from "react";
import { Question, DiscAnswer } from "./question-card";
import { DiscQuestionCard } from "./disc-question-card";
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
  onFinish: (answers?: Record<number, any>) => void;
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
  const [answers, setAnswers] = useState<Record<number, string | DiscAnswer>>({});
  const [flags, setFlags] = useState<Record<number, boolean>>({});
  const [showReminder, setShowReminder] = useState(false);
  const [current, setCurrent] = useState(0);

  // Local cache key untuk menyimpan jawaban
  const cacheKey = `quiz_answers_${questions[0]?.id || 'unknown'}`;

  /* Load answers from local storage on mount */
  useEffect(() => {
    try {
      const savedAnswers = localStorage.getItem(cacheKey);
      if (savedAnswers) {
        const parsedAnswers = JSON.parse(savedAnswers);
        setAnswers(parsedAnswers);
        // console.log("✅ Loaded answers from cache:", parsedAnswers); // Debug logging removed
      }
    } catch (error) {
      // console.error("❌ Error loading answers from cache:", error); // Debug logging removed
    }
  }, [cacheKey]);

  /* Save answers to local storage whenever answers change */
  useEffect(() => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(answers));
      // console.log("💾 Saved answers to cache:", answers); // Debug logging removed
    } catch (error) {
      // console.error("❌ Error saving answers to cache:", error); // Debug logging removed
    }
  }, [answers, cacheKey]);

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
  const handleAnswer = (idx: number, val: string | DiscAnswer) => {
    const question = questions[idx];
    // console.log("🔍 handleAnswer called:", { idx, val, question }); // Debug logging removed
    const answerKey = question?.id; // Use question.id as key instead of array index
    // console.log("🔍 Answer key:", answerKey); // Debug logging removed
    if (answerKey) {
      setAnswers((a) => ({ ...a, [answerKey]: val }));
      // console.log("🔍 Answer saved with key:", answerKey, "value:", val); // Debug logging removed
    } else {
      // console.log("❌ No answer key found for question:", question); // Debug logging removed
    }
  };

  const toggleFlag = (idx: number) => {
    const question = questions[idx];
    const flagKey = question?.id;
    if (flagKey) {
      setFlags((f) => ({ ...f, [flagKey]: !f[flagKey] }));
    }
  };

  const handleFinishClick = () => {
    const hasUnanswered = questions.some((question, i) => {
      const answerKey = question.id;
      const answer = answers[answerKey];
      if (question.questionType === 'DISC') {
        // Untuk DISC, pastikan most dan least sudah dipilih
        return !answer || typeof answer === 'string' || !answer.most || !answer.least;
      } else {
        // Untuk tipe lain, pastikan ada jawaban
        return !answer;
      }
    });
    
    if (hasUnanswered) {
      setShowReminder(true);
    } else {
      // Clear cache setelah test selesai
      try {
        localStorage.removeItem(cacheKey);
        // console.log("🗑️ Cleared answers cache after test completion"); // Debug logging removed
      } catch (error) {
        // console.error("❌ Error clearing cache:", error); // Debug logging removed
      }
      onFinish(answers);
    }
  };

  /* Pastikan current selalu valid */
  const safeIndex = Math.min(Math.max(current, 0), questions.length - 1);
  const currentQuestion = questions[safeIndex];
  
  // Debug logging
  // console.log("🔍 Current question:", currentQuestion); // Debug logging removed
  // console.log("🔍 Question type:", currentQuestion?.questionType); // Debug logging removed
  // console.log("🔍 Disc options:", currentQuestion?.discOptions); // Debug logging removed

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start justify-stretch p-4">
      {/* Main Card */}
      <div className="flex-1">
        {(currentQuestion.questionType === 'DISC' && currentQuestion.discOptions) || 
         (currentQuestion.options && currentQuestion.options.length === 4 && 
          currentQuestion.text && currentQuestion.text.toLowerCase().includes('most') && 
          currentQuestion.text.toLowerCase().includes('least')) ? (
          <DiscQuestionCard
            question={{
              text: currentQuestion.text,
              discOptions: currentQuestion.discOptions || 
                currentQuestion.options.map((opt, index) => ({
                  id: index.toString(),
                  text: opt,
                  dimensionMost: '*',
                  dimensionLeast: '*'
                }))
            }}
            answer={(() => {
              const answerKey = currentQuestion.id;
              const answer = answers[answerKey];
              return typeof answer === 'object' ? answer as DiscAnswer : null;
            })()}
            onAnswer={(answer) => handleAnswer(safeIndex, answer)}
            onToggleFlag={() => toggleFlag(safeIndex)}
            isFlagged={(() => {
              const flagKey = currentQuestion.id;
              return flags[flagKey] || false;
            })()}
            questionNumber={safeIndex + 1}
            totalQuestions={questions.length}
            onPrevious={() => {}} // Disabled - no previous button
            onNext={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
            canGoPrevious={false} // Always false - no previous allowed
            canGoNext={safeIndex < questions.length - 1}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="mb-1 text-xs text-gray-400">
              Question {safeIndex + 1}/{questions.length}
            </div>
            <div className="font-semibold text-[1.1rem] mb-4 leading-relaxed">
              {currentQuestion.text}
            </div>
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((opt, i) => {
                const answerKey = currentQuestion.id;
                const currentAnswer = answers[answerKey];
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAnswer(safeIndex, opt)}
                    disabled={!!currentAnswer} // Disable once answer is selected
                    className={[
                      "w-full flex items-center px-4 py-3 rounded-lg border text-left transition",
                      currentAnswer === opt
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                        : "border-gray-200 hover:bg-gray-50",
                      currentAnswer ? "opacity-75 cursor-not-allowed" : "",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "inline-flex items-center justify-center w-5 h-5 mr-3 border rounded-full transition",
                        currentAnswer === opt
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300",
                      ].join(" ")}
                    >
                      {currentAnswer === opt && (
                        <span className="w-3 h-3 rounded-full bg-white block" />
                      )}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom nav - hanya untuk non-DISC questions */}
        {currentQuestion.questionType !== 'DISC' && (
          <div className="flex flex-wrap gap-2 mt-6">
            <Button
              variant={flags[currentQuestion.id] ? undefined : "outline"}
              size="sm"
              onClick={() => toggleFlag(safeIndex)}
              className={[
                "flex items-center gap-2",
                flags[currentQuestion.id]
                  ? "bg-yellow-400 hover:bg-yellow-500 text-white border-yellow-400"
                  : "",
              ].join(" ")}
            >
              <Flag
                className={`w-4 h-4 ${
                  flags[currentQuestion.id] ? "text-white" : "text-yellow-500"
                }`}
              />
              <span className={flags[currentQuestion.id] ? "text-white" : ""}>
                Mark for Review
              </span>
            </Button>
            <div className="ml-auto">
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
        )}
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
            {questions.map((question, i) => {
              let style =
                "w-8 h-8 rounded flex items-center justify-center border cursor-pointer transition";
              if (i === safeIndex)
                style += " bg-blue-500 text-white font-bold border-blue-500";
              else if (answers[question.id]) {
                // Check if answer is complete based on question type
                const answer = answers[question.id];
                const isComplete = question.questionType === 'DISC' 
                  ? typeof answer === 'object' && answer !== null && 
                    (answer as DiscAnswer).most && (answer as DiscAnswer).least
                  : true; // For non-DISC, any answer is complete
                
                if (isComplete) {
                  style += " bg-green-500 text-white border-green-500";
                } else {
                  style += " bg-orange-400 text-white border-orange-400";
                }
              } else if (flags[question.id])
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
