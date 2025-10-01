import LogoDWP from "../components/logo-dwp";
import ResetEmailForm from "./components/reset-email-form";
import AsideIllustration from "../components/illustration-aside";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Section */}
      <div className="flex flex-col items-center sm:items-start px-8 py-8 sm:px-20">
        <LogoDWP />
        <div className="flex-1 flex flex-col justify-center w-full max-w-md">
          <ResetEmailForm />
        </div>
      </div>
      {/* Right Section */}
      <div className="hidden md:flex flex-col justify-center bg-primary text-white px-20 py-20">
        <AsideIllustration />
      </div>
    </div>
  );
}
