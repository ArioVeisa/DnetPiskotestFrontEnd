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
import { useCandidateTest } from "../hooks/use-candidate-test";
import { useParams } from "next/navigation";

export default function CandidateTestPage() {
  const { id: token } = useParams<{ id: string }>();
  console.log("Token:", token); // harus UUID

  const {
    step,
    candidate,
    tests,
    currentTest,
    currentSection,
    questions,
    timer,
    completedAt,
    verify,
    startQuiz,
    startSectionQuiz,
    finishSection,
    nextTest,
    validateNik,
    fetchCandidate, // ambil dari hook
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
    alert("Hubungi HRD diklik. (Ganti dengan aksi asli)");
  }
  function handleDownload() {
    alert("Unduh Sertifikat diklik. (Ganti dengan aksi asli)");
  }

  const lastTest = tests[tests.length - 1];
  const testId = lastTest ? lastTest.id : "-";
  const dateObj = new Date();
  const dateStr = dateObj.toLocaleString("id-ID", {
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

      {step === "login" && (
        <VerificationDialog
          candidate={candidate}
          validateNik={validateNik}
          onSuccess={verify}
        />
      )}

      {step === "test-completed" && (
        <TestCompletedPage
          completedAt={completedAt}
          onContactHRD={handleContactHRD}
          onDownloadCertificate={handleDownload}
        />
      )}

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
          onExpire={nextTest}
        />
      )}

      {step === "finished" && currentTest && (
        <FinishedDialog
          test={currentTest}
          onNext={nextTest}
          isLast={!tests[currentTest.index + 1]}
        />
      )}

      {step === "completed" && (
        <CompletionDialog
          onContact={handleContactHRD}
          onDownload={handleDownload}
          testId={testId}
          date={dateStr}
        />
      )}
    </>
  );
}
