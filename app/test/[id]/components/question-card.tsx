// src/app/users/[id]/components/QuestionCard.tsx
"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

// Bentuk data untuk setiap pertanyaan
export interface Question {
  text: string;
  options: string[];
}

interface QuestionCardProps {
  questions: Question[];
  answers: Record<number, string>;
  onAnswer: (index: number, value: string) => void;
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
          value={answers[current] || ""}
          onValueChange={(v) => onAnswer(current, v)}
          className="space-y-2"
        >
          {q.options.map((opt, i) => (
            <div key={i} className="flex items-center">
              <RadioGroupItem value={opt} id={`opt-${current}-${i}`} />
              <label htmlFor={`opt-${current}-${i}`} className="ml-2">
                {opt}
              </label>
            </div>
          ))}
        </RadioGroup>

        <div className="mt-4 flex justify-between">
          <Button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
          >
            Previous
          </Button>
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
