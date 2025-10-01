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
  existingIds: number[]; // 🔹 kirim daftar soal yang sudah ada di section
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
  const [addingId, setAddingId] = useState<number | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // 🔹 Fetch soal dari bank soal sesuai type
  useEffect(() => {
    if (!open) return;
    setFetching(true);
    setLocalError(null); // reset error tiap buka
    showQuestionService
      .getByType(activeType, token)
      .then(setQuestions)
      .catch((err) => console.error("Gagal load soal:", err))
      .finally(() => setFetching(false));
  }, [open, activeType, token]);

  // 🔹 Tambah soal ke test
  const handleAdd = async (questionId: number) => {
    if (existingIds.includes(questionId)) {
      setLocalError("❌ Soal sudah ditambahkan");
      return;
    }

    setAddingId(questionId);
    setLocalError(null);

    try {
      await onSave(questionId, activeType);
      onOpenChange(false); // close dialog setelah sukses
    } catch (error) {
      console.error("Error adding question:", error);
    } finally {
      setAddingId(null);
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

        {/* BODY */}
        <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
          {fetching ? (
            <p className="text-sm text-muted-foreground">Loading questions...</p>
          ) : questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tidak ada soal tersedia untuk tipe ini.
            </p>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="border rounded-lg p-4 shadow-sm hover:bg-blue-50 transition"
                >
                  <p className="font-medium">{q.question_text}</p>
                  <ul className="list-disc ml-6 mt-2 text-sm text-gray-600">
                    {q.options.map((opt) => (
                      <li key={opt.id}>{opt.option_text}</li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    className="mt-3 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleAdd(q.id)}
                    disabled={addingId === q.id}
                    aria-busy={addingId === q.id}
                  >
                    {addingId === q.id ? "Menambahkan..." : "Tambah"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />
        {/* FOOTER */}
        <div className="flex justify-end p-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={addingId !== null}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
