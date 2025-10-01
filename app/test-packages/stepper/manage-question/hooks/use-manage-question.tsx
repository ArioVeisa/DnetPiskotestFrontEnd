"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Question,
  QuestionType,
  listQuestionService,
} from "../service/list-question-service";
import { manageQuestionService } from "../service/manage-question-service";
import {
  updatePackageService,
  UpdateSectionPayload,
} from "../service/update-packages-service";
import { AxiosError } from "axios";

/* ================================================================
 * Utils
 * ================================================================ */
interface AxiosErrorResponse<T = unknown> {
  status: number;
  data: T;
}

const parseQuestionId = (id: number | string): number =>
  typeof id === "string" ? parseInt(id, 10) : id;

const isAxiosError = (error: unknown): error is AxiosError =>
  (error as AxiosError)?.isAxiosError === true;

const handleAxiosError = (
  source: string,
  err: unknown,
  setError: (msg: string | null) => void
): void => {
  console.group(`❌ [${source}] ERROR`);
  if (err instanceof Error) console.error("Error Message:", err.message);

  if (isAxiosError(err)) {
    const resp = err.response as AxiosErrorResponse | undefined;
    if (resp) {
      console.error("Response Status:", resp.status);
      console.error("Response Data:", resp.data);
    }
  }
  console.groupEnd();

  setError(err instanceof Error ? err.message : `Gagal proses di ${source}`);
};

// LocalStorage key builder per section + type
const getDurationKey = (sectionId: number, type: QuestionType) =>
  `section_${sectionId}_${type}_duration`;

/* ================================================================
 * Hook
 * ================================================================ */
