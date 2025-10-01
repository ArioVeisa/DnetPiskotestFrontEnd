"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Question } from "../service/manage-question-service";

interface EditQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question | null;
  onSave: (questionId: number, questionType: string) => Promise<void>;
}

export default function EditQuestionDialog({
  open,
  onOpenChange,
  question,
  onSave,
}: EditQuestionDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!question) return;

    setLoading(true);
    try {
      // Service updateQuestion hanya butuh questionId dan questionType
      // Actual update logic handled by backend/service
      await onSave(parseInt(question.id, 10), question.type);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating question:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl p-0 rounded-lg max-h-[90vh] flex flex-col">
        {/* HEADER */}
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg font-semibold">
            Edit Question - <span className="text-blue-600">{question.type}</span>
          </DialogTitle>
        </DialogHeader>

        {/* BODY */}
        <ScrollArea className="flex-1 overflow-y-scroll">
          <div className="px-6 py-6 space-y-6">
            
            {/* Question Info */}
            <div className="space-y-4">
              <div>
                <Label>Question ID</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <span className="font-mono font-medium">{question.id}</span>
                </div>
              </div>

              <div>
                <Label>Type</Label>
                <div className="mt-1">
                  <Badge variant="secondary">{question.type}</Badge>
                </div>
              </div>

              <div>
                <Label>Category</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  {question.category || "No category"}
                </div>
              </div>
            </div>

            <Separator />

            {/* Question Text */}
            <div>
              <Label>Question Text</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md min-h-[60px]">
                <p className="text-sm leading-relaxed">{question.text}</p>
              </div>
            </div>

            {/* Media Info */}
            {question.mediaUrl && (
              <>
                <Separator />
                <div>
                  <Label>Media</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{question.mediaType}</Badge>
                      <span className="text-sm text-muted-foreground truncate">
                        {question.mediaUrl}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Options Display */}
            {question.options && Object.keys(question.options).length > 0 && (
              <>
                <Separator />
                <div>
                  <Label>Options</Label>
                  <div className="mt-1 space-y-2">
                    {Object.entries(question.options).map(([key, value]) => (
                      <div
                        key={key}
                        className={`p-3 rounded-md border ${
                          question.answer === key 
                            ? "bg-green-50 border-green-200" 
                            : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Badge 
                            variant={question.answer === key ? "default" : "outline"}
                            className="mt-1 shrink-0"
                          >
                            {key}
                          </Badge>
                          <span className="flex-1 text-sm">{value || "Empty option"}</span>
                          {question.answer === key && (
                            <Badge className="bg-green-600 shrink-0">Correct</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Answer Display */}
            {question.answer && (
              <>
                <Separator />
                <div>
                  <Label>Correct Answer</Label>
                  <div className="mt-1 p-3 bg-green-50 rounded-md border border-green-200">
                    <Badge className="bg-green-600">{question.answer}</Badge>
                  </div>
                </div>
              </>
            )}

            {/* Info Message */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Update Question</h4>
              <p className="text-sm text-blue-800">
                This will sync the latest version of this question from the question bank. 
                The question content will be refreshed with any recent changes.
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* FOOTER */}
        <div className="px-6 pb-6">
          <Separator className="mb-4" />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Updating..." : "Update Question"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}