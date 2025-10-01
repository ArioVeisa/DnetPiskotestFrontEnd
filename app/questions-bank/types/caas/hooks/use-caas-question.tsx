"use client";

import { useEffect, useState } from "react";
import {
  fetchQuestions,
  fetchQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type Question,
} from "../services/caas-question-service";

export function useCaasQuestions() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // === READ ALL ===
  async function refresh() {
    setLoading(true);
    try {
      console.log("[useCaasQuestions] refresh() called");
      const data = await fetchQuestions();
      console.log("[useCaasQuestions] refresh success:", data);
      setItems(data);
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
      console.log("[useCaasQuestions] openFor success:", q);
      setItems([q]);
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
      console.log("[useCaasQuestions] addOne success:", newQ);
      setItems((prev) => [...prev, newQ]);
    } catch (err) {
      console.error("[useCaasQuestions] addOne error:", err);
    }
  }

  // === EDIT ===
  // bagian useCaasQuestions hook
  async function editOne(id: string, payload: Partial<Question>) {
    setLoading(true);
    try {
      console.log("[useCaasQuestions] editOne() payload:", id, payload);
      const updated = await updateQuestion(id, payload);
      setItems((prev) => prev.map((q) => (q.id === id ? updated : q)));
      console.log("[useCaasQuestions] editOne() success:", updated);
      return updated;
    } catch (err) {
      console.error("[useCaasQuestions] editOne error:", err);
      throw err; // bubble up agar caller bisa handle
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
  function done() {
    console.log("[useCaasQuestions] done() called, closing…");
    setOpen(false);
    setActiveId(null);
    setItems([]);
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
    done, // ✅ tambahin in
  };
}
