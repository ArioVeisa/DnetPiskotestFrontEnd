"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DiscOption, DiscAnswer } from "./question-card";

interface DiscQuestionCardProps {
  question: {
    text: string;
    discOptions: DiscOption[];
  };
  answer: DiscAnswer | null;
  onAnswer: (answer: DiscAnswer) => void;
  onToggleFlag: () => void;
  isFlagged: boolean;
  questionNumber: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export function DiscQuestionCard({
  question,
  answer,
  onAnswer,
  onToggleFlag,
  isFlagged,
  questionNumber,
  totalQuestions,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: DiscQuestionCardProps) {
  const handleMostSelect = (optionId: string) => {
    // Prevent changes if answer is already selected
    if (answer?.most && answer?.least) {
      return;
    }
    const newAnswer: DiscAnswer = {
      most: optionId,
      least: answer?.least || ""
    };
    onAnswer(newAnswer);
  };

  const handleLeastSelect = (optionId: string) => {
    // Prevent changes if answer is already selected
    if (answer?.most && answer?.least) {
      return;
    }
    // Validasi: most dan least tidak boleh sama
    if (answer?.most === optionId) {
      return;
    }
    
    const newAnswer: DiscAnswer = {
      most: answer?.most || "",
      least: optionId
    };
    onAnswer(newAnswer);
  };

  const isMostSelected = (optionId: string) => answer?.most === optionId;
  const isLeastSelected = (optionId: string) => answer?.least === optionId;

  return (
    <Card className="flex-1">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            Question {questionNumber}/{totalQuestions}
          </p>
          <Button
            size="sm"
            variant={isFlagged ? "secondary" : "outline"}
            onClick={onToggleFlag}
          >
            {isFlagged ? "Unmark" : "Mark for Review"}
          </Button>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-lg mb-2">{question.text}</h3>
          <p className="text-sm text-gray-600 mb-4">
            Choose one statement that MOST reflects you and one that LEAST reflects you:
          </p>
        </div>

        {/* Table untuk pilihan MOST/LEAST */}
        <div className="overflow-hidden border border-gray-200 rounded-lg mb-6">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Statement
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 w-20">
                  MOST ✓
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 w-20">
                  LEAST ✗
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {question.discOptions.map((option, index) => (
                <tr key={option.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {option.text}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleMostSelect(option.id)}
                      disabled={answer?.most && answer?.least} // Disable once both are selected
                      className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                        ${isMostSelected(option.id)
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "border-gray-300 hover:border-blue-400"
                        }
                        ${answer?.most && answer?.least ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      {isMostSelected(option.id) && (
                        <span className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleLeastSelect(option.id)}
                      className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                        ${isLeastSelected(option.id)
                          ? "bg-red-500 border-red-500 text-white"
                          : "border-gray-300 hover:border-red-400"
                        }
                        ${answer?.most === option.id || (answer?.most && answer?.least) ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                      disabled={answer?.most === option.id || (answer?.most && answer?.least)}
                    >
                      {isLeastSelected(option.id) && (
                        <span className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Warning jika most dan least belum dipilih */}
        {(!answer?.most || !answer?.least) && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ You must select one statement for MOST and one for LEAST.
            </p>
          </div>
        )}

        {/* Info pilihan yang sudah dipilih */}
        {answer?.most && answer?.least && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ MOST: {question.discOptions.find(opt => opt.id === answer.most)?.text}
            </p>
            <p className="text-sm text-green-800">
              ✓ LEAST: {question.discOptions.find(opt => opt.id === answer.least)?.text}
            </p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex flex-wrap gap-2 mt-6">
          <Button
            variant={isFlagged ? undefined : "outline"}
            size="sm"
            onClick={onToggleFlag}
            className={[
              "flex items-center gap-2",
              isFlagged
                ? "bg-yellow-400 hover:bg-yellow-500 text-white border-yellow-400"
                : "",
            ].join(" ")}
          >
            <span className={isFlagged ? "text-white" : ""}>
              {isFlagged ? "Unmark" : "Mark for Review"}
            </span>
          </Button>
          <div className="ml-auto">
            <Button
              size="sm"
              onClick={onNext}
              disabled={!canGoNext}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
