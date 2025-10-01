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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  Question,
  MediaType,
  QuestionOption,
} from "../services/caas-question-service";

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
  const [questionText, setQuestionText] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType | undefined>(undefined);

  // opsi default (fixed, read-only)
  const defaultOptions: QuestionOption[] = [
    { id: "1", text: "Paling kuat", score: 5 },
    { id: "2", text: "Sangat kuat", score: 4 },
    { id: "3", text: "Kuat", score: 3 },
    { id: "4", text: "Cukup kuat", score: 2 },
    { id: "5", text: "Tidak kuat", score: 1 },
  ];

  // isi data ketika edit dibuka
  useEffect(() => {
    if (!question) return;
    setQuestionText(question.text ?? "");
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
    if (!question) return;

    const payload: Omit<Question, "id"> = {
      type: question.type,
      text: questionText,
      mediaUrl: mediaFile
        ? URL.createObjectURL(mediaFile)
        : question.mediaUrl ?? undefined,
      mediaType: mediaFile ? "image" : mediaType,
      category: "1", // fix default category id 1
      options: defaultOptions,
      answer: undefined,
    };

    await onSave(question.id, payload);

    // reset setelah update
    setMediaFile(null);
    onOpenChange(false);
  }

  const isValid = questionText.trim() !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:w-[80vw] max-w-full sm:max-w-2xl max-h-[100vh] p-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex h-full flex-col">
          <DialogHeader className="px-4 sm:px-6 pb-2 sm:pt-6 flex flex-col items-center">
            <DialogTitle className="text-base sm:text-lg">
              Edit Question {question?.type}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Perbarui pertanyaan & gambar (opsional).
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[70vh]">
            <form
              onSubmit={handleSave}
              className="px-4 sm:px-6 pb-6 pt-2 space-y-4"
            >
              {/* Pertanyaan */}
              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-medium">
                  Statement
                </label>
                <Textarea
                  placeholder="Masukkan pertanyaan"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Media (opsional, hanya gambar) */}
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

              {/* Opsi default (read-only) */}
              <div className="space-y-2">
                <span className="text-xs sm:text-sm font-medium">
                  Pilihan Jawaban
                </span>
                <div className="space-y-2">
                  {defaultOptions.map((opt) => (
                    <div
                      key={opt.id}
                      className="rounded-md border px-3 py-2 bg-gray-50 text-sm"
                    >
                      {opt.text}
                    </div>
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
                  disabled={!question || !isValid}
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
