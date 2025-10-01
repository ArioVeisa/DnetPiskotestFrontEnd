"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Upload, FileSpreadsheet, X } from "lucide-react";

interface ImportQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (questionIds: number[]) => Promise<void>;
}

export default function ImportQuestionDialog({
  open,
  onOpenChange,
  onImport,
}: ImportQuestionDialogProps) {
  const [questionIds, setQuestionIds] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDropping, setIsDropping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse comma-separated IDs
  const parsedIds = questionIds
    .split(",")
    .map(id => parseInt(id.trim(), 10))
    .filter(id => !isNaN(id) && id > 0);

  const handleAddIds = () => {
    const newIds = parsedIds.filter(id => !selectedIds.includes(id));
    setSelectedIds([...selectedIds, ...newIds]);
    setQuestionIds("");
  };

  const handleRemoveId = (id: number) => {
    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
  };

  const handleImport = async () => {
    if (selectedIds.length === 0) return;

    setLoading(true);
    try {
      await onImport(selectedIds);
      handleReset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error importing questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuestionIds("");
    setSelectedIds([]);
    setFile(null);
  };

  const handleClose = () => {
    if (!loading) {
      handleReset();
      onOpenChange(false);
    }
  };

  // File upload handlers
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

  const handleUploadCSV = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      // TODO: Implement CSV parsing to extract question IDs
      console.log("CSV file selected:", file.name);
      // For now, show placeholder behavior
      alert("CSV import functionality will be implemented soon");
      setFile(null);
    } catch (error) {
      console.error("Error processing CSV:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl p-0 rounded-lg max-h-[90vh] flex flex-col">
        <div className="flex h-full flex-col">
          {/* HEADER */}
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-lg font-semibold">Import Questions</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="manual" className="flex h-full flex-col">
            {/* Tabs Navigation */}
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="manual" className="text-sm">
                  Manual Entry
                </TabsTrigger>
                <TabsTrigger value="csv" className="text-sm">
                  CSV Upload
                </TabsTrigger>
              </TabsList>
            </div>

            {/* BODY SCROLLABLE */}
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="px-6 pb-6">
                {/* ================= Manual ID Entry ================= */}
                <TabsContent value="manual" className="mt-0 space-y-6">
                  {/* Input Section */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Add Question IDs</label>
                      <div className="flex gap-3">
                        <Input
                          placeholder="Enter question IDs separated by commas (e.g., 123, 456, 789)"
                          value={questionIds}
                          onChange={(e) => setQuestionIds(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={handleAddIds}
                          disabled={parsedIds.length === 0}
                          variant="outline"
                        >
                          Add
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter the IDs of existing questions you want to add to this test section.
                      </p>
                    </div>

                    {/* Validation feedback */}
                    {questionIds.trim() && parsedIds.length === 0 && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                        Please enter valid question IDs (positive numbers).
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Selected Questions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Selected Questions ({selectedIds.length})
                      </label>
                      {selectedIds.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedIds([])}
                          className="text-red-600 hover:text-red-700"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>

                    {selectedIds.length > 0 ? (
                      <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                        <div className="space-y-2">
                          {selectedIds.map((id) => (
                            <div
                              key={id}
                              className="flex items-center justify-between p-3 bg-blue-50 rounded border"
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox checked={true} disabled />
                                <span className="font-medium">Question ID: {id}</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveId(id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground border rounded-md bg-gray-50">
                        No questions selected. Add question IDs above to import them.
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* ================= CSV Upload ================= */}
                <TabsContent value="csv" className="mt-0 space-y-6">
                  <div
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                      isDropping 
                        ? "border-primary/60 bg-muted/50" 
                        : "border-muted-foreground/20"
                    }`}
                  >
                    <Upload className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                    <div className="text-base font-medium">Upload CSV/Excel File</div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Drag & drop your file here, or click the button below.
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      File should contain question IDs in the first column.
                    </p>

                    <input
                      ref={inputRef}
                      type="file"
                      accept=".csv,.xls,.xlsx"
                      onChange={onFileChange}
                      className="hidden"
                    />
                    
                    <Button onClick={chooseFile} className="mt-4" variant="outline">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>

                    {file && (
                      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="flex items-center justify-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFile(null)}
                            className="ml-2 text-blue-600 hover:text-blue-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-amber-900 mb-2">Note:</h4>
                    <p className="text-sm text-amber-800">
                      CSV upload functionality is coming soon. For now, please use the manual entry method.
                    </p>
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>

            {/* FOOTER */}
            <div className="px-6 pb-6">
              <Separator className="mb-4" />
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                
                {/* Manual Import Button */}
                <TabsContent value="manual" className="m-0">
                  <Button
                    onClick={handleImport}
                    disabled={selectedIds.length === 0 || loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? "Importing..." : `Import ${selectedIds.length} Question${selectedIds.length !== 1 ? 's' : ''}`}
                  </Button>
                </TabsContent>

                {/* CSV Upload Button */}
                <TabsContent value="csv" className="m-0">
                  <Button
                    onClick={handleUploadCSV}
                    disabled={!file || loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? "Processing..." : "Upload & Import"}
                  </Button>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}