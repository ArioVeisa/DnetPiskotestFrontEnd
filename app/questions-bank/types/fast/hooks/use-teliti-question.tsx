"use client";

import { useEffect, useState } from "react";
import {
  fetchQuestions,
  fetchQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type Question,
} from "../services/teliti-question-service";

// 🔹 ExtendedQuestion biar UI gampang akses A & B
export type ExtendedQuestion = Question & {
  itemA?: string;
  itemB?: string;
};

// 🔹 Normalisasi khusus untuk Fast Accuracy
function normalizeExtended(q: Question): ExtendedQuestion {
  console.log("[normalizeExtended] raw:", q);

  if (q.text.includes("|")) {
    const [itemA, itemB] = q.text.split("|").map((s) => s.trim());
    console.log("[normalizeExtended] parsed itemA:", itemA, "itemB:", itemB);

    return { ...q, itemA, itemB };
  }

  return { ...q };
}

export function useCaasQuestions() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ExtendedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // === READ ALL ===
  async function refresh() {
    setLoading(true);
    try {
      console.log("[useCaasQuestions] refresh() called");
      const data = await fetchQuestions();
      console.log("[useCaasQuestions] refresh success raw:", data);
      const normalized = data.map(normalizeExtended);
      console.log("[useCaasQuestions] refresh normalized:", normalized);
      setItems(normalized);
    } catch (err) {
      console.error("[useCaasQuestions] refresh error:", err);
    } finally {
      setLoading(false);
    }
  }

  // === OPEN DETAIL ===
  async function openFor(id: string) {
    setLoading(true);
    try {
      console.log("[useCaasQuestions] openFor() called with id:", id);
      const q = await fetchQuestionById(id);
      console.log("[useCaasQuestions] openFor success raw:", q);
      const normalized = normalizeExtended(q);
      console.log("[useCaasQuestions] openFor normalized:", normalized);
      setItems([normalized]);
      setActiveId(id);
      setOpen(true);
    } catch (err) {
      console.error("[useCaasQuestions] openFor error:", err);
    } finally {
      setLoading(false);
    }
  }

  // === CLOSE ===
  function close() {
    console.log("[useCaasQuestions] close() called");
    setOpen(false);
    setItems([]);
    setActiveId(null);
  }

  // === ADD ===
  async function addOne(payload: Omit<Question, "id">) {
    try {
      console.log("[useCaasQuestions] addOne() payload:", payload);
      const newQ = await createQuestion(payload);
      console.log("[useCaasQuestions] addOne success raw:", newQ);
      const normalized = normalizeExtended(newQ);
      console.log("[useCaasQuestions] addOne normalized:", normalized);
      setItems((prev) => [...prev, normalized]);
    } catch (err) {
      console.error("[useCaasQuestions] addOne error:", err);
    }
  }

  // === EDIT ===
  async function editOne(id: string, payload: Partial<Question>) {
    setLoading(true);
    try {
      console.log("[useCaasQuestions] editOne() payload:", id, payload);
      const updated = await updateQuestion(id, payload);
      console.log("[useCaasQuestions] editOne success raw:", updated);
      const normalized = normalizeExtended(updated);
      console.log("[useCaasQuestions] editOne normalized:", normalized);
      setItems((prev) => prev.map((q) => (q.id === id ? normalized : q)));
      return normalized;
    } catch (err) {
      console.error("[useCaasQuestions] editOne error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // === DELETE ===
  async function remove(id: string) {
    try {
      console.log("[useCaasQuestions] remove() id:", id);
      await deleteQuestion(id);
      console.log("[useCaasQuestions] remove success");
      setItems((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error("[useCaasQuestions] remove error:", err);
    }
  }

  // Save Halaman
  async function done() {
    console.log("[useCaasQuestions] done() called, closing and refreshing…");
    setOpen(false);
    setActiveId(null);

    // Tunggu refresh selesai
    await refresh();
  }

  // Load semua pertanyaan pertama kali
  useEffect(() => {
    refresh();
  }, []);

  return {
    open,
    items,
    loading,
    activeId,
    openFor,
    close,
    addOne,
    editOne,
    remove,
    refresh,
    done,
  };
}
