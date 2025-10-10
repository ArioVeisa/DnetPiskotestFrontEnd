"use client";

import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadCSV: (file: File) => Promise<void> | void;
  uploading?: boolean;
  error?: string | null;
};

export default function ImportCsvDialog({
  open,
  onOpenChange,
  onUploadCSV,
  uploading,
  error,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isDropping, setIsDropping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const chooseFile = () => inputRef.current?.click();
  const handleFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
    e.currentTarget.value = "";
  };

  const downloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/templates/template-teliti.xlsx"; // ✅ path publik, bukan relative filesystem
    link.download = "template-teliti.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md p-0 rounded-2xl">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="text-base sm:text-lg mb-2">
            Import Question (XLS)
          </DialogTitle>
        </DialogHeader>

        {/* Template Download Section */}
        <div className="mx-4 p-4 bg-muted/30 rounded-lg border border-muted-foreground/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Butuh template?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download template untuk format yang benar
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        <div
          onDrop={(e) => {
            e.preventDefault();
            setIsDropping(false);
            const f = e.dataTransfer.files?.[0];
            if (f) setFile(f);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDropping(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDropping(false);
          }}
          className={`mx-4 rounded-xl border-2 border-dashed p-8 text-center ${
            isDropping
              ? "border-primary/60 bg-muted/50"
              : "border-muted-foreground/20"
          }`}
        >
          <Upload className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <div className="text-base font-medium">Upload XLS File</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag & drop file di sini, atau klik tombol di bawah.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={handleFile}
            className="hidden"
          />
          <Button onClick={chooseFile} className="mt-4">
            Choose File
          </Button>

          {file && (
            <div className="mt-3 text-sm text-muted-foreground">
              Selected:{" "}
              <span className="font-medium text-foreground">{file.name}</span>
            </div>
          )}
          {error && <div className="mt-3 text-sm text-red-500">{error}</div>}
        </div>

        <div className="m-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={!!uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => file && onUploadCSV(file)}
            disabled={!file || !!uploading}
          >
            {uploading ? "Uploading..." : "Upload & Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
