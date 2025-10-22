import { useState } from "react";
import {
  candidateService,
  Candidate,
  TestInfo,
  TestSection,
  BackendQuestion,
} from "../services/candidate-service";
import quizService from "../services/quiz-service";
import { Question } from "../components/question-card";
import { Test } from "../components/finished-dialog";

/**
 * Hook utama untuk mengelola alur tes kandidat (login → reminder → quiz → selesai)
 */
export function useCandidateTest(token: string) {
  const [step, setStep] = useState<
    | "login"
    | "reminder"
    | "section-announcement"
    | "quiz"
    | "finished"
    | "completed"
    | "test-completed"
  >("login");

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [tests, setTests] = useState<TestInfo[]>([]);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [currentSection, setCurrentSection] = useState<TestSection | null>(null);
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
      if (error instanceof Error && error.message.startsWith("TEST_COMPLETED:")) {
        const completedDate = error.message.replace("TEST_COMPLETED:", "");
        setCompletedAt(completedDate);
        setStep("test-completed");
      } else {
        console.error("Error fetching candidate:", error);
      }
    }
  };

  /**
   * Verifikasi kandidat setelah input NIK valid
   */
  const verify = () => setStep("reminder");

  /**
   * Validasi input NIK dari user dengan data kandidat.
   */
  const validateNik = (inputNik: string): boolean =>
    candidateService.validateNik(inputNik, candidate);

  /**
   * Mulai quiz pertama (setelah validasi berhasil).
   */
  const startQuiz = async () => {
    if (tests.length === 0 || !token) return;

    const firstTest = tests[0];
    const initTest: Test = {
      id: firstTest.id,
      name: firstTest.name,
      questionCount: firstTest.questionCount,
      duration: firstTest.duration,
      index: 0,
      total: tests.length,
      sections: firstTest.sections?.map((s) => ({
        id: String(s.section_id),
        title: s.section_type,
        questionCount: s.question_count,
      })),
    };

    setCurrentTest(initTest);

    // Kalau test punya sections
    if (firstTest.sections && firstTest.sections.length > 0) {
      setCurrentSectionIndex(0);
      setCurrentSection(firstTest.sections[0]);
      setStep("section-announcement");
    } else {
      // Tanpa sections — fallback ke quiz langsung
      setQuestions(await quizService.getQuestions(token));
      setTimer(firstTest.duration * 60);
      setStep("quiz");
    }
  };

  /**
   * Mulai quiz untuk section yang sedang aktif.
   */
  const startSectionQuiz = async () => {
    if (!currentSection) return;

    // Use test_questions instead of questions (based on backend response)
    const questionsData = currentSection.test_questions || currentSection.questions || [];
    
    const mappedQuestions: Question[] = questionsData.map(
      (q: BackendQuestion) => ({
        text: q.question_detail?.question_text || `Question ${q.question_id}`,
        options:
          q.question_detail?.options?.map((opt) => opt.option_text) || [
            "Option A",
            "Option B",
            "Option C",
            "Option D",
          ],
      })
    );

    console.log("🔍 Section questions data:", questionsData);
    console.log("🔍 Mapped questions:", mappedQuestions);

    setQuestions(mappedQuestions);
    setTimer(currentSection.duration_minutes * 60);
    setStep("quiz");
  };

  /**
   * Selesaikan section dan pindah ke section berikutnya atau selesai.
   */
  const finishSection = () => {
    if (!currentTest) {
      setStep("finished");
      return;
    }

    // Cari test info yang sesuai dengan currentTest
    const currentTestInfo = tests.find(t => t.id === currentTest.id);
    
    if (!currentTestInfo?.sections || currentTestInfo.sections.length === 0) {
      setStep("finished");
      return;
    }

    const nextSectionIndex = currentSectionIndex + 1;
    if (nextSectionIndex < currentTestInfo.sections.length) {
      const nextSection = currentTestInfo.sections[nextSectionIndex];
      if (nextSection) {
        setCurrentSectionIndex(nextSectionIndex);
        setCurrentSection(nextSection);
        setStep("section-announcement");
      }
    } else {
      // Semua section dalam test ini sudah selesai
      setStep("finished");
    }
  };

  /**
   * Tandai test sudah selesai
   */
  const finishTest = () => setStep("finished");

  /**
   * Pindah ke test berikutnya
   */
  const nextTest = async () => {
    if (!currentTest) return;

    const nextIndex = currentTest.index + 1;
    if (nextIndex < tests.length) {
      const nextTestInfo = tests[nextIndex];
      const nextTest: Test = {
        id: nextTestInfo.id,
        name: nextTestInfo.name,
        questionCount: nextTestInfo.questionCount,
        duration: nextTestInfo.duration,
        index: nextIndex,
        total: tests.length,
        sections: nextTestInfo.sections?.map((s) => ({
          id: String(s.section_id),
          title: s.section_type,
          questionCount: s.question_count,
        })),
      };

      setCurrentTest(nextTest);
      
      // Kalau test punya sections, mulai dari section pertama
      if (nextTestInfo.sections && nextTestInfo.sections.length > 0) {
        setCurrentSectionIndex(0);
        setCurrentSection(nextTestInfo.sections[0]);
        setStep("section-announcement");
      } else {
        // Tanpa sections — fallback ke quiz langsung
        setQuestions(await quizService.getQuestions(token));
        setTimer(nextTestInfo.duration * 60);
        setStep("quiz");
      }
    } else {
      setStep("completed");
    }
  };

  /**
   * Reset semua state ke kondisi awal
   */
  const reset = () => {
    setStep("login");
    setCandidate(null);
    setTests([]);
    setCurrentTest(null);
    setCurrentSection(null);
    setQuestions([]);
    setTimer(0);
    setCompletedAt("");
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
    validateNik,
    verify,
    startQuiz,
    startSectionQuiz,
    finishSection,
    finishTest,
    nextTest,
    reset,
  };
}
