"use client";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const steps = [
  { title: "Details & Types", subtitle: "Define Package & Tests" },
  { title: "Manage Questions", subtitle: "Questions & Duration" },
  { title: "Review & Creates", subtitle: "Review & Confirm Detail" },
];

export const StepperCreate = ({ activeStep }: { activeStep: number }) => {
  return (
    <div className={cn("bg-background pb-4 px-2 md:px-0 w-full")}>
      {/* Breadcrumb */}
      <div className="flex items-center mb-6 gap-2 text-gray-400 text-xs md:text-sm font-medium pt-4 md:pt-6">
        <span>Test Management</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-semibold">
          {steps[activeStep]?.title === "Details & Types"
            ? "Create New Test"
            : steps[activeStep]?.title}
        </span>
      </div>

      {/* Stepper */}
      <div className="flex items-center w-full overflow-x-auto">
        {steps.map((s, idx) => (
          <div key={s.title} className="flex items-center flex-1 relative">
            {/* Step number circle / check */}
            <div
              className={cn(
                "flex items-center justify-center rounded-full border-2 font-bold shrink-0 transition z-10",
                "w-7 h-7 md:w-9 md:h-9 text-base",
                idx < activeStep
                  ? "border-blue-500 bg-blue-500 text-white"
                  : idx === activeStep
                  ? "border-blue-500 bg-blue-50 text-blue-500"
                  : "border-gray-200 bg-gray-100 text-gray-400"
              )}
            >
              {idx < activeStep ? (
                <Check className="w-5 h-5" />
              ) : (
                idx + 1
              )}
            </div>

            {/* Title + Subtitle */}
            <div className="hidden md:flex flex-col ml-2 leading-tight">
              <span
                className={cn(
                  "font-semibold text-[15px] transition whitespace-nowrap",
                  activeStep >= idx ? "text-blue-500" : "text-gray-400"
                )}
              >
                {s.title}
              </span>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {s.subtitle}
              </span>
            </div>

            {/* Connector line */}
            {idx !== steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4",
                  activeStep > idx ? "bg-blue-400" : "bg-gray-200"
                )}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