export function useManageQuestions(
  selectedType: QuestionType,
  testId: number,
  sectionId: number,
  token: string,
  allSections?: Record<QuestionType, number> // 👈 opsional, kalau parent mau sync banyak section
) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [duration, setDuration] = useState("");

  /* ================================================================
   * Fetch Questions
   * ================================================================ */
  const fetchQuestions = useCallback(async (): Promise<void> => {
    if (!testId || !sectionId) return;
    setLoading(true);
    setError(null);

    try {
      const { questions: qList, duration_minutes } =
        await listQuestionService.getSectionQuestions(
          testId,
          sectionId,
          selectedType
        );

      setQuestions(qList);

      const savedDuration = localStorage.getItem(
        getDurationKey(sectionId, selectedType)
      );
      setDuration(savedDuration ?? duration_minutes?.toString() ?? "");
    } catch (err) {
      handleAxiosError("fetchQuestions", err, setError);
    } finally {
      setLoading(false);
    }
  }, [testId, sectionId, selectedType]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  /* ================================================================
   * CRUD Actions
   * ================================================================ */
  const handleAdd = async (
    questionId: number | string,
    questionType: QuestionType
  ): Promise<void> => {
    if (!testId || !sectionId || !token) return;

    const exists = questions.some(
      (q) => parseQuestionId(q.id) === parseQuestionId(questionId)
    );
    if (exists) {
      setError("Soal sudah ditambahkan");
      return;
    }

    try {
      await manageQuestionService.addQuestion({
        testId,
        sectionId,
        questionId: parseQuestionId(questionId),
        questionType,
        token,
      });
      await fetchQuestions();
    } catch (err) {
      handleAxiosError("handleAdd", err, setError);
    }
  };

  const handleUpdate = async (
    questionId: number | string,
    questionType: QuestionType = selectedType
  ): Promise<void> => {
    if (!testId || !sectionId || !token) return;

    try {
      await manageQuestionService.updateQuestion({
        testId,
        sectionId,
        questionId: parseQuestionId(questionId),
        questionType,
        token,
      });
      await fetchQuestions();
    } catch (err) {
      handleAxiosError("handleUpdate", err, setError);
    }
  };

  const handleDelete = async (questionId: number | string): Promise<void> => {
    if (!testId || !sectionId || !token) return;

    try {
      await manageQuestionService.deleteQuestion({
        testId,
        sectionId,
        questionId: parseQuestionId(questionId),
        token,
      });
      await fetchQuestions();
    } catch (err) {
      handleAxiosError("handleDelete", err, setError);
    }
  };

  /* ================================================================
   * Sync Section (single)
   * ================================================================ */
  const syncSection = async (
    forceType?: QuestionType,
    forceSectionId?: number
  ): Promise<boolean> => {
    if (!testId) return false;

    const targetType: QuestionType = forceType ?? selectedType;
    const targetSectionId: number = forceSectionId ?? sectionId;

    if (!targetSectionId) return false;

    try {
      const storedDuration = localStorage.getItem(
        getDurationKey(targetSectionId, targetType)
      );

      const { questions: qList, duration_minutes } =
        await listQuestionService.getSectionQuestions(
          testId,
          targetSectionId,
          targetType
        );

      const finalDuration =
        storedDuration ?? duration ?? duration_minutes?.toString() ?? "0";

      const payload: UpdateSectionPayload = {
        sectionId: targetSectionId,
        duration_minutes: parseInt(finalDuration, 10),
        question_count: qList.length,
      };

      console.group("🔄 [syncSection] Debug");
      console.log("targetType:", targetType);
      console.log("targetSectionId:", targetSectionId);
      console.log("questionsCount:", qList.length);
      console.log("finalDuration:", finalDuration);
      console.log("payload:", payload);
      console.groupEnd();

      await updatePackageService.updateSection(testId, payload, token);

      localStorage.removeItem(getDurationKey(targetSectionId, targetType));
      setError(null);
      return true;
    } catch (err) {
      handleAxiosError("syncSection", err, setError);
      return false;
    }
  };

  /* ================================================================
   * Sync All Sections (optional)
   * ================================================================ */
  /* ================================================================
   * Sync All Sections (pakai updateAllSections)
   * ================================================================ */
  const syncAllSections = async (): Promise<boolean> => {
    if (!testId || !allSections) return false;

    try {
      const payloads: UpdateSectionPayload[] = [];

      for (const [type, sid] of Object.entries(allSections)) {
        if (!sid) continue;

        const storedDuration = localStorage.getItem(
          getDurationKey(sid, type as QuestionType)
        );

        const { questions: qList, duration_minutes } =
          await listQuestionService.getSectionQuestions(
            testId,
            sid,
            type as QuestionType
          );

        const finalDuration =
          storedDuration ?? duration_minutes?.toString() ?? "0";

        payloads.push({
          sectionId: sid,
          duration_minutes: parseInt(finalDuration, 10),
          question_count: qList.length,
        });

        // bersihin cache lokal biar gak double sync
        localStorage.removeItem(getDurationKey(sid, type as QuestionType));
      }

      console.group("🔄 [syncAllSections] Debug");
      console.log("payloads:", payloads);
      console.groupEnd();

      await updatePackageService.updateAllSections(testId, payloads, token);

      setError(null);
      return true;
    } catch (err) {
      handleAxiosError("syncAllSections", err, setError);
      return false;
    }
  };


  /* ================================================================
   * Handlers
   * ================================================================ */
  const handleDurationChange = (val: string) => {
    setDuration(val);
    localStorage.setItem(getDurationKey(sectionId, selectedType), val);
  };

  const filteredQuestions: Question[] = questions.filter((q) =>
    q.question_text.toLowerCase().includes(search.toLowerCase())
  );

  /* ================================================================
   * Return
   * ================================================================ */
  return {
    questions: filteredQuestions,
    loading,
    error,
    setError,
    search,
    setSearch,

    duration,
    setDuration: handleDurationChange,
    questionCount: questions.length.toString(),

    handleAdd,
    handleUpdate,
    handleDelete,

    syncSection,
    syncAllSections,
    reload: fetchQuestions,
  };
}
