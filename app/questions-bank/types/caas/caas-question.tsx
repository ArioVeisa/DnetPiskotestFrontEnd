// app/questions-bank/stepper/type/teliti/teliti-question.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  NotepadText,
  FileSpreadsheet,
  Plus,
  Edit3,
  Trash2,
} from "lucide-react";

import type {
  Question as StepQuestion,
  QuestionType,
  QuestionBank,
} from "./services/caas-question-service";

import AddQuestionDialog from "./dialogs/add-question-dialog";
import EditQuestionDialog from "./dialogs/edit-question-dialog";
import ImportCsvDialog from "./dialogs/import-csv-dialog";
import { useCaasQuestions } from "./hooks/use-caas-question"; // Import hook

// ✅ definisi props biar jelas - props simplified karena logic dipindah ke hook
interface CaasQuestionsStepProps {
  bank: QuestionBank;
  onCancel: () => void;
  onSave: () => void;
}

export default function CaasQuestionsStep({
  bank,
  onCancel,
}: CaasQuestionsStepProps) {
  // ✅ Gunakan hook untuk state management
  const {
    items: questions,
    loading,
    addOne,
    editOne,
    remove,
    done,
  } = useCaasQuestions();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editingQuestion = useMemo(
    () => questions.find((q) => q.id === editingId) ?? null,
    [editingId, questions]
  );

  const icon = bank.name.charAt(0).toUpperCase();

  const openAdd = () => setAddOpen(true);
  const openEdit = (id: string) => {
    setEditingId(id);
    setEditOpen(true);
  };
  const openImport = () => setImportOpen(true);

  // ✅ Handler menggunakan hook
  const handleAddSave = async (data: Omit<StepQuestion, "id">) => {
    try {
      await addOne(data);
      setAddOpen(false);
    } catch (error) {
      console.error("Failed to add question:", error);
      // Handle error jika perlu
    }
  };

  const handleEditSave = async (id: string, data: Omit<StepQuestion, "id">) => {
    try {
      await editOne(id, data);
      setEditOpen(false);
      setEditingId(null);
    } catch (error) {
      console.error("Failed to edit question:", error);
      // Handle error jika perlu
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
    } catch (error) {
      console.error("Failed to delete question:", error);
      // Handle error jika perlu
    }
  };

  const parseCsv = async (file: File): Promise<StepQuestion[]> => {
    const raw = await file.text();
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return [];

    const headerCols = lines[0].split(/[,;]\s*/);
    const headerLooksLike =
      headerCols.some((h) => /^text$/i.test(h)) ||
      /(^|,|\|)text($|,|\|)/i.test(lines[0]);

    const rows = headerLooksLike ? lines.slice(1) : lines;

    const out: StepQuestion[] = [];
    for (const row of rows) {
      const cols = row
        .split(/[,;](?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map((c) => c.replace(/^"|"$/g, "").trim());

      const [text] = cols;
      if (!text) continue;
    }
    return out;
  };

  const handleUploadCSV = async (file: File) => {
    setUploadError(null);
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "csv") {
        throw new Error("Hanya mendukung .csv untuk saat ini.");
      }
      const qs = await parseCsv(file);
      if (qs.length === 0) {
        throw new Error(
          "CSV kosong atau tidak valid. Minimal kolom `text` harus ada."
        );
      }

      // ✅ Batch import menggunakan hook
      for (const q of qs) {
        const { ...questionData } = q; // Remove temporary ID
        await addOne(questionData);
      }

      setImportOpen(false);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full px-3 sm:px-6 md:px-8 lg:px-16 py-6 sm:py-8">
      {/* Loading state */}
      {loading && (
        <div className="mb-4 text-center text-sm text-muted-foreground">
          Loading questions...
        </div>
      )}

      {/* Breadcrumb */}
      <div className="mb-4 text-xs text-muted-foreground">
        <span>Question Bank</span>
        <span className="mx-2">/</span>
        <span className="font-medium text-foreground">Add Questions</span>
      </div>

      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold">
            {icon}
          </div>
          <div>
            <h1 className="text-xl font-semibold">{bank.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className="border border-blue-200 bg-blue-50 text-blue-600 text-xs font-medium">
                <NotepadText className="mr-1.5 h-3.5 w-3.5" />
                <span className="tabular-nums">{questions.length}</span>
                <span className="hidden md:inline">&nbsp;Questions</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Import */}
        <div className="flex items-center gap-2">
          <Button
            className="hidden md:flex bg-blue-500 hover:bg-blue-600 text-white"
            size="sm"
            type="button"
            onClick={openImport}
            disabled={loading}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Import Question
          </Button>
          <Button
            className="md:hidden bg-blue-500 hover:bg-blue-600 text-white"
            size="icon"
            type="button"
            title="Import"
            onClick={openImport}
            disabled={loading}
          >
            <FileSpreadsheet className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add New Question */}
      <button
        type="button"
        onClick={openAdd}
        disabled={loading}
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/30 py-6 text-sm text-muted-foreground transition hover:bg-muted/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="h-4 w-4" />
        Add New Question
      </button>

      {/* List pertanyaan */}
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
          >
            {/* Header pertanyaan */}
            <div className="flex items-start justify-between">
              <div className="flex min-w-0 gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-full border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-600">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-muted-foreground">
                    Question
                  </div>
                  <div className="font-medium text-gray-900">{q.text}</div>
                </div>
              </div>

              {/* Tombol aksi */}
              <div className="flex items-center gap-2">
                <div className="flex gap-2 md:hidden">
                  <Button
                    size="icon"
                    variant="secondary"
                    title="Edit"
                    type="button"
                    onClick={() => openEdit(q.id)}
                    disabled={loading}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    title="Delete"
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="hidden gap-2 md:flex">
                  <Button
                    size="sm"
                    className="bg-neutral-900 text-white hover:bg-neutral-800"
                    type="button"
                    onClick={() => openEdit(q.id)}
                    disabled={loading}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            {q.options && q.options.length > 0 && (
              <div className="mt-4 space-y-2 pl-11">
                {q.options.map((opt) => {
                  const isCorrect = opt.score === 10;
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                        isCorrect
                          ? "border-green-200 bg-green-50"
                          : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      <span className="truncate">{opt.text}</span>
                      <span
                        className={`ml-4 rounded-md px-2 py-0.5 text-xs font-medium ${
                          isCorrect
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {isCorrect ? "Benar" : `skor: ${opt.score}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {questions.length === 0 && !loading && (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Belum ada pertanyaan.
          </div>
        )}
      </div>

      {/* Footer tombol kanan */}
      <div className="flex justify-end gap-2 mt-7">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Back
        </Button>
        <Button
          type="button"
          onClick={async () => {
            await done(); // kalau ada simpan data
            onCancel(); // ✅ balik ke halaman list bank
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white"
          disabled={loading}
        >
          Save
        </Button>
      </div>

      {/* Dialogs */}
      <AddQuestionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        activeType={bank.testType as QuestionType}
        onSave={handleAddSave}
      />

      <EditQuestionDialog
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v);
          if (!v) setEditingId(null);
        }}
        question={editingQuestion}
        onSave={handleEditSave}
      />

      <ImportCsvDialog
        open={importOpen}
        onOpenChange={(v) => {
          setImportOpen(v);
          if (!v) {
            setUploadError(null);
            setUploading(false);
          }
        }}
        onUploadCSV={handleUploadCSV}
        uploading={uploading}
        error={uploadError}
      />
    </div>
  );
}
