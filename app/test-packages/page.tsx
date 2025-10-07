"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/TopBar";
import TitleBar from "./components/title-bar";
import TestTable from "./components/package-table";
import { StepperCreate } from "./components/stepper";
import CreateNewTest from "./stepper/create-package/create-package";
import ManageQuestions from "./stepper/manage-question/manage-question";
import PublishTestPage from "./stepper/review-packages/review-package";
import { IconKey } from "@/lib/icon-mapping";
import { QuestionType } from "./stepper/manage-question/service/manage-question-service";
import {
  createPackageService,
  CreateTestStep1Payload,
} from "./stepper/create-package/service/create-package-service";

type StepData = {
  testId: number;
  testName: string;
  icon: IconKey;
  targetPosition: string;
  allowedTypes: QuestionType[];
  sections: { section_id: number; section_type: QuestionType }[]; // ✅ pakai sections
  token: string;
};

function toSectionIds(
  sections: { section_id: number; section_type: QuestionType }[]
): Record<QuestionType, number> {
  return sections.reduce((acc, s) => {
    acc[s.section_type] = s.section_id;
    return acc;
  }, {} as Record<QuestionType, number>);
}

export default function TestManagementPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [showStepper, setShowStepper] = useState(false);

  const [stepData, setStepData] = useState<StepData>({
    testId: 0,
    testName: "",
    icon: "square-code",
    targetPosition: "",
    allowedTypes: ["DISC", "CAAS", "teliti"],
    sections: [], // ✅ default kosong
    token: "",
  });

  function handleAddNewTest() {
    setActiveStep(0);
    setShowStepper(true);
  }

  function handleNext() {
    setActiveStep((prev) => (prev !== null ? prev + 1 : 1));
  }

  function handleBack() {
    if (activeStep === 0 || activeStep === null) {
      setShowStepper(false);
      setActiveStep(null);
    } else {
      setActiveStep((prev) => (prev ? prev - 1 : 0));
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 bg-white">
        {/* ✅ Jadikan Topbar sticky */}
        <div className="sticky top-0 z-50 bg-white shadow-sm">
          <Topbar />
        </div>

        <main className="flex-1 px-8 pt-2 pb-20 overflow-y-auto">
          {showStepper ? (
            <>
              <StepperCreate activeStep={activeStep ?? 0} />

              {/* Step 1 */}
              {activeStep === 0 && (
                <CreateNewTest
                  onNext={async (data) => {
                    try {
                      const payload: CreateTestStep1Payload = {
                        icon: data.icon,
                        name: data.testName,
                        targetPosition: data.targetPosition,
                        types: data.selectedTypes.map((t, idx) => ({
                          type: t,
                          sequence: idx + 1,
                        })),
                      };

                      const { test: newTest, raw } =
                        await createPackageService.createNewTestStep1(payload);

                      setStepData({
                        testId: Number(newTest.id),
                        testName: newTest.name,
                        icon: data.icon,
                        targetPosition: data.targetPosition,
                        allowedTypes: data.selectedTypes as QuestionType[],
                        sections: (raw?.sections ?? []).map((s) => ({
                          section_id: s.id,
                          section_type: s.section_type as QuestionType,
                        })),
                        token: localStorage.getItem("token") || "",
                      });

                      handleNext();
                    } catch (err) {
                      console.error("Create test step1 failed:", err);
                    }
                  }}
                />
              )}

              {/* Step 2 */}
              {activeStep === 1 && (
                <ManageQuestions
                  testId={stepData.testId}
                  testName={stepData.testName}
                  testIcon={stepData.icon}
                  targetPosition={stepData.targetPosition}
                  allowedTypes={stepData.allowedTypes}
                  sectionIds={toSectionIds(stepData.sections)}
                  token={stepData.token}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {/* Step 3 */}
              {activeStep === 2 && (
                <PublishTestPage
                  testId={stepData.testId}
                  testName={stepData.testName}
                  testIcon={stepData.icon}
                  targetPosition={stepData.targetPosition}
                  onBack={handleBack}
                  onPublishSuccess={() => {
                    setShowStepper(false);
                    setActiveStep(null);
                    setStepData({
                      testId: 0,
                      testName: "",
                      icon: "square-code",
                      targetPosition: "",
                      allowedTypes: ["DISC", "CAAS", "teliti"],
                      sections: [],
                      token: "",
                    });
                  }}
                />
              )}
            </>
          ) : (
            <>
              <TitleBar onAddTest={handleAddNewTest} />
              <TestTable />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
