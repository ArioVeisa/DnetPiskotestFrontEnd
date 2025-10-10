"use client";

import React, { useState } from "react";
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
  QuestionType,
  QuestionOption,
} from "../services/teliti-question-service";

type AddQuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeType: QuestionType;
  onSave: (data: Omit<Question, "id">) => Promise<void> | void;
};

export default function AddQuestionDialog({
  open,
  onOpenChange,
  activeType,
  onSave,
}: AddQuestionDialogProps) {
  // DISC / CAAS
  const [questionText, setQuestionText] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  // Fast Accuracy
  const [itemA, setItemA] = useState("");
  const [itemB, setItemB] = useState("");
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [answer, setAnswer] = useState<"True" | "False">("True");

  const [category] = useState("1");

  // opsi default DISC/CAAS
  const defaultOptions: QuestionOption[] = [
    { id: "1", text: "Paling kuat", score: 5 },
    { id: "2", text: "Sangat kuat", score: 4 },
    { id: "3", text: "Kuat", score: 3 },
    { id: "4", text: "Cukup kuat", score: 2 },
    { id: "5", text: "Tidak kuat", score: 1 },
  ];

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (f: File | null) => void
  ) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setter(file);
      } else {
        alert("Hanya file gambar yang diperbolehkan.");
      }
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    let payload: Omit<Question, "id">;

    if (activeType === "Fast Accuracy") {
      payload = {
        type: activeType,
        text: `${itemA} | ${itemB}`, // digabung untuk backend
        mediaUrl: undefined, // kalau mau dukung upload A/B bisa diatur di service
        mediaType: undefined,
        category,
        options: [
          { id: "1", text: "True", score: 10, is_correct: answer === "True" },
          { id: "2", text: "False", score: 10, is_correct: answer === "False" },
        ],
        answer,
      };
    } else {
      payload = {
        type: activeType,
        text: questionText,
        mediaUrl: mediaFile ? URL.createObjectURL(mediaFile) : undefined,
        mediaType: mediaFile ? "image" : undefined,
        category,
        options: defaultOptions,
        answer: undefined,
      };
    }

    await onSave(payload);

    // reset form
    setQuestionText("");
    setMediaFile(null);
    setItemA("");
    setItemB("");
    setFileA(null);
    setFileB(null);
    setAnswer("True");
    onOpenChange(false);
  }

  const isValid =
    activeType === "Fast Accuracy"
      ? itemA.trim() !== "" && itemB.trim() !== ""
      : questionText.trim() !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:w-[80vw] max-w-full sm:max-w-2xl max-h-[100vh] p-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex h-full flex-col">
          <DialogHeader className="px-4 sm:px-6 pb-2 sm:pt-6 flex flex-col items-center">
            <DialogTitle className="text-base sm:text-lg">
              Add Question {activeType}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {activeType === "Fast Accuracy"
                ? "Masukkan Item A & Item B, lalu tentukan jawaban benar."
                : "Masukkan pertanyaan & gambar (opsional)."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea>
            <form
              onSubmit={handleSave}
              className="px-4 sm:px-6 pb-6 pt-2 space-y-4"
            >
              {activeType === "Fast Accuracy" ? (
                <>
                  {/* Item A */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Item A</label>
                    <Input
                      placeholder="Masukkan teks Item A"
                      value={itemA}
                      onChange={(e) => setItemA(e.target.value)}
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setFileA)}
                    />
                    {fileA && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {fileA.name}
                      </p>
                    )}
                  </div>

                  {/* Item B */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Item B</label>
                    <Input
                      placeholder="Masukkan teks Item B"
                      value={itemB}
                      onChange={(e) => setItemB(e.target.value)}
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setFileB)}
                    />
                    {fileB && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {fileB.name}
                      </p>
                    )}
                  </div>

                  {/* Jawaban benar */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Correct Answer</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          checked={answer === "True"}
                          onChange={() => setAnswer("True")}
                        />
                        True
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          checked={answer === "False"}
                          onChange={() => setAnswer("False")}
                        />
                        False
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Pertanyaan DISC/CAAS */}
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

                  {/* Upload media */}
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium">
                      Upload Gambar (opsional)
                    </label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setMediaFile)}
                    />
                    {mediaFile && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {mediaFile.name}
                      </p>
                    )}
                  </div>

                  {/* Opsi DISC/CAAS */}
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
                </>
              )}

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
                <Button type="submit" className="min-w-[96px]" disabled={!isValid}>
                  Save
                </Button>
              </div>
            </form>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
