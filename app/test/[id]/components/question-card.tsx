// src/app/users/[id]/components/QuestionCard.tsx
"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

// Bentuk data untuk setiap pertanyaan
export interface Question {
  id?: number; // test_question id
  text: string;
  options: string[];
  optionIds?: string[]; // mapping id untuk non-DISC (CAAS/teliti)
  questionType?: string; // DISC, CAAS, teliti
  discOptions?: DiscOption[]; // Untuk DISC format
}

// Interface khusus untuk DISC options
export interface DiscOption {
  id: string;
  text: string;
  dimensionMost: string; // D, I, S, C, *
  dimensionLeast: string; // D, I, S, C, *
}

// Interface untuk jawaban DISC
export interface DiscAnswer {
  most: string; // ID dari option yang dipilih sebagai MOST
  least: string; // ID dari option yang dipilih sebagai LEAST
}

interface QuestionCardProps {
  questions: Question[];
  answers: Record<number, string | DiscAnswer>; // Support both string and DiscAnswer
  onAnswer: (index: number, value: string | DiscAnswer) => void;
  flags: Record<number, boolean>;
  onToggleFlag: (index: number) => void;
}

export function QuestionCard({
  questions,
  answers,
  onAnswer,
  flags,
  onToggleFlag,
}: QuestionCardProps) {
  const [current, setCurrent] = React.useState(0);
  const q = questions[current];

  return (
    <Card className="flex-1">
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <p>
            Question {current + 1}/{questions.length}
          </p>
          <Button
            size="sm"
            variant={flags[current] ? "secondary" : "outline"}
            onClick={() => onToggleFlag(current)}
          >
            {flags[current] ? "Unmark" : "Mark"}
          </Button>
        </div>

        <h3 className="font-medium mb-4">{q.text}</h3>

        <RadioGroup
          value={typeof answers[current] === 'string' ? (answers[current] as string) : ""}
          onValueChange={(v) => onAnswer(current, v)}
          className="space-y-2"
        >
          {q.options.map((opt, i) => (
            <div key={i} className="flex items-center">
              <RadioGroupItem 
                value={opt} 
                id={`opt-${current}-${i}`}
                disabled={!!answers[current]} // Disable once answer is selected
              />
              <label htmlFor={`opt-${current}-${i}`} className="ml-2">
                {opt}
              </label>
            </div>
          ))}
        </RadioGroup>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={() =>
              setCurrent((c) => Math.min(questions.length - 1, c + 1))
            }
            disabled={current === questions.length - 1}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
