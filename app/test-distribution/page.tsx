"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/TopBar";
import TitleBar from "./components/title-bar";
import DistributionTable from "./components/session-table";
import { StepperCreate } from "./components/stepper";
import { useTestDistributions } from "./hooks/use-test-distribution";

// Stepper Steps
import AddPackageStep from "./stepper/add-packages/add-packages";
import CandidatesDistributions from "./stepper/candidate-distribution/candidate-distribution";

// Provider state global antar step
import { MakeSessionProvider } from "./hooks/use-make-session";

export default function TestDistributionPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [showStepper, setShowStepper] = useState(false);

  // ✅ simpan id paket di state utama
  const [packageId, setPackageId] = useState<number | null>(null);
  
  // Hook untuk mengelola data distributions
  const { distributions, loading, error, create, update, remove, refresh } = useTestDistributions();

  // mulai bikin session baru
  function handleCreate() {
    // Clear localStorage untuk distribusi baru
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('session_start_') || key.startsWith('session_end_') || key.startsWith('sent_all_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    setShowStepper(true);
    setActiveStep(0);
  }

  // next step
  function handleNext() {
    setActiveStep((prev) => (prev !== null ? prev + 1 : 1));
  }

  // back step
  function handleBack() {
    if (activeStep === 0) {
      setShowStepper(false);
      setActiveStep(null);
      setPackageId(null); // reset kalau cancel
    } else {
      setActiveStep((prev) => (prev ? prev - 1 : 0));
    }
  }

  // handle finish setelah send all
  function handleFinish() {
    setShowStepper(false);
    setActiveStep(null);
    setPackageId(null);
    // Refresh data untuk menampilkan test yang baru dibuat
    refresh();
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 bg-white">
        <Topbar />
        <main className="flex-1 px-8">
          {showStepper ? (
            <MakeSessionProvider>
              {/* Stepper progress indicator */}
              <StepperCreate activeStep={activeStep ?? 0} />

              {/* STEP 1: pilih paket */}
              {activeStep === 0 && (
                <AddPackageStep
                  onNext={(id: number) => {
                    setPackageId(id); // ✅ simpan id dari step 1
                    handleNext();
                  }}
                  onCancel={handleBack}
                />
              )}

              {/* STEP 2 */}
              {activeStep === 1 && packageId !== null && (
                <CandidatesDistributions
                  onBack={handleBack}
                  onNext={handleFinish}
                  testPackageId={packageId}
                />
              )}
            </MakeSessionProvider>
          ) : (
            <>
              {/* Default tampilan sebelum klik "Add New Test" */}
              <TitleBar onAddTest={handleCreate} />
              <DistributionTable />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
