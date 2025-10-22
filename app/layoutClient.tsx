"use client";

// import SessionExpiredDialog from "../public/dialog-alert"; // ❌ DISABLED

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* ❌ DISABLED: Dialog session expired yang mengganggu */}
      {/* <SessionExpiredDialog autoRedirectMs={5000} /> */}
    </>
  );
}
