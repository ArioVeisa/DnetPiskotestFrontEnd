"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  showQuestionService,
  ShowQuestion,
  ShowQuestionType,
} from "../service/show-question-service";

type AddQuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeType: ShowQuestionType;
  token: string;
  onSave: (questionId: number, questionType: ShowQuestionType) => Promise<void>;
  existingIds: number[];
};

export default function AddQuestionDialog({
  open,
  onOpenChange,
  activeType,
  token,
  onSave,
  existingIds,
}: AddQuestionDialogProps) {
  const [questions, setQuestions] = useState<ShowQuestion[]>([]);
  const [fetching, setFetching] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [adding, setAdding] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // 🔹 Fetch soal dari bank soal sesuai type
  useEffect(() => {
    if (!open) return;
    setFetching(true);
    setLocalError(null);
    setSelectedIds([]); // reset selection
    showQuestionService
      .getByType(activeType, token)
      .then(setQuestions)
      .catch((err) => console.error("Gagal load soal:", err))
      .finally(() => setFetching(false));
  }, [open, activeType, token]);

  // 🔹 Filter soal yang belum ditambahkan
  const availableQuestions = questions.filter(
    (q) => !existingIds.includes(q.id)
  );

  // 🔹 Toggle single checkbox
  const toggleQuestion = (questionId: number) => {
    setSelectedIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  // 🔹 Select/Deselect All
  const isAllSelected =
    availableQuestions.length > 0 &&
    selectedIds.length === availableQuestions.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(availableQuestions.map((q) => q.id));
    }
  };

  // 🔹 Tambah soal ke test
  const handleAddSelected = async () => {
    if (selectedIds.length === 0) {
      setLocalError("❌ Pilih minimal 1 soal");
      return;
    }

    setAdding(true);
    setLocalError(null);

    try {
      // Tambahkan semua soal yang dipilih
      for (const questionId of selectedIds) {
        await onSave(questionId, activeType);
      }
      onOpenChange(false); // close dialog setelah sukses
    } catch (error) {
      console.error("Error adding questions:", error);
      setLocalError("❌ Gagal menambahkan soal");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl p-0 rounded-lg max-h-[90vh] flex flex-col">
        {/* HEADER */}
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg font-semibold">
            Pilih Soal - <span className="text-blue-600">{activeType}</span>
          </DialogTitle>
          {localError && (
            <p className="text-red-600 text-sm mt-2">{localError}</p>
          )}
        </DialogHeader>

        {/* SELECT ALL */}
        {!fetching && availableQuestions.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-y">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium cursor-pointer"
              >
                Pilih Semua ({selectedIds.length}/{availableQuestions.length})
              </label>
            </div>
          </div>
        )}

        {/* BODY */}
        <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
          {fetching ? (
            <p className="text-sm text-muted-foreground">Loading questions...</p>
          ) : availableQuestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {questions.length === 0
                ? "Tidak ada soal tersedia untuk tipe ini."
                : "Semua soal sudah ditambahkan ke test."}
            </p>
          ) : (
            <div className="space-y-3">
              {availableQuestions.map((q) => (
                <div
                  key={q.id}
                  className="border rounded-lg p-4 shadow-sm hover:bg-blue-50 transition cursor-pointer"
                  onClick={() => toggleQuestion(q.id)}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedIds.includes(q.id)}
                      onCheckedChange={() => toggleQuestion(q.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <p className="text-sm flex-1">{q.question_text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />
        {/* FOOTER */}
        <div className="flex justify-between items-center p-4">
          <p className="text-sm text-gray-600">
            {selectedIds.length} soal dipilih
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={adding}
            >
              Batal
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleAddSelected}
              disabled={adding || selectedIds.length === 0}
            >
              {adding ? "Menambahkan..." : `Tambah ${selectedIds.length} Soal`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}