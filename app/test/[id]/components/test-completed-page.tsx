"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Clock, Calendar } from "lucide-react";

interface TestCompletedPageProps {
  completedAt: string;
  onContactHRD?: () => void;
  onDownloadCertificate?: () => void;
}

export function TestCompletedPage({ 
  completedAt, 
  onContactHRD,
  onDownloadCertificate 
}: TestCompletedPageProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-2xl bg-white shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Test Successfully Completed!
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Thank you for completing the online psychotest
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Completion Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Completion Date:</span>
            </div>
            <p className="text-green-700 font-semibold">
              {formatDate(completedAt)}
            </p>
          </div>

          {/* Result Information */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-3">Result Information:</h3>
            <ul className="space-y-2 text-green-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Your test results have been securely saved</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>HRD team will review results within 1-2 working days</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>You will be contacted for the next stage</span>
              </li>
            </ul>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
            <p className="text-blue-700">
              Please wait for confirmation from our recruitment team. If you have any questions, 
              you can contact HRD via the provided email.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <Button
              onClick={onContactHRD}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Contact HRD
            </Button>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important:</p>
                <p>
                  This test link can only be used once. You cannot access 
                  the same test again using this link.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

