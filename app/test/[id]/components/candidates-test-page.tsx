// src/app/users/[id]/components/CandidateTestPage.tsx
"use client";
import React, { useEffect } from "react";
import { VerificationDialog } from "./verification-dialog";
import { ReminderPage } from "./reminder-page";
import { SectionAnnouncement } from "./section-announcement";
import { QuizPage } from "./quiz-page";
import { FinishedDialog } from "./finished-dialog";
import { CompletionDialog } from "./completion-dialog";
import { TestCompletedPage } from "./test-completed-page";
import { TopBarTest } from "./top-bar";
import { SessionTimeErrorDialog } from "./session-time-error-dialog";
import { useCandidateTest } from "../hooks/use-candidate-test";
import { useParams } from "next/navigation";

export default function CandidateTestPage() {
  const { id: token } = useParams<{ id: string }>();
  // console.log("Token:", token); // Debug logging removed for production

  const {
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
    verify,
    startQuiz,
    startSectionQuiz,
    finishSection,
    nextTest,
    handleFinalSubmit,
    validateNik,
    fetchCandidate, // ambil dari hook
    saveAnswers,
    submitAllAnswers,
  } = useCandidateTest(token);

  // 🔑 panggil sekali ketika halaman dibuka
  useEffect(() => {
    if (token) {
      fetchCandidate();
    }
    // ⛔ jangan masukin fetchCandidate ke dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function handleContactHRD() {
    alert("Contact HRD clicked. (Replace with actual action)");
  }

  const lastTest = tests[tests.length - 1];
  const testId = lastTest ? lastTest.id : "-";
  const dateObj = new Date();
  const dateStr = dateObj.toLocaleString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });

  const showTopBar =
    step !== "login" && candidate && (currentTest || step === "completed");

  // Prevent component stacking: only show one component at a time
  // Priority: SessionTimeError > Error > VerificationDialog > Other steps
  const showSessionTimeError = sessionTimeError.show;
  const showError = error && !showSessionTimeError;
  const showVerification = step === "login" && !showError && !showSessionTimeError && candidate;

  return (
    <>
      {showTopBar && candidate && (
        <TopBarTest
          testTitle={currentTest?.name || tests[0]?.name || "-"}
          testType={candidate.position}
          candidateName={candidate.name}
          candidateRole="Candidate"
        />
      )}

      {/* Session Time Error Dialog - Highest Priority */}
      {showSessionTimeError && (
        <SessionTimeErrorDialog
          open={sessionTimeError.show}
          startDate={sessionTimeError.startDate}
          endDate={sessionTimeError.endDate}
          onClose={() => setSessionTimeError({ show: false })}
        />
      )}

      {/* Error Message - Show only if no session time error */}
      {showError && (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {error && (error.includes("TEST_COMPLETED") || error.includes("already")) ? "You Have Already Taken This Test" : "Test Cannot Be Accessed"}
            </h2>
            <p className="text-gray-600 mb-6">
              {error && (error.includes("TEST_COMPLETED") || error.includes("already"))
                ? "You have already completed this test. Each test can only be taken once. Please contact HR for more information."
                : "There was an issue accessing your test. Please contact HR for assistance."}
            </p>
            {!(error && (error.includes("TEST_COMPLETED") || error.includes("already"))) && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Possible causes:
                </p>
                <ul className="text-sm text-gray-500 text-left space-y-1">
                  <li>• Test has already been completed</li>
                  <li>• Test link has expired</li>
                  <li>• Test token is invalid</li>
                </ul>
              </div>
            )}
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Verification Dialog - Show only if no error and step is login */}
      {showVerification && (
        <VerificationDialog
          candidate={candidate}
          validateNik={validateNik}
          onSuccess={verify}
        />
      )}

      {step === "test-completed" && !showError && !showSessionTimeError && (
        <TestCompletedPage
          completedAt={completedAt}
          onContactHRD={handleContactHRD}
        />
      )}

      {/* Only show other steps if no error and no session time error */}
      {!showError && !showSessionTimeError && (
        <>
          {step === "reminder" && candidate && (
            <ReminderPage candidate={candidate} tests={tests} onStart={startQuiz} />
          )}

          {step === "section-announcement" && currentSection && (
            <SectionAnnouncement
              sectionType={currentSection.section_type}
              duration={currentSection.duration_minutes}
              questionCount={currentSection.question_count}
              onStart={startSectionQuiz}
            />
          )}

          {step === "quiz" && currentTest && (
            <QuizPage
              questions={questions}
              test={currentTest}
              timer={timer}
              onFinish={finishSection}
              onExpire={() => nextTest(true)}
            />
          )}

          {step === "finished" && currentTest && (
            <FinishedDialog
              test={currentTest}
              onNext={!tests[currentTest.index + 1] ? handleFinalSubmit : nextTest}
              isLast={!tests[currentTest.index + 1]}
            />
          )}

          {step === "completed" && (
            <CompletionDialog
              onContact={handleContactHRD}
              testId={testId}
              date={dateStr}
            />
          )}
        </>
      )}
    </>
  );
}
