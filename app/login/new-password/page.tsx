import LogoDWP from "../components/logo-dwp";
import NewPasswordForm from "./components/new-password-form";
import AsideIllustration from "../components/illustration-aside";
import { Suspense } from "react";

export default function NewPasswordPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Section */}
      <div className="flex flex-col items-center sm:items-start px-8 py-8 sm:px-20">
        <LogoDWP />
        <Suspense fallback={<div>Loading...</div>}>
          <NewPasswordForm />
        </Suspense>
      </div>
      {/* Right Section */}
      <div className="hidden md:flex flex-col justify-center bg-primary text-white px-20 py-20">
        <AsideIllustration />
      </div>
    </div>
  );
}
