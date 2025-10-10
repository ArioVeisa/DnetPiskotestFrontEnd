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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import type {
  Question,
  QuestionOption,
} from "../services/disc-question-service";

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
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // load data existing
  useEffect(() => {
    if (!question) return;

    setOptions(
      question.options?.length
        ? question.options.map((o) => ({
            id: o.id,
            text: o.text ?? "",
            dimensionMost: o.dimensionMost ?? "",
            dimensionLeast: o.dimensionLeast ?? "",
          }))
        : [
            { id: "1", text: "", dimensionMost: "", dimensionLeast: "" },
            { id: "2", text: "", dimensionMost: "", dimensionLeast: "" },
            { id: "3", text: "", dimensionMost: "", dimensionLeast: "" },
            { id: "4", text: "", dimensionMost: "", dimensionLeast: "" },
            { id: "5", text: "", dimensionMost: "", dimensionLeast: "" },
          ]
    );
  }, [question, open]);

  function handleOptionChange(
    index: number,
    field: keyof QuestionOption,
    value: string
  ) {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
    validateOption(newOptions[index]);
  }

  function validateOption(opt: QuestionOption) {
    let errorMsg = "";

    if (!opt.text.trim()) {
      errorMsg = "Teks jawaban wajib diisi";
    } else if (!opt.dimensionMost || !opt.dimensionLeast) {
      errorMsg = "Dimensi Most & Least wajib diisi";
    } else if (opt.dimensionMost === opt.dimensionLeast) {
      errorMsg = "Most dan Least tidak boleh sama";
    }

    setErrors((prev) => {
      const updated = { ...prev };
      if (errorMsg) {
        updated[opt.id] = errorMsg;
      } else {
        delete updated[opt.id];
      }
      return updated;
    });
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!question) return;

    options.forEach((opt) => validateOption(opt));

    if (Object.keys(errors).length > 0) {
      alert("Periksa kembali input: semua teks & dimensi wajib diisi dan valid.");
      return;
    }

    const allFilled = options.every(
      (opt) =>
        opt.text.trim() !== "" &&
        opt.dimensionMost &&
        opt.dimensionLeast &&
        opt.dimensionMost !== opt.dimensionLeast
    );

    if (!allFilled) {
      alert("Pastikan semua opsi dan dimensi sudah diisi dengan benar.");
      return;
    }

    const payload: Omit<Question, "id"> = {
      type: question.type,
      text: question.text ?? "-",
      mediaUrl: mediaFile
        ? URL.createObjectURL(mediaFile)
        : question.mediaUrl ?? undefined,
      mediaType: mediaFile ? "image" : question.mediaType,
      category: question.category ?? "1",
      options,
      answer: undefined,
    };

    await onSave(question.id, payload);

    setMediaFile(null);
    setErrors({});
    onOpenChange(false);
  }

  const isValid =
    options.every(
      (opt) =>
        opt.text.trim() !== "" &&
        opt.dimensionMost &&
        opt.dimensionLeast &&
        opt.dimensionMost !== opt.dimensionLeast
    ) && Object.keys(errors).length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:w-[80vw] max-w-full sm:max-w-2xl max-h-[100vh] p-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex h-full flex-col">
          <DialogHeader className="px-4 sm:px-6 pb-2 sm:pt-6 flex flex-col items-center">
            <DialogTitle className="text-base sm:text-lg">
              Edit Question {question?.type}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Perbarui pilihan jawaban & dimensi (Most / Least)
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[70vh]">
            <form
              onSubmit={handleSave}
              className="px-4 sm:px-6 pb-6 pt-2 space-y-4"
            >
              {/* Pilihan Jawaban */}
              <div className="space-y-2">
                <span className="text-xs sm:text-sm font-medium">
                  Pilihan Jawaban
                </span>
                <div className="space-y-3">
                  {options.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className="rounded-md border px-3 py-2 bg-gray-50 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Input
                          placeholder={`Jawaban ${idx + 1}`}
                          value={opt.text}
                          onChange={(e) =>
                            handleOptionChange(idx, "text", e.target.value)
                          }
                          className="flex-1 text-sm border-0 shadow-none"
                        />

                        <div className="flex gap-2">
                          <Select
                            value={opt.dimensionMost || ""}
                            onValueChange={(val) =>
                              handleOptionChange(idx, "dimensionMost", val)
                            }
                          >
                            <SelectTrigger className="w-16 h-7 text-xs">
                              <SelectValue placeholder="M" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="D">D</SelectItem>
                              <SelectItem value="I">I</SelectItem>
                              <SelectItem value="S">S</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                              <SelectItem value="*">*</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={opt.dimensionLeast || ""}
                            onValueChange={(val) =>
                              handleOptionChange(idx, "dimensionLeast", val)
                            }
                          >
                            <SelectTrigger className="w-16 h-7 text-xs">
                              <SelectValue placeholder="L" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="D">D</SelectItem>
                              <SelectItem value="I">I</SelectItem>
                              <SelectItem value="S">S</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                              <SelectItem value="*">*</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {errors[opt.id] && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors[opt.id]}
                        </p>
                      )}
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
