"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { TitleBar } from "./components/title-bar";
import BankQuestionContent from "./components/bank-question-content";
import type { QuestionBank } from "./services/bank-question-service";

// Import CRUD per type
import DiscCrud from "./types/disc/disc-question";
import CaasCrud from "./types/caas/caas-question";
import FastAccuracyCrud from "./types/fast/teliti-question";

export default function QuestionBankPage() {
  const [activeBank, setActiveBank] = useState<QuestionBank | null>(null);

  const handleStart = (bank: QuestionBank) => {
    setActiveBank(bank);
  };

  const handleCancel = () => {
    setActiveBank(null); // balik ke list bank
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col bg-white">
        <TopBar />
        <main className="flex-1 px-8 pt-2 pb-8">
          {/* List Bank */}
          {!activeBank && (
            <>
              <TitleBar />
              <BankQuestionContent onStartAddQuestions={handleStart} />
            </>
          )}

          {/* CRUD per type */}
          {activeBank?.testType === "DISC" && (
            <DiscCrud bank={activeBank} onCancel={handleCancel} />
          )}
          {activeBank?.testType === "CAAS" && (
            <CaasCrud bank={activeBank} onCancel={handleCancel} />
          )}
          {activeBank?.testType === "Fast Accuracy" && (
            <FastAccuracyCrud bank={activeBank} onCancel={handleCancel} />
          )}

          {/* Optional fallback */}
          {activeBank &&
            !["DISC", "CAAS", "Fast Accuracy"].includes(activeBank.testType) && (
              <div className="p-6 text-sm text-red-500">
                Unknown test type: {activeBank.testType}
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
