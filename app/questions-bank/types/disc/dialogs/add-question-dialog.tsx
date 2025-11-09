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
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [category] = useState("");

  const [options, setOptions] = useState<QuestionOption[]>([
    { id: "1", text: "", dimensionMost: "", dimensionLeast: "" },
    { id: "2", text: "", dimensionMost: "", dimensionLeast: "" },
    { id: "3", text: "", dimensionMost: "", dimensionLeast: "" },
    { id: "4", text: "", dimensionMost: "", dimensionLeast: "" },
    { id: "5", text: "", dimensionMost: "", dimensionLeast: "" },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

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
      errorMsg = "Answer text is required";
    } else if (!opt.dimensionMost || !opt.dimensionLeast) {
      errorMsg = "Most & Least dimensions are required";
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

    // Validate all options again
    options.forEach((opt) => validateOption(opt));

    if (Object.keys(errors).length > 0) {
      alert(
        "Please check your input: all texts & dimensions must be filled and valid."
      );
      return;
    }

    const allFilled = options.every(
      (opt) =>
        opt.text.trim() !== "" &&
        opt.dimensionMost &&
        opt.dimensionLeast
    );

    if (!allFilled) {
      alert("Please ensure all options and dimensions are filled correctly.");
      return;
    }

    const payload: Omit<Question, "id"> = {
      type: activeType,
      text: "-", // placeholder since question column is removed
      mediaUrl: mediaFile ? URL.createObjectURL(mediaFile) : undefined,
      mediaType: mediaFile ? "image" : undefined,
      category: category || "1",
      options,
      answer: undefined,
    };

    await onSave(payload);

    // Reset form
    setMediaFile(null);
    setOptions([
      { id: "1", text: "", dimensionMost: "", dimensionLeast: "" },
      { id: "2", text: "", dimensionMost: "", dimensionLeast: "" },
      { id: "3", text: "", dimensionMost: "", dimensionLeast: "" },
      { id: "4", text: "", dimensionMost: "", dimensionLeast: "" },
      { id: "5", text: "", dimensionMost: "", dimensionLeast: "" },
    ]);
    setErrors({});
    onOpenChange(false);
  }

  const isValid =
    options.every(
      (opt) =>
        opt.text.trim() !== "" &&
        opt.dimensionMost &&
        opt.dimensionLeast
    ) && Object.keys(errors).length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:w-[80vw] max-w-full sm:max-w-2xl max-h-[100vh] p-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex h-full flex-col">
          <DialogHeader className="px-4 sm:px-6 pb-2 sm:pt-6 flex flex-col items-center">
            <DialogTitle className="text-base sm:text-lg">
              Add Question {activeType}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Enter answer choices & dimensions (Most / Least)
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[70vh]">
            <form
              onSubmit={handleSave}
              className="px-4 sm:px-6 pb-6 pt-2 space-y-4"
            >
              {/* Answer Choices */}
              <div className="space-y-2">
                <div className="space-y-3">
                  {options.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className="rounded-md border px-3 py-2 bg-gray-50 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        {/* Manual answer input */}
                        <Input
                          placeholder={`Option ${idx + 1}`}
                          value={opt.text}
                          onChange={(e) =>
                            handleOptionChange(idx, "text", e.target.value)
                          }
                          className="flex-1 text-sm border-0 shadow-none"
                        />

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
                              <SelectItem value="*">*</SelectItem>
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
                              <SelectItem value="*">*</SelectItem>
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
