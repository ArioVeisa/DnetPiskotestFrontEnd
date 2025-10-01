"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  Question,
  MediaType,
  QuestionOption,
} from "../services/teliti-question-service";

type EditQuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question | null;
  onSave: (id: string, data: Omit<Question, "id">) => Promise<void> | void;
};

export default function EditQuestionDialog({
  open,
  onOpenChange,
  question,
  onSave,
}: EditQuestionDialogProps) {
  const [itemA, setItemA] = useState("");
  const [itemB, setItemB] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType | undefined>(undefined);
  const [correctAnswer, setCorrectAnswer] = useState<"True" | "False" | null>(
    null
  );

  const defaultOptions: QuestionOption[] = [
    { id: "1", text: "True", score: 1, is_correct: false },
    { id: "2", text: "False", score: 0, is_correct: false },
  ];

  // isi data ketika edit dibuka
  useEffect(() => {
    if (!question) return;

    if (question.text.includes("|")) {
      const [a, b] = question.text.split("|").map((s) => s.trim());
      setItemA(a);
      setItemB(b);
    } else {
      setItemA(question.text);
      setItemB("");
    }

    // tentukan jawaban benar dari question.answer atau options
    if (question.answer) {
      setCorrectAnswer(question.answer as "True" | "False");
    } else if (question.options) {
      const correctOpt = question.options.find((opt) => opt.is_correct);
      setCorrectAnswer(correctOpt?.text as "True" | "False" | null);
    } else {
      setCorrectAnswer(null);
    }

    setMediaType(question.mediaType ?? undefined);
  }, [question, open]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setMediaFile(file);
      } else {
        alert("Hanya file gambar yang diperbolehkan.");
      }
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!question || !correctAnswer) return;

    const updatedOptions = defaultOptions.map((opt) => ({
      ...opt,
      is_correct: opt.text === correctAnswer,
    }));

    const payload: Omit<Question, "id"> = {
      type: question.type,
      text: `${itemA} | ${itemB}`,
      mediaUrl: mediaFile
        ? URL.createObjectURL(mediaFile)
        : question.mediaUrl ?? undefined,
      mediaType: mediaFile ? "image" : mediaType,
      category: "1",
      options: updatedOptions,
      answer: correctAnswer,
    };

    await onSave(question.id, payload);

    setMediaFile(null);
    onOpenChange(false);
  }

  const isValid =
    itemA.trim() !== "" && itemB.trim() !== "" && correctAnswer !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:w-[80vw] max-w-full sm:max-w-2xl max-h-[100vh] p-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex h-full flex-col">
          <DialogHeader className="px-4 sm:px-6 pb-2 sm:pt-6 flex flex-col items-center">
            <DialogTitle className="text-base sm:text-lg">
              Edit Question {question?.type}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Perbarui pertanyaan, gambar, dan jawaban benar.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[70vh]">
            <form
              onSubmit={handleSave}
              className="px-4 sm:px-6 pb-6 pt-2 space-y-4"
            >
              {/* Pertanyaan A */}
              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-medium">
                  Pertanyaan A
                </label>
                <Input
                  placeholder="Masukkan pernyataan pertama"
                  value={itemA}
                  onChange={(e) => setItemA(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Pertanyaan B */}
              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-medium">
                  Pertanyaan B
                </label>
                <Input
                  placeholder="Masukkan pernyataan kedua"
                  value={itemB}
                  onChange={(e) => setItemB(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Media (opsional) */}
              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-medium">
                  Upload Gambar (opsional)
                </label>
                <Input type="file" accept="image/*" onChange={handleFileChange} />
                {mediaFile ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    {mediaFile.name}
                  </p>
                ) : (
                  question?.mediaUrl && (
                    <p className="text-xs text-muted-foreground mt-1">
                      File sudah ada: {question.mediaUrl}
                    </p>
                  )
                )}
              </div>

              {/* Pilih Jawaban Benar */}
              <div className="space-y-2">
                <span className="text-xs sm:text-sm font-medium">
                  Pilih Jawaban Benar
                </span>
                <div className="flex gap-4">
                  {defaultOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={opt.text}
                        checked={correctAnswer === opt.text}
                        onChange={() => setCorrectAnswer(opt.text as "True" | "False")}
                      />
                      {opt.text}
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="min-w-[96px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="min-w-[96px]"
                  disabled={!isValid}
                >
                  Update
                </Button>
              </div>
            </form>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
