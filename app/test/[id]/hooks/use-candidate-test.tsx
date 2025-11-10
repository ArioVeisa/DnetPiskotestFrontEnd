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
  // Cache untuk menyimpan semua jawaban dari semua test
  const [allTestsAnswers, setAllTestsAnswers] = useState<Record<string, Record<number, unknown>>>({});
  // Cache untuk menyimpan data questions dengan question_detail untuk submit
  const [questionsCache, setQuestionsCache] = useState<Record<string, Record<number, BackendQuestion>>>({});
  const [error, setError] = useState<string | null>(null);
  const [sessionTimeError, setSessionTimeError] = useState<{
    show: boolean;
    startDate?: string;
    endDate?: string;
  }>({ show: false });

  /**
   * Validasi waktu session - cek apakah waktu saat ini dalam range start_date dan end_date
   */
  const validateSessionTime = (startDate?: string, endDate?: string): boolean => {
    if (!startDate && !endDate) {
      // Jika tidak ada waktu session yang di-set, izinkan akses
      return true;
    }

    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Cek apakah waktu saat ini sebelum start date
    if (start && now < start) {
      setSessionTimeError({
        show: true,
        startDate,
        endDate,
      });
      return false;
    }

    // Cek apakah waktu saat ini setelah end date
    if (end && now > end) {
      setSessionTimeError({
        show: true,
        startDate,
        endDate,
      });
      return false;
    }

    return true;
  };

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
        // Validasi waktu session sebelum set candidate
        if (!validateSessionTime(data.startDate, data.endDate)) {
          // SessionTimeErrorDialog akan ditampilkan oleh component
          return;
        }

        setCandidate(data);
        setTests(data.tests ?? []);
        
        // Cache questions dengan question_detail untuk submit nanti
        if (data.tests && data.tests.length > 0) {
          const questionsCacheMap: Record<string, Record<number, BackendQuestion>> = {};
          data.tests.forEach(test => {
            if (test.sections) {
              const testQuestions: Record<number, BackendQuestion> = {};
              test.sections.forEach(section => {
                const sectionQuestions = section.test_questions || section.questions || [];
                sectionQuestions.forEach((q: BackendQuestion) => {
                  if (q.id) {
                    testQuestions[q.id] = q;
                  }
                });
              });
              questionsCacheMap[test.id] = testQuestions;
            }
          });
          setQuestionsCache(questionsCacheMap);
        }
      }
    } catch (error) {
      // console.log("🔍 Error in fetchCandidate:", error); // Debug logging removed
      if (error instanceof Error && error.message.startsWith("TEST_COMPLETED:")) {
        const completedDate = error.message.replace("TEST_COMPLETED:", "");
        // console.log("🔍 Setting test-completed step with date:", completedDate); // Debug logging removed
        setCompletedAt(completedDate);
        setStep("test-completed");
      } else if (error instanceof Error && error.message.startsWith("SESSION_TIME_ERROR:")) {
        // Handle session time validation error from backend
        const parts = error.message.split(":");
        if (parts.length >= 4) {
          const startDate = parts[1] || undefined;
          const endDate = parts[2] || undefined;
          const message = parts.slice(3).join(":"); // Handle message that might contain colons
          
          setSessionTimeError({
            show: true,
            startDate,
            endDate,
          });
        } else {
          // Fallback to frontend validation
          setError("Test session time validation failed");
        }
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

    // Cache questions dengan question_detail untuk submit nanti
    if (currentTest) {
      setQuestionsCache(prev => {
        const testQuestions = prev[currentTest.id] || {};
        questionsData.forEach((q: BackendQuestion) => {
          if (q.id) {
            testQuestions[q.id] = q;
          }
        });
        return {
          ...prev,
          [currentTest.id]: testQuestions
        };
      });
    }

    setQuestions(mappedQuestions);
    setTimer(currentSection.duration_minutes * 60);
    setStep("quiz");
  };

  /**
   * Simpan jawaban untuk section yang sedang aktif (hanya di-cache, tidak submit)
   */
  const saveAnswers = (answers: Record<number, unknown>) => {
    setAllAnswers(prev => ({ ...prev, ...answers }));
    
    // Simpan jawaban ke cache per test
    if (currentTest) {
      setAllTestsAnswers(prev => {
        const testAnswers = prev[currentTest.id] || {};
        const updated = { ...testAnswers, ...answers };
        return {
          ...prev,
          [currentTest.id]: updated
        };
      });
    }
  };

  /**
   * Submit semua jawaban dari semua test ke backend (hanya dipanggil sekali di akhir)
   */
  const submitAllAnswers = async () => {
    if (!token) {
      return;
    }

    try {
      const allSubmitAnswers: SubmitAnswer[] = [];

      // Loop melalui semua test dan kumpulkan jawaban dari cache
      for (const testInfo of tests) {
        const testAnswers = allTestsAnswers[testInfo.id] || {};
        const testQuestionsCache = questionsCache[testInfo.id] || {};

        if (!testInfo.sections) {
          continue;
        }

        // Loop through all sections and their questions
        testInfo.sections.forEach(section => {
          const sectionQuestions = section.test_questions || section.questions || [];
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sectionQuestions.forEach((question: any) => {
            const answerKey = question.id;
            const answer = testAnswers[answerKey];
            const cachedQuestion = testQuestionsCache[answerKey] || question;
            
            if (answer) {
              const submitAnswer: SubmitAnswer = {
                section_id: section.section_id,
                question_id: question.id
              };

              // Handle different question types
              if (section.section_type.toLowerCase() === 'disc') {
                if (answer && typeof answer === 'object' && 'most' in answer && 'least' in answer) {
                  const questionDetail = cachedQuestion.question_detail;
                  if (questionDetail?.options) {
                    const mostOption = questionDetail.options.find((opt) => String(opt.id) === String(answer.most));
                    const leastOption = questionDetail.options.find((opt) => String(opt.id) === String(answer.least));
                    
                    if (mostOption && leastOption) {
                      submitAnswer.most_option_id = mostOption.id;
                      submitAnswer.least_option_id = leastOption.id;
                      allSubmitAnswers.push(submitAnswer);
                    }
                  }
                }
              } else {
                if (typeof answer === 'string') {
                  const questionDetail = cachedQuestion.question_detail;
                  if (questionDetail?.options) {
                    const selectedOption = questionDetail.options.find((opt) => String(opt.id) === String(answer));
                    
                    if (selectedOption) {
                      submitAnswer.selected_option_id = selectedOption.id;
                      allSubmitAnswers.push(submitAnswer);
                    }
                  }
                }
              }
            }
          });
        });
      }
      
      if (allSubmitAnswers.length > 0) {
        const response = await quizService.submitTest(token, allSubmitAnswers);
        return response;
      } else {
        throw new Error("Tidak ada jawaban yang valid untuk disubmit.");
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Selesaikan section dan pindah ke section berikutnya atau selesai.
   * @param answers - Jawaban yang akan disimpan
   * @param skipToNextTest - Jika true, hanya simpan answers tanpa mengubah step (untuk timer expiration)
   */
  const finishSection = async (answers?: Record<number, unknown>, skipToNextTest: boolean = false) => {
    if (answers) {
      saveAnswers(answers);
    }

    // Jika skipToNextTest = true (timer habis), hanya simpan answers, tidak ubah step
    // step akan diubah oleh nextTest
    if (skipToNextTest) {
      return;
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
   * Pindah ke section berikutnya dalam test yang sama, atau ke test berikutnya jika tidak ada section lagi
   * Dipanggil ketika waktu habis untuk langsung skip tanpa melalui finished dialog
   */
  const skipToNextSectionOrTest = async () => {
    if (!currentTest) {
      // Jika tidak ada currentTest, tampilkan finished dialog untuk submit
      setStep("finished");
      return;
    }

    // Tidak perlu submit di sini - jawaban sudah di-cache
    // Submit hanya akan dilakukan sekali di akhir ketika semua test selesai

    // Cari test info yang sesuai dengan currentTest
    const currentTestInfo = tests.find(t => t.id === currentTest.id);
    
    if (!currentTestInfo) {
      // Jika test info tidak ditemukan, tampilkan finished dialog untuk submit
      setStep("finished");
      return;
    }

    // PRIORITAS 1: Cek apakah masih ada section berikutnya dalam test yang sama
    if (currentTestInfo.sections && currentTestInfo.sections.length > 0) {
      const nextSectionIndex = currentSectionIndex + 1;
      
      if (nextSectionIndex < currentTestInfo.sections.length) {
        // Masih ada section berikutnya dalam test yang sama - skip ke section berikutnya
        const nextSection = currentTestInfo.sections[nextSectionIndex];
        if (nextSection) {
          // Update state untuk section berikutnya
          setCurrentSectionIndex(nextSectionIndex);
          setCurrentSection(nextSection);
          setAllAnswers({}); // Reset answers untuk section baru
          setStep("section-announcement");
          return; // STOP - sudah skip ke section berikutnya
        }
      }
    }

    // PRIORITAS 2: Tidak ada section berikutnya - cek apakah ada test berikutnya
    const nextTestIndex = currentTest.index + 1;
    
    if (nextTestIndex < tests.length && tests[nextTestIndex]) {
      // Ada test berikutnya - skip ke test berikutnya
      const nextTestInfo = tests[nextTestIndex];
      
      // Buat Test object untuk test berikutnya
      const nextTest: Test = {
        id: nextTestInfo.id,
        name: nextTestInfo.name,
        questionCount: nextTestInfo.questionCount,
        duration: nextTestInfo.duration,
        index: nextTestIndex,
        total: tests.length,
        sections: nextTestInfo.sections?.map((s) => ({
          id: String(s.section_id),
          title: s.section_type,
          questionCount: s.question_count,
        })),
      };

      // Update state untuk test berikutnya
      setCurrentTest(nextTest);
      setCurrentSectionIndex(0);
      setAllAnswers({}); // Reset answers untuk test baru
      
      // Mulai test berikutnya
      if (nextTestInfo.sections && nextTestInfo.sections.length > 0 && nextTestInfo.sections[0]) {
        // Test punya sections - mulai dari section pertama
        setCurrentSection(nextTestInfo.sections[0]);
        setStep("section-announcement");
      } else {
        // Test tanpa sections - fetch questions dan langsung ke quiz
        try {
          // Re-fetch candidate data untuk mendapatkan test berikutnya
          const candidateData = await candidateService.fetchCandidateByToken(token);
          if (candidateData && candidateData.tests && candidateData.tests.length > nextTestIndex) {
            const updatedTestInfo = candidateData.tests[nextTestIndex];
            if (updatedTestInfo && updatedTestInfo.sections && updatedTestInfo.sections.length > 0) {
              // Test punya sections setelah di-fetch
              setCurrentSection(updatedTestInfo.sections[0]);
              setStep("section-announcement");
            } else {
              // Test tanpa sections - fetch questions
              const questionsFromService = await quizService.getQuestions(token);
              setQuestions(questionsFromService);
              setTimer(nextTestInfo.duration * 60);
              setStep("quiz");
            }
          } else {
            // Tidak ada test berikutnya di data yang di-fetch
            // Tampilkan finished dialog dengan button "Finished" untuk submit
            setStep("finished");
          }
        } catch (error) {
          // Jika error fetch, coba langsung ke quiz dengan data yang ada
          try {
            const questionsFromService = await quizService.getQuestions(token);
            setQuestions(questionsFromService);
            setTimer(nextTestInfo.duration * 60);
            setStep("quiz");
          } catch (quizError) {
            // Jika masih error, tampilkan finished dialog untuk submit
            setStep("finished");
          }
        }
      }
    } else {
      // Tidak ada test berikutnya - semua test sudah selesai
      // Tampilkan finished dialog dengan button "Finished" untuk submit
      setStep("finished");
    }
  };

  /**
   * Pindah ke test berikutnya atau submit semua answers jika sudah selesai
   * Dipanggil ketika user selesai manual (bukan dari timer)
   */
  const nextTest = async (fromTimer: boolean = false) => {
    // Jika dari timer, gunakan skipToNextSectionOrTest untuk langsung skip
    if (fromTimer) {
      await skipToNextSectionOrTest();
      return;
    }

    // Jika bukan dari timer, gunakan logika normal (bisa melalui finished dialog)
    if (!currentTest) {
      // Tampilkan finished dialog untuk submit
      setStep("finished");
      return;
    }

    // Tidak submit di sini - jawaban sudah di-cache
    // Submit hanya akan dilakukan sekali di akhir ketika semua test selesai

    // Cek section berikutnya dalam test yang sama
    const currentTestInfo = tests.find(t => t.id === currentTest.id);
    if (currentTestInfo?.sections && currentTestInfo.sections.length > 0) {
      const nextSectionIndex = currentSectionIndex + 1;
      if (nextSectionIndex < currentTestInfo.sections.length) {
        // Masih ada section berikutnya
        const nextSection = currentTestInfo.sections[nextSectionIndex];
        if (nextSection) {
          setCurrentSectionIndex(nextSectionIndex);
          setCurrentSection(nextSection);
          setStep("section-announcement");
          return;
        }
      }
    }

    // Tidak ada section lagi - pindah ke test berikutnya
    const nextIndex = currentTest.index + 1;
    if (nextIndex < tests.length) {
      // Ada test berikutnya - tampilkan finished dialog dulu
      setStep("finished");
    } else {
      // Tidak ada test berikutnya - semua test selesai
      // Tampilkan finished dialog dengan button "Finished" untuk submit
      // Jangan submit langsung, tunggu user klik button "Finished"
      setStep("finished");
    }
  };

  /**
   * Submit semua jawaban dan set completed (dipanggil dari FinishedDialog ketika isLast=true)
   */
  const handleFinalSubmit = async () => {
    try {
      await submitAllAnswers();
      // Setelah submit berhasil, update completedAt
      setCompletedAt(new Date().toISOString());
      setStep("completed");
    } catch (error) {
      // Handle different error types
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // If test is already completed, treat it as success
      if (errorMessage.includes("already completed") || errorMessage.includes("sudah disubmit")) {
        setCompletedAt(new Date().toISOString());
        setStep("completed");
        return;
      }
      
      // For validation errors, show specific message but still complete
      if (errorMessage.includes("Validation") || errorMessage.includes("validasi")) {
        console.error("Validation error on submit:", errorMessage);
        // Still complete the test - answers might have been saved partially
        setCompletedAt(new Date().toISOString());
        setStep("completed");
        return;
      }
      
      // For other errors, log but don't show alert - test might have been submitted
      // Show completed screen anyway since answers were cached
      console.error("Error submitting test:", errorMessage);
      setCompletedAt(new Date().toISOString());
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
    setAllAnswers({});
    setAllTestsAnswers({});
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
    sessionTimeError,
    setSessionTimeError,
    fetchCandidate,
    validateNik,
    verify,
    startQuiz,
    startSectionQuiz,
    finishSection,
    finishTest,
    nextTest,
    handleFinalSubmit,
    saveAnswers,
    submitAllAnswers,
    reset,
  };
}
