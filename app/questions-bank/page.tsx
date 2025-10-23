"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { TitleBar } from "./components/title-bar";
import BankQuestionContent from "./components/bank-question-content";
import type { TestType, QuestionBank as GlobalBank } from "./services/bank-question-service";

// Import CRUD per type
import DiscCrud from "./types/disc/disc-question";
import CaasCrud from "./types/caas/caas-question";
import FastAccuracyCrud from "./types/fast/teliti-question";

// Import tipe QuestionBank dari tiap service
import type { QuestionBank as DiscBank } from "./types/disc/services/disc-question-service";
import type { QuestionBank as CaasBank } from "./types/caas/services/caas-question-service";
import type { QuestionBank as FastBank } from "./types/fast/services/teliti-question-service";

// Union type untuk state
type AnyQuestionBank = DiscBank | CaasBank | FastBank;

export default function QuestionBankPage() {
  const [activeBank, setActiveBank] = useState<AnyQuestionBank | null>(null);

  // Receive global bank from BankQuestionContent, cast to union
  const handleStart = (bank: GlobalBank) => {
    setActiveBank(bank as AnyQuestionBank);
  };

  const handleCancel = () => {
    setActiveBank(null); // Return to bank list
  };

  const handleSave = () => {
    if (activeBank) {
      // console.log("Saved bank:", activeBank); // Debug logging removed
    }
    setActiveBank(null); // After save return to list
  };

  const renderCrud = (type: TestType) => {
    switch (type) {
      case "DISC":
        return (
          <DiscCrud
            bank={activeBank as DiscBank}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        );
      case "CAAS":
        return (
          <CaasCrud
            bank={activeBank as CaasBank}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        );
      case "Fast Accuracy":
        return (
          <FastAccuracyCrud
            bank={activeBank as FastBank}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        );
      default:
        return (
          <div className="p-6 text-sm text-red-500">
            Unknown test type: {type}
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col bg-white">
        <TopBar />
        <main className="flex-1 px-8 pt-2 pb-16">
          {/* Bank List */}
          {!activeBank && (
            <>
              <TitleBar />
              <BankQuestionContent onStartAddQuestions={handleStart} />
            </>
          )}

          {/* CRUD per type */}
          {activeBank && renderCrud(activeBank.testType)}
        </main>
      </div>
    </div>
  );
}
