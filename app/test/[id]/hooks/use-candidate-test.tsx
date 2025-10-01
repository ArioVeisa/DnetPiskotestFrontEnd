// src/app/users/[id]/hooks/useCandidate.ts
import { useState } from "react";
import {
  candidateService,
  Candidate,
  TestInfo,
} from "../services/candidate-service";
import quizService from "../services/quiz-service";
import { Question } from "../components/question-card";
import { Test } from "../components/finished-dialog";

export function useCandidateTest(token: string) {
  const [step, setStep] = useState<
    "login" | "reminder" | "quiz" | "finished" | "completed"
  >("login");

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [tests, setTests] = useState<TestInfo[]>([]);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timer, setTimer] = useState<number>(0);

  /**
   * Ambil data kandidat dari token (sekali jalan saat load page).
   */
  const fetchCandidate = async () => {
    if (!token) {
      console.warn("Token belum ada, skip fetchCandidate");
      return;
    }
    const data = await candidateService.fetchCandidateByToken(token);
    if (data) {
      setCandidate(data);
      setTests(data.tests ?? []);
    }
  };

  const verify = () => {
    setStep("reminder");
  };

  /**
   * Validasi input NIK dari user dengan data kandidat.
   */
  const validateNik = (inputNik: string): boolean => {
    return candidateService.validateNik(inputNik, candidate);
  };

  /**
   * Mulai quiz pertama (setelah validasi berhasil).
   */
  const startQuiz = async () => {
    if (tests.length === 0) return;
    const first = tests[0];
    const initTest: Test = {
      ...first,
      index: 0,
      total: tests.length,
    };
    setCurrentTest(initTest);
    setQuestions(await quizService.getQuestions(first.id));
    setTimer(first.duration * 60);
    setStep("quiz");
  };

  const finishTest = () => {
    setStep("finished");
  };

  const nextTest = async () => {
    if (!currentTest) return;
    const nextIndex = currentTest.index + 1;
    if (nextIndex < tests.length) {
      const info = tests[nextIndex];
      const next: Test = {
        ...info,
        index: nextIndex,
        total: tests.length,
      };
      setCurrentTest(next);
      setQuestions(await quizService.getQuestions(next.id));
      setTimer(info.duration * 60);
      setStep("quiz");
    } else {
      setStep("completed");
    }
  };

  const reset = () => {
    setStep("login");
    setCandidate(null);
    setTests([]);
    setCurrentTest(null);
    setQuestions([]);
    setTimer(0);
  };

  return {
    step,
    candidate,
    tests,
    currentTest,
    questions,
    timer,
    fetchCandidate,
    validateNik, // cek input NIK
    verify, // ubah step kalo valid
    startQuiz,
    finishTest,
    nextTest,
    reset,
  };
}
