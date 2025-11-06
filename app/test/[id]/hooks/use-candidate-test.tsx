import { useState } from "react";
import {
  candidateService,
  Candidate,
  TestInfo,
  TestSection,
  BackendQuestion,
} from "../services/candidate-service";
import quizService, { SubmitAnswer } from "../services/quiz-service";
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
  const [allAnswers, setAllAnswers] = useState<Record<number, unknown>>({});
  const [error, setError] = useState<string | null>(null);

  /**
   * Ambil data kandidat dari token (sekali jalan saat load page).
   */
  const fetchCandidate = async () => {
    if (!token) {
      // console.warn("Token belum ada, skip fetchCandidate"); // Debug logging removed
      return;
    }

    try {
      const data = await candidateService.fetchCandidateByToken(token);
      if (data) {
        setCandidate(data);
        setTests(data.tests ?? []);
      }
    } catch (error) {
      // console.log("🔍 Error in fetchCandidate:", error); // Debug logging removed
      if (error instanceof Error && error.message.startsWith("TEST_COMPLETED:")) {
        const completedDate = error.message.replace("TEST_COMPLETED:", "");
        // console.log("🔍 Setting test-completed step with date:", completedDate); // Debug logging removed
        setCompletedAt(completedDate);
        setStep("test-completed");
      } else {
        // Handle other errors (token invalid, expired, etc.)
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat mengambil data test";
        setError(errorMessage);
        // console.error("Error fetching candidate:", error); // Debug logging removed
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
      const questionsFromService = await quizService.getQuestions(token);
      setQuestions(questionsFromService);
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
    
    // console.log("🔍 Raw questions data:", questionsData); // Debug logging removed
    // console.log("🔍 First question detail:", questionsData[0]?.question_detail); // Debug logging removed
    
    const mappedQuestions: Question[] = questionsData.map(
      (q: BackendQuestion) => {
        const questionText = q.question_detail?.question_text || `Question ${q.question_id}`;
        const questionType = q.question_type || 'CAAS';
        
        // Handle DISC format khusus
        if (questionType === 'DISC' && q.question_detail?.options) {
          // console.log("🔍 DISC question detail in hook:", q.question_detail); // Debug logging removed
          // console.log("🔍 DISC options in hook:", q.question_detail.options); // Debug logging removed
          // console.log("🔍 Question type:", q.question_type); // Debug logging removed
          
          const discOptions = q.question_detail.options.map(opt => ({
            id: opt.id?.toString() || Math.random().toString(),
            text: opt.option_text,
            dimensionMost: opt.dimension_most || '*',
            dimensionLeast: opt.dimension_least || '*'
          }));
          
          // console.log("🔍 Mapped DISC options in hook:", discOptions); // Debug logging removed
          
          return {
            id: q.id, // Add the test_question id
            text: questionText,
            options: discOptions.map(opt => opt.text),
            questionType: 'DISC',
            discOptions: discOptions
          };
        }
        
        // Format biasa untuk CAAS/teliti
        const options = q.question_detail?.options?.map(opt => opt.option_text) || [
          "Option A",
          "Option B",
          "Option C",
          "Option D",
        ];
        const optionIds = q.question_detail?.options?.map(opt => String(opt.id)) || [];
        
        return {
          id: q.id, // Add the test_question id
          text: questionText,
          options: options,
          optionIds: optionIds,
          questionType: questionType
        };
      }
    );

    // console.log("🔍 Section questions data:", questionsData); // Debug logging removed
    // console.log("🔍 Mapped questions:", mappedQuestions); // Debug logging removed
    // console.log("🔍 Current section:", currentSection); // Debug logging removed

    setQuestions(mappedQuestions);
    setTimer(currentSection.duration_minutes * 60);
    setStep("quiz");
  };

  /**
   * Simpan jawaban untuk section yang sedang aktif
   */
  const saveAnswers = (answers: Record<number, unknown>) => {
    setAllAnswers(prev => ({ ...prev, ...answers }));
  };

  /**
   * Submit semua jawaban ke backend
   */
  const submitAllAnswers = async () => {
    if (!currentTest || !token) return;

    try {
      const currentTestInfo = tests.find(t => t.id === currentTest.id);
      if (!currentTestInfo?.sections) return;

      // console.log("🔍 All answers state:", allAnswers); // Debug logging removed
      // console.log("🔍 Current test info:", currentTestInfo); // Debug logging removed
      // console.log("🔍 Test sections:", currentTestInfo.sections); // Debug logging removed

      const submitAnswers: SubmitAnswer[] = [];

      // Loop through all sections and their questions
      currentTestInfo.sections.forEach(section => {
        // console.log("🔍 Processing section:", section); // Debug logging removed
        const sectionQuestions = section.test_questions || section.questions || [];
        // console.log("🔍 Array questions in section:", sectionQuestions); // Debug logging removed
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sectionQuestions.forEach((question: any) => {
          // console.log("🔍 Processing question:", question); // Debug logging removed
          const answerKey = question.id; // Use test_question id as key
          const answer = allAnswers[answerKey];
          // console.log("🔍 Answer key:", answerKey, "Answer:", answer); // Debug logging removed
          
          if (answer) {
            const submitAnswer: SubmitAnswer = {
              section_id: section.section_id,
              question_id: question.id // Kirim test_question.id untuk konsistensi dengan backend
            };

            // Handle different question types
            if (section.section_type.toLowerCase() === 'disc') {
              // For DISC questions, we need most_option_id and least_option_id
              if (answer && typeof answer === 'object' && 'most' in answer && 'least' in answer) {
                // Find the option IDs from the question detail
                const questionDetail = question.question_detail;
                if (questionDetail?.options) {
                  const mostOption = questionDetail.options.find((opt: Record<string, unknown>) => String(opt.id) === answer.most);
                  const leastOption = questionDetail.options.find((opt: Record<string, unknown>) => String(opt.id) === answer.least);
                  
                  if (mostOption && leastOption) {
                    submitAnswer.most_option_id = mostOption.id;
                    submitAnswer.least_option_id = leastOption.id;
                    submitAnswers.push(submitAnswer);
                    // console.log("✅ Added DISC answer:", submitAnswer); // Debug logging removed
                  } else {
                    // console.log("❌ DISC option not found:", { mostOption, leastOption }); // Debug logging removed
                  }
                } else {
                  // console.log("❌ No options in question detail:", questionDetail); // Debug logging removed
                }
              } else {
                // console.log("❌ DISC answer missing most/least:", answer); // Debug logging removed
              }
            } else {
              // For CAAS and Teliti questions, we need selected_option_id
              if (typeof answer === 'string') {
                const questionDetail = question.question_detail;
                if (questionDetail?.options) {
                  const selectedOption = questionDetail.options.find((opt: Record<string, unknown>) => String(opt.id) === answer);
                  if (selectedOption) {
                    submitAnswer.selected_option_id = selectedOption.id;
                    submitAnswers.push(submitAnswer);
                    // console.log("✅ Added CAAS/Teliti answer:", submitAnswer); // Debug logging removed
                  } else {
                    // console.log("❌ Selected option not found:", { answer, options: questionDetail.options }); // Debug logging removed
                  }
                } else {
                  // console.log("❌ No options in question detail:", questionDetail); // Debug logging removed
                }
              } else {
                // console.log("❌ Non-string answer for CAAS/Teliti:", answer); // Debug logging removed
              }
            }
          } else {
            // console.log("❌ No answer found for question:", answerKey); // Debug logging removed
          }
        });
      });

      // console.log("🔍 Final submit answers:", submitAnswers); // Debug logging removed
      // console.log("🔍 Submit answers length:", submitAnswers.length); // Debug logging removed
      
      if (submitAnswers.length > 0) {
        const response = await quizService.submitTest(token, submitAnswers);
        // console.log("✅ Test submitted successfully:", response); // Debug logging removed
        return response;
      } else {
        // console.log("❌ No valid answers to submit. All answers:", allAnswers); // Debug logging removed
        throw new Error("Tidak ada jawaban yang valid untuk disubmit. Silakan pastikan semua soal sudah dijawab.");
      }
    } catch (error) {
      // console.error("❌ Error submitting test:", error); // Debug logging removed
      throw error;
    }
  };

  /**
   * Selesaikan section dan pindah ke section berikutnya atau selesai.
   */
  const finishSection = async (answers?: Record<number, unknown>) => {
    if (answers) {
      saveAnswers(answers);
    }

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
   * Pindah ke test berikutnya atau submit semua answers jika sudah selesai
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
        const questionsFromService = await quizService.getQuestions(token);
        setQuestions(questionsFromService);
        setTimer(nextTestInfo.duration * 60);
        setStep("quiz");
      }
    } else {
      // Semua test selesai, submit semua answers
      try {
        await submitAllAnswers();
        setStep("completed");
      } catch (error) {
        // console.error("❌ Error submitting test:", error); // Debug logging removed
        // Continue to completed step even if there's an error (test might already be submitted)
        setStep("completed");
      }
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
    allAnswers,
    error,
    fetchCandidate,
    validateNik,
    verify,
    startQuiz,
    startSectionQuiz,
    finishSection,
    finishTest,
    nextTest,
    saveAnswers,
    submitAllAnswers,
    reset,
  };
}
