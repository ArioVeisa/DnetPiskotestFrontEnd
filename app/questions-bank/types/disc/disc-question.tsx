// app/questions-bank/stepper/type/teliti/teliti-question.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
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
} from "./services/disc-question-service";

import AddQuestionDialog from "./dialogs/add-question-dialog";
import EditQuestionDialog from "./dialogs/edit-question-dialog";
import ImportCsvDialog from "./dialogs/import-csv-dialog";
import { useCaasQuestions } from "./hooks/use-disc-question"; // Import hook
import { importQuestionsFromXlsx } from "./services/disc-question-service";

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

  // di atas return, di dalam komponen
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleUploadCSV = async (file: File) => {
    setUploadError(null);
    setUploading(true);
    try {
      // kirim langsung ke backend
      const res = await importQuestionsFromXlsx(file);
      console.log("[Import] Success:", res);

      // refresh daftar pertanyaan setelah upload
      await done();

      // tutup dialog
      setImportOpen(false);
    } catch (error) {
      console.error("[Import] Error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Gagal mengimpor file."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full px-3 sm:px-6 md:px-8 lg:px-16 py-6 sm:py-8 pb-24">
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
            className="hidden md:flex bg-white hover:bg-gray-100 cursor-pointer text-black shadow-sm"
            size="sm"
            type="button"
            onClick={openImport}
            disabled={loading}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
            Import Question
          </Button>
          <Button
            className="md:hidden bg-white hover:bg-gray-100 cursor-pointer text-black shadow-sm"
            size="icon"
            type="button"
            title="Import"
            onClick={openImport}
            disabled={loading}
          >
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
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

            {/* Options */}
            {q.options && q.options.length > 0 && (
              <div className="mt-4 space-y-2 pl-11">
                {q.options.map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm border-gray-100 bg-gray-50"
                  >
                    <span className="truncate">{opt.text}</span>
                    <span className="flex ml-4 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-blue-600 w-14 h-7 items-center justify-center">
                      {opt.dimensionMost} | {opt.dimensionLeast}
                    </span>
                  </div>
                ))}
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

      {/* FOOTER - Always fixed at bottom */}
      <div className="fixed bottom-0 left-[260px] right-0 border-t bg-white py-3 px-8 flex justify-end gap-2 shadow-md z-40">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Back
        </Button>
        <Button
          type="button"
          onClick={async () => {
            await done();
            onCancel();
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
