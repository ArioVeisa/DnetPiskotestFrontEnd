"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpload: (file: File) => Promise<void>;
  uploading?: boolean;
  error?: string | null;
};

export default function ImportCandidatesDialog({
  open,
  onOpenChange,
  onUpload,
  uploading,
  error,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isDropping, setIsDropping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const chooseFile = () => inputRef.current?.click();
  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
    e.currentTarget.value = "";
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropping(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };
  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropping(true);
  };
  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropping(false);
  };

  async function handleUpload() {
    if (!file) return;
    await onUpload(file);
    setFile(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md p-0 rounded-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold pt-4 sm:pt-6 px-4 sm:px-8">
            Import Candidates
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-8 pt-2 sm:pt-4 space-y-4 overflow-y-auto">
          {error && (
            <div className="text-red-500 text-sm py-2 px-3 bg-red-50 rounded-md border border-red-100">
              {error}
            </div>
          )}

          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`rounded-xl border-2 border-dashed p-6 sm:p-8 text-center ${
              isDropping ? "border-blue-400 bg-blue-50" : "border-gray-300"
            }`}
          >
            <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <div className="text-base font-medium text-gray-900 mb-2">
              Upload CSV/XLS File
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Drag & drop file di sini, atau klik tombol di bawah.
            </p>

            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={onFileChange}
              className="hidden"
            />
            <Button
              onClick={chooseFile}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Choose File
            </Button>

            {file && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-800">
                  Selected:{" "}
                  <span className="font-medium break-all">{file.name}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={!!uploading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || !!uploading}>
              {uploading ? "Uploading..." : "Upload & Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
