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
  updatePackageService,
} from "./stepper/create-package/service/create-package-service";
import { testPackageService } from "./services/test-package-service";

type SectionData = {
  section_id: number;
  section_type: QuestionType;
  duration_minutes: number;
  question_count: number;
  sequence: number;
};

type StepData = {
  testId: number;
  testName: string;
  icon: IconKey;
  allowedTypes: QuestionType[];
  sections: SectionData[];
  token: string;
};

function toSectionIds(sections: SectionData[]): Record<QuestionType, number> {
  return sections.reduce((acc, s) => {
    acc[s.section_type] = s.section_id;
    return acc;
  }, {} as Record<QuestionType, number>);
}

export default function TestManagementPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [showStepper, setShowStepper] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [stepData, setStepData] = useState<StepData>({
    testId: 0,
    testName: "",
    icon: "square-code",
    allowedTypes: ["DISC", "CAAS", "teliti"],
    sections: [],
    token: "",
  });

  /** =====================
   * CREATE MODE
   ===================== */
  function handleAddNewTest() {
    setIsEditMode(false);
    setActiveStep(0);
    setShowStepper(true);
  }

  /** =====================
   * EDIT MODE
   ===================== */
  async function handleEditTest(testId: string) {
    try {
      setIsEditMode(true);
      setShowStepper(true);
      setActiveStep(0);

      const test = await testPackageService.fetchById(String(testId));

      setStepData({
        testId: Number(test.id),
        testName: test.name,
        icon: (test.icon_path as IconKey) ?? "square-code",
        allowedTypes: test.types as QuestionType[],
        sections: (test.sections ?? []).map((s) => ({
          section_id: s.id,
          section_type: s.section_type as QuestionType,
          duration_minutes: s.duration_minutes ?? 0,
          question_count: s.question_count ?? 0,
          sequence: s.sequence ?? 0,
        })),
        token: localStorage.getItem("token") || "",
      });
    } catch (err) {
      console.error("Gagal load data edit:", err);
      setShowStepper(false);
    }
  }

  /** =====================
   * NAVIGATION
   ===================== */
  function handleNext() {
    setActiveStep((prev) => (prev !== null ? prev + 1 : 1));
  }

  function handleBack() {
    if (activeStep === 0 || activeStep === null) {
      setShowStepper(false);
      setActiveStep(null);
      setIsEditMode(false);
    } else {
      setActiveStep((prev) => (prev ? prev - 1 : 0));
    }
  }

  /** =====================
   * RENDER
   ===================== */
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 bg-white">
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
                  isEditMode={isEditMode}
                  defaultValues={
                    isEditMode
                      ? {
                          icon: stepData.icon,
                          testName: stepData.testName,
                          selectedTypes: stepData.allowedTypes,
                        }
                      : undefined
                  }
                  onNext={async (data) => {
                    try {
                      const payloadTypes = data.selectedTypes.map((t, idx) => ({
                        type: t,
                        sequence: idx + 1,
                      }));

                      if (isEditMode) {
                        // Selalu pakai updateTestStructure
                        await updatePackageService.updateTestStructure(
                          stepData.testId,
                          {
                            name: data.testName,
                            icon_path: data.icon,
                            types: payloadTypes,
                            existingSections: stepData.sections.map((s) => ({
                              id: s.section_id,
                              section_type: s.section_type,
                              duration_minutes: s.duration_minutes,
                              question_count: s.question_count,
                              sequence: s.sequence,
                            })),
                          }
                        );

                        // Fetch data terbaru
                        const updated = await testPackageService.fetchById(
                          String(stepData.testId)
                        );

                        setStepData({
                          testId: Number(updated.id),
                          testName: updated.name,
                          icon: (updated.icon_path as IconKey) ?? data.icon,
                          allowedTypes: updated.types as QuestionType[],
                          sections: (updated.sections ?? []).map((s) => ({
                            section_id: s.id,
                            section_type: s.section_type as QuestionType,
                            duration_minutes: s.duration_minutes,
                            question_count: s.question_count,
                            sequence: s.sequence,
                          })),
                          token: localStorage.getItem("token") || "",
                        });

                        handleNext();
                        return;
                      }

                      // 🆕 Create Mode
                      const payload: CreateTestStep1Payload = {
                        icon_path: data.icon,
                        name: data.testName,
                        types: payloadTypes,
                      };

                      const { test: newTest, raw } =
                        await createPackageService.createNewTestStep1(payload);

                      setStepData({
                        testId: Number(newTest.id),
                        testName: newTest.name,
                        icon: data.icon,
                        allowedTypes: data.selectedTypes as QuestionType[],
                        sections: (raw?.sections ?? []).map((s) => ({
                          section_id: s.id,
                          section_type: s.section_type as QuestionType,
                          duration_minutes: s.duration_minutes,
                          question_count: s.question_count,
                          sequence: s.sequence,
                        })),
                        token: localStorage.getItem("token") || "",
                      });

                      handleNext();
                    } catch (err) {
                      console.error("Gagal create/update test:", err);
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
                  onBack={handleBack}
                  onPublishSuccess={() => {
                    setShowStepper(false);
                    setActiveStep(null);
                    setStepData({
                      testId: 0,
                      testName: "",
                      icon: "graduation-cap",
                      allowedTypes: ["DISC", "CAAS", "teliti"],
                      sections: [],
                      token: "",
                    });
                    setIsEditMode(false);
                  }}
                />
              )}
            </>
          ) : (
            <>
              <TitleBar onAddTest={handleAddNewTest} />
              <TestTable onEdit={handleEditTest} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
