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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  Question,
  QuestionType,
  QuestionOption,
} from "../services/disc-question-service";

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
  const [questionText, setQuestionText] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [category] = useState("");

  // fixed options DISC
  const fixedOptions = [
    "Sangat Setuju",
    "Setuju",
    "Netral",
    "Tidak Setuju",
    "Sangat Tidak Setuju",
  ];

  const [options, setOptions] = useState<QuestionOption[]>(
    fixedOptions.map((text, idx) => ({
      id: (idx + 1).toString(),
      text,
      dimensionMost: "",
      dimensionLeast: "",
    }))
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  function handleOptionChange(
    index: number,
    field: "dimensionMost" | "dimensionLeast",
    value: string
  ) {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);

    // validasi Most ≠ Least
    if (
      newOptions[index].dimensionMost &&
      newOptions[index].dimensionLeast &&
      newOptions[index].dimensionMost === newOptions[index].dimensionLeast
    ) {
      setErrors((prev) => ({
        ...prev,
        [newOptions[index].id]: "Most dan Least tidak boleh sama",
      }));
    } else {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[newOptions[index].id];
        return updated;
      });
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (Object.keys(errors).length > 0) {
      alert("Periksa kembali input Most & Least, tidak boleh sama.");
      return;
    }

    const payload: Omit<Question, "id"> = {
      type: activeType,
      text: questionText,
      mediaUrl: mediaFile ? URL.createObjectURL(mediaFile) : undefined,
      mediaType: mediaFile ? "image" : undefined,
      category: category || "1", // default category id 1
      options,
      answer: undefined,
    };

    await onSave(payload);

    // reset form setelah berhasil
    setQuestionText("");
    setMediaFile(null);
    setOptions(
      fixedOptions.map((text, idx) => ({
        id: (idx + 1).toString(),
        text,
        dimensionMost: "",
        dimensionLeast: "",
      }))
    );
    setErrors({});
    onOpenChange(false);
  }

  const isValid = questionText.trim() !== "" && Object.keys(errors).length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:w-[80vw] max-w-full sm:max-w-2xl max-h-[100vh] p-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex h-full flex-col">
          <DialogHeader className="px-4 sm:px-6 pb-2 sm:pt-6 flex flex-col items-center">
            <DialogTitle className="text-base sm:text-lg">
              Add Question {activeType}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Masukkan pertanyaan & gambar (opsional).
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
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {mediaFile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {mediaFile.name}
                  </p>
                )}
              </div>

              {/* Opsi fixed */}
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
                      <div className="flex items-center justify-between">
                        {/* Label jawaban */}
                        <span className="font-medium">{opt.text}</span>

                        {/* Dropdown Most & Least */}
                        <div className="flex gap-2">
                          {/* MOST */}
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
                            </SelectContent>
                          </Select>

                          {/* LEAST */}
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
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Error message */}
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
