"use client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail } from "lucide-react";

interface CompletionCardProps {
  onContact: () => void;
  testId: string;
  date: string;
}

export function CompletionDialog({
  onContact,
  testId,
  date,
}: CompletionCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2 py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow p-8 md:p-10 mx-auto flex flex-col items-center">
        {/* ICON DAN JUDUL */}
        <div className="bg-green-100 rounded-full p-5 mb-5 flex items-center justify-center">
          <CheckCircle className="w-14 h-14 text-green-500" />
        </div>
        <div className="text-2xl font-bold text-green-600 mb-1 text-center">
          Test Successfully Completed!
        </div>
        <div className="text-gray-500 text-base mb-6 text-center">
          Thank you for completing the online psychotest
        </div>

        {/* INFORMASI HASIL */}
        <div className="bg-green-50 rounded-lg w-full px-5 py-4 mb-4 border border-green-100">
          <div className="font-semibold text-green-700 mb-1">Result Information</div>
          <ul className="text-sm text-green-800 space-y-1 list-disc pl-4">
            <li>Your test results have been securely saved</li>
            <li>HRD team will review results within 1-2 working days</li>
            <li>You will be contacted for the next stage</li>
          </ul>
        </div>

        {/* LANGKAH SELANJUTNYA */}
        <div className="bg-blue-50 rounded-lg w-full px-5 py-4 mb-6 border border-blue-100">
          <div className="font-semibold text-blue-500 mb-1">Next Steps</div>
          <div className="text-sm text-blue-900">
            Please wait for confirmation from our recruitment team. If you have any questions, you can contact HRD via the provided email.
          </div>
        </div>

        {/* BUTTON */}
        <div className="flex justify-center w-full mb-5">
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 font-semibold"
            onClick={onContact}
          >
            <span className="inline-flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact HRD
            </span>
          </Button>
        </div>

        {/* FOOTER */}
        <div className="text-center text-xs text-gray-400 mt-2 w-full">
          Test ID: {testId} <br />
          Date: {date}
        </div>
      </div>
    </div>
  );
}
