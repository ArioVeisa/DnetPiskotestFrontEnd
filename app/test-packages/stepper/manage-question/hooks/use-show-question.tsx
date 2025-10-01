"use client";

import { useState, useEffect, useCallback } from "react";
import {
  showQuestionService,
  ShowQuestion,
  ShowQuestionType,
} from "../service/show-question-service";

export function useShowQuestions(type: ShowQuestionType, token?: string) {
  const [questions, setQuestions] = useState<ShowQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchQuestions = useCallback(async () => {
    if (!type || !token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await showQuestionService.getByType(type, token);
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal load bank soal");
    } finally {
      setLoading(false);
    }
  }, [type, token]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const filteredQuestions = questions.filter((q) =>
    q.question_text.toLowerCase().includes(search.toLowerCase())
  );

  return {
    questions: filteredQuestions,
    loading,
    error,
    search,
    setSearch,
    refetch: fetchQuestions,
  };
}
