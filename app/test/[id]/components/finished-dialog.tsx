"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

/* ==============================
   TYPE DEFINITIONS
============================== */
export interface TestSection {
  id: string;
  title: string;
  questionCount: number;
}

export interface Test {
  id: string;
  name: string;
  questionCount: number;
  duration: number;
  index: number;
  total: number;
  sections?: TestSection[];
}

interface FinishedDialogProps {
  test: Test;
  onNext: () => void;
  isLast: boolean;
}

/* ==============================
   COMPONENT
============================== */
export function FinishedDialog({
  test,
  onNext,
  isLast,
}: FinishedDialogProps) {
  return (
    <Dialog open>
      <DialogContent className="max-w-md flex flex-col items-center py-10 px-6">
        {/* Aksesibilitas */}
        <DialogTitle className="sr-only">
          {isLast ? "All Tests Completed" : `${test.name} Completed`}
        </DialogTitle>

        {/* Icon centang hijau */}
        <div className="bg-green-100 rounded-full p-4 mb-4 flex items-center justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>

        {/* Judul besar */}
        <div className="text-2xl font-bold text-green-600 mb-2">
          {isLast ? "All Tests Completed" : `${test.name} Completed`}
        </div>

        {/* Deskripsi */}
        <div className="text-gray-500 mb-6 text-center">
          {isLast
            ? "Terima kasih telah menyelesaikan semua test. Silakan hubungi HR untuk informasi lebih lanjut."
            : "Thank you for completing this test!"}
        </div>

        {/* Tombol */}
        {!isLast ? (
          <Button
            onClick={onNext}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-base font-medium py-2 rounded-lg"
          >
            Next Test
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-base font-medium py-2 rounded-lg"
          >
            Finished
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
