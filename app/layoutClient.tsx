"use client";

import SessionExpiredDialog from "../public/dialog-alert";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* ✅ Komponen dialog universal */}
      <SessionExpiredDialog autoRedirectMs={5000} />
    </>
  );
}
