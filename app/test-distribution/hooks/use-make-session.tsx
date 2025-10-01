"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";

export type SessionStatus = "Draft" | "Scheduled" | "Ongoing" | "Completed";

type MakeSessionContextType = {
  // STEP 1
  packageId: number | null;
  setPackageId: (v: number | null) => void; // ✅ konsisten number
  testName: string;
  setTestName: (v: string) => void;

  // STEP 2
  sessionStart: Date | null;
  setSessionStart: (d: Date | null) => void;
  sessionEnd: Date | null;
  setSessionEnd: (d: Date | null) => void;
  sentAll: boolean;
  setSentAll: (b: boolean) => void;
  candidatesTotal: number;
  setCandidatesTotal: (n: number) => void;

  // status global
  status: SessionStatus;
  setStatus: (s: SessionStatus) => void;

  // helpers
  markAsSentAll: () => void;
  reset: () => void;
};

const MakeSessionContext = createContext<MakeSessionContextType | null>(null);

export function MakeSessionProvider({ children }: { children: ReactNode }) {
  // STEP 1
  const [packageId, setPackageId] = useState<number | null>(null); // ✅ number
  const [testName, setTestName] = useState<string>("");

  // STEP 2
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [sessionEnd, setSessionEnd] = useState<Date | null>(null);
  const [sentAll, setSentAll] = useState(false);
  const [candidatesTotal, setCandidatesTotal] = useState(0);

  // status
  const [status, setStatus] = useState<SessionStatus>("Draft");

  function markAsSentAll() {
    setSentAll(true);
    setStatus("Ongoing");
  }

  function reset() {
    setPackageId(null);
    setTestName("");
    setSessionStart(null);
    setSessionEnd(null);
    setSentAll(false);
    setCandidatesTotal(0);
    setStatus("Draft");
  }

  const value = useMemo(
    () => ({
      packageId,
      setPackageId,
      testName,
      setTestName,

      sessionStart,
      setSessionStart,
      sessionEnd,
      setSessionEnd,
      sentAll,
      setSentAll,
      candidatesTotal,
      setCandidatesTotal,

      status,
      setStatus,

      markAsSentAll,
      reset,
    }),
    [
      packageId,
      testName,
      sessionStart,
      sessionEnd,
      sentAll,
      candidatesTotal,
      status,
    ]
  );

  return (
    <MakeSessionContext.Provider value={value}>
      {children}
    </MakeSessionContext.Provider>
  );
}

export function useMakeSession() {
  const ctx = useContext(MakeSessionContext);
  if (!ctx) throw new Error("useMakeSession harus di-wrap MakeSessionProvider");
  return ctx;
}
