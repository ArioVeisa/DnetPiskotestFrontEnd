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
    "login" | "reminder" | "section-announcement" | "quiz" | "finished" | "completed" | "test-completed"
  >("login");

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [tests, setTests] = useState<TestInfo[]>([]);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [currentSection, setCurrentSection] = useState<any>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timer, setTimer] = useState<number>(0);
  const [completedAt, setCompletedAt] = useState<string>("");

  /**
   * Ambil data kandidat dari token (sekali jalan saat load page).
   */
  const fetchCandidate = async () => {
    if (!token) {
      console.warn("Token belum ada, skip fetchCandidate");
      return;
    }
    
    try {
      const data = await candidateService.fetchCandidateByToken(token);
      if (data) {
        setCandidate(data);
        setTests(data.tests ?? []);
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('TEST_COMPLETED:')) {
        const completedDate = error.message.replace('TEST_COMPLETED:', '');
        setCompletedAt(completedDate);
        setStep("test-completed");
      } else {
        console.error("Error fetching candidate:", error);
        // Handle other errors as needed
      }
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
    if (tests.length === 0 || !token) return;
    const first = tests[0];
    const initTest: Test = {
      ...first,
      index: 0,
      total: tests.length,
    };
    setCurrentTest(initTest);
    
    // Mulai dari section pertama
    if (first.sections && first.sections.length > 0) {
      setCurrentSectionIndex(0);
      setCurrentSection(first.sections[0]);
      setStep("section-announcement");
    } else {
      // Fallback ke logic lama jika tidak ada sections
      setQuestions(await quizService.getQuestions(token));
      setTimer(first.duration * 60);
      setStep("quiz");
    }
  };

  /**
   * Mulai quiz untuk section yang sedang aktif.
   */
  const startSectionQuiz = async () => {
    if (!currentSection || !token) return;
    
    // Map questions dari section ini langsung
    setQuestions(currentSection.questions.map((q: any) => ({
      text: q.question_detail?.question_text || `Question ${q.question_id}`,
      options: q.question_detail?.options?.map((opt: any) => opt.option_text) || ["Option A", "Option B", "Option C", "Option D"]
    })));
    
    setTimer(currentSection.duration_minutes * 60);
    setStep("quiz");
  };

  /**
   * Selesaikan section dan pindah ke section berikutnya atau selesai.
   */
  const finishSection = () => {
    if (!currentTest || !currentTest.sections) {
      setStep("finished");
      return;
    }

    const nextSectionIndex = currentSectionIndex + 1;
    
    if (nextSectionIndex < currentTest.sections.length) {
      // Ada section berikutnya
      setCurrentSectionIndex(nextSectionIndex);
      setCurrentSection(currentTest.sections[nextSectionIndex]);
      setStep("section-announcement");
    } else {
      // Semua section selesai
      setStep("finished");
    }
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
    currentSection,
    currentSectionIndex,
    questions,
    timer,
    completedAt,
    fetchCandidate,
    validateNik, // cek input NIK
    verify, // ubah step kalo valid
    startQuiz,
    startSectionQuiz, // mulai quiz untuk section aktif
    finishSection, // selesaikan section dan pindah ke berikutnya
    finishTest,
    nextTest,
    reset,
  };
}
