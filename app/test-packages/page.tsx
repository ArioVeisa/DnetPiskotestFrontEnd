"use client";

import { useState, useRef } from "react";
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
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTests } from "./hooks/use-test-package";

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
  const [page, setPage] = useState(1);
  const pageSize = 6;
  
  // Ref untuk menyimpan handler Next dari setiap step
  const step1NextHandlerRef = useRef<(() => void) | null>(null);
  const step2NextHandlerRef = useRef<(() => void) | null>(null);
  
  // State untuk step 1 (CreateNewTest) - untuk validasi button
  const [step1FormValid, setStep1FormValid] = useState(false);
  
  // State untuk step 3 (PublishTestPage)
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishDisabled, setPublishDisabled] = useState(true);

  const { tests } = useTests();
  const totalPages = Math.ceil(tests.length / pageSize);

  const [stepData, setStepData] = useState<StepData>({
    testId: 0,
    testName: "",
    icon: "square-code",
    allowedTypes: ["DISC", "CAAS", "teliti"],
    sections: [],
    token: "",
  });

  const handlePagePrev = () => setPage((p) => Math.max(p - 1, 1));
  const handlePageNext = () => setPage((p) => Math.min(p + 1, totalPages));
  const handlePageChange = (newPage: number) => setPage(newPage);

  /** =====================
   * CREATE MODE
   ===================== */
  function handleAddNewTest() {
    setIsEditMode(false);
    setActiveStep(0);
    setShowStepper(true);
    setStep1FormValid(false); // Reset form validation
  }

  /** =====================
   * EDIT MODE
   ===================== */
  async function handleEditTest(testId: string) {
    try {
      setIsEditMode(true);
      setShowStepper(true);
      setActiveStep(0);
      setStep1FormValid(false); // Reset, akan di-update setelah defaultValues ter-set

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
    setActiveStep((prev) => {
      const nextStep = prev !== null ? prev + 1 : 1;
      // Reset publish state ketika masuk step 3
      if (nextStep === 2) {
        setPublishLoading(false);
        setPublishDisabled(true); // Akan diupdate oleh onPublishStateChange
      }
      // Reset step1FormValid ketika pindah step
      if (nextStep !== 0) {
        setStep1FormValid(false);
      }
      return nextStep;
    });
  }

  function handleBack() {
    if (activeStep === 0 || activeStep === null) {
      setShowStepper(false);
      setActiveStep(null);
      setIsEditMode(false);
      setStep1FormValid(false);
    } else {
      setActiveStep((prev) => {
        const prevStep = prev ? prev - 1 : 0;
        // Reset step1FormValid ketika kembali ke step 1
        if (prevStep === 0) {
          setStep1FormValid(false);
        }
        return prevStep;
      });
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

        <div className="flex flex-col flex-1 relative overflow-hidden">
          <main className="flex-1 px-8 pt-2 overflow-y-auto" style={{ paddingBottom: showStepper ? '100px' : (totalPages > 1 ? '90px' : '20px') }}>
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
                    onBack={handleBack}
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
                    getNextHandler={(handler) => {
                      step1NextHandlerRef.current = handler;
                    }}
                    onFormValidationChange={(isValid) => {
                      setStep1FormValid(isValid);
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
                    hideNavigation={true}
                  />
                )}

                {/* Step 3 */}
                {activeStep === 2 && (
                  <PublishTestPage
                    testId={stepData.testId}
                    testName={stepData.testName}
                    testIcon={stepData.icon}
                    token={stepData.token}
                    onBack={handleBack}
                    hideNavigation={true}
                    onPublishStateChange={(loading: boolean, disabled: boolean) => {
                      setPublishLoading(loading);
                      setPublishDisabled(disabled);
                    }}
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
                <TestTable 
                  onEdit={handleEditTest} 
                  page={page}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </main>

          {/* Fixed Navigation Buttons for Stepper */}
          {showStepper && (
            <div className="fixed bottom-0 left-[260px] right-0 bg-white border-t shadow-lg z-50 px-8 py-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center gap-2 min-w-[100px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                
                <div className="text-sm text-gray-500">
                  Step {((activeStep ?? 0) + 1)} of 3
                </div>

                {activeStep === 0 && (
                  <Button
                    onClick={() => {
                      if (step1NextHandlerRef.current) {
                        step1NextHandlerRef.current();
                      }
                    }}
                    className="flex items-center gap-2 min-w-[100px]"
                    disabled={!step1FormValid || step1NextHandlerRef.current === null}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
                {activeStep === 1 && (
                  <Button
                    onClick={() => {
                      // Trigger Next dari ManageQuestions component
                      const manageQuestionsNext = document.querySelector('[data-manage-questions-next]') as HTMLButtonElement;
                      if (manageQuestionsNext && !manageQuestionsNext.disabled) {
                        manageQuestionsNext.click();
                      }
                    }}
                    className="flex items-center gap-2 min-w-[100px]"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
                {activeStep === 2 && (
                  <Button
                    onClick={() => {
                      // Trigger Save Package dari PublishTestPage component
                      const publishButton = document.querySelector('[data-publish-package]') as HTMLButtonElement;
                      if (publishButton && !publishButton.disabled) {
                        publishButton.click();
                      }
                    }}
                    className="flex items-center gap-2 min-w-[140px]"
                    disabled={publishLoading || publishDisabled}
                  >
                    {publishLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Save Package
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Fixed Pagination */}
          {!showStepper && totalPages > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40 px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 mx-auto md:mx-0">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={handlePagePrev}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <Button
                      key={num}
                      size="sm"
                      variant={page === num ? "default" : "outline"}
                      onClick={() => handlePageChange(num)}
                      className={cn(
                        "w-8 h-8",
                        page === num && "bg-blue-500 hover:bg-blue-600 text-white"
                      )}
                    >
                      {num}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={handlePageNext}
                    className="flex items-center gap-1"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="hidden md:block">
                  Showing <span className="font-semibold">{page}</span> of{" "}
                  <span className="font-semibold">{totalPages}</span> Pages
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
