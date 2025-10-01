// src/app/users/[id]/components/ReminderPage.tsx
"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Info,
  // ClipboardList,
  CheckCircle2,
  Clock as ClockIcon,
} from "lucide-react";

export interface Candidate {
  nik: string;
  name: string;
  email: string;
  position: string;
  phone: string;
  status: string;
}

export interface TestInfo {
  id: string;
  name: string;
  questionCount: number;
  duration: number; // menit
}

interface ReminderPageProps {
  candidate: Candidate;
  tests: TestInfo[];
  onStart: () => void;
}

export function ReminderPage({
  candidate,
  // tests,
  onStart,
}: ReminderPageProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6">
      {/* Judul */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">
          Get Ready for Your Psychological Assessment
        </h1>
        <p className="text-sm text-muted-foreground">
          Check your personal info before starting. Contact HR if anything looks
          wrong
        </p>
      </div>

      {/* Candidate Information */}
      <Card className="rounded-lg border">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-500" />
            <CardTitle>Candidate Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-x-8 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Name</p>
              <p className="font-medium text-gray-900">{candidate.name}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Email</p>
              <p className="font-medium text-gray-900">{candidate.email}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Position</p>
              <p className="font-medium text-gray-900">{candidate.position}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-x-8 text-sm">
            <div>
              <p className="text-gray-500 mb-1">NIK</p>
              <p className="font-medium text-gray-900">{candidate.nik}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Phone Number</p>
              <p className="font-medium text-gray-900">{candidate.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Instructions */}
      <Card className="rounded-lg border">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-yellow-500" />
            <CardTitle>Important Instructions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-1" />
              Ensure your internet connection is stable
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-1" />
              Answer all questions honestly
            </li>
            <li className="flex items-start">
              <ClockIcon className="w-4 h-4 text-green-500 mr-2 mt-1" />
              Timer will start automatically when test begins
            </li>
          </ul>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-1" />
              Take the test in a quiet environment
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-1" />
              Test cannot be retaken once started
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-1" />
              Contact HR for technical issues
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Test Details
      <Card className="rounded-lg border">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-green-500" />
            <CardTitle>Test Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((t) => {
            const isDisc = t.id === "disc";
            const isCaas = t.id === "caas";
            const bgColor = isDisc
              ? "bg-blue-50"
              : isCaas
              ? "bg-yellow-50"
              : "bg-green-50";
            const iconColor = isDisc
              ? "text-blue-500"
              : isCaas
              ? "text-yellow-500"
              : "text-green-500";

            return (
              <div
                key={t.id}
                className="flex flex-col p-4 bg-white rounded-lg border space-y-3 items-center"
              >
                <div
                  className={`${bgColor} p-2 rounded-full flex items-center justify-center`}
                >
                  {isDisc && <User className={`w-6 h-6 ${iconColor}`} />}
                  {isCaas && (
                    <ClipboardList className={`w-6 h-6 ${iconColor}`} />
                  )}
                  {!isDisc && !isCaas && (
                    <ClockIcon className={`w-6 h-6 ${iconColor}`} />
                  )}
                </div>
                <p className="font-semibold text-center">{t.name}</p>
                <div className="flex flex-col space-y-2">
                  <span className="inline-flex items-center px-2 py-1 text-blue-600 rounded">
                    <ClipboardList className="w-4 h-4 mr-1" /> {t.questionCount} Questions
                  </span>
                  <span className="inline-flex items-center px-2 py-1 text-blue-600 rounded">
                    <ClockIcon className="w-4 h-4 mr-1" /> {t.duration} min
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card> */}

      {/* Start Test Button */}
      <div className="pt-4">
        <Button onClick={onStart} className="w-full">
          Start Test
        </Button>
      </div>
    </div>
  );
}
