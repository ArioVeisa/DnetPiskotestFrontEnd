"use client";

import { useEffect, useState } from "react";
import { useShowQuestions } from "./use-show-question";
import { useManageQuestions } from "./use-manage-question";
import type { QuestionType } from "../service/manage-question-service";

export function useStep2Form(
  selectedType: QuestionType,
  sectionId: number
) {
  // =========================
  // Load testId & token dari localStorage (hasil Step 1)
  // =========================
  const [testId, setTestId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedTest = localStorage.getItem("test_package");
      if (savedTest) {
        const parsed = JSON.parse(savedTest);
        setTestId(parsed.test_id || null);
      }

      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
      }
    } catch (err) {
      console.error("❌ Gagal parsing localStorage:", err);
    }
  }, []);

  // =========================
  // Hooks bawaan
  // =========================
  const showQuestions = useShowQuestions(selectedType, token || undefined);

  const manageQuestions = useManageQuestions(
    selectedType,
    testId ?? 0,
    sectionId,
    token || ""
  );

  // =========================
  // Return gabungan
  // =========================
  return {
    testId,
    token,
    // bank soal
    showQuestions,
    // soal yg dipilih
    manageQuestions,
  };
}
