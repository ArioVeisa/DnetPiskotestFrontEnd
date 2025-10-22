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

export interface TestSection {
  section_id: number;
  section_type: string;
  duration_minutes: number;
  question_count: number;
}

export interface TestInfo {
  id: string;
  name: string;
  questionCount: number;
  duration: number; // menit
  sections?: TestSection[];
}

interface ReminderPageProps {
  candidate: Candidate;
  tests: TestInfo[];
  onStart: () => void;
}

export function ReminderPage({
  candidate,
  tests,
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

      {/* Test Details */}
      {tests.length > 0 && (
        <Card className="rounded-lg border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-green-500" />
              <CardTitle>Jenis Tes yang Akan Dikerjakan</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {tests.map((test, testIndex) => (
              <div key={`test-${test.id}-${testIndex}`} className="mb-6 last:mb-0">
                <h3 className="font-semibold text-lg mb-3">{test.name}</h3>
                
                {test.sections && test.sections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {test.sections.map((section, sectionIndex) => {
                      const getSectionInfo = (type: string) => {
                        switch (type.toLowerCase()) {
                          case 'caas':
                            return {
                              title: 'Tes CAAS',
                              description: 'Career Assessment and Analysis System',
                              icon: '🎯',
                              color: 'bg-blue-50 border-blue-200 text-blue-800'
                            };
                          case 'teliti':
                            return {
                              title: 'Tes Ketelitian',
                              description: 'Mengukur tingkat ketelitian dan akurasi',
                              icon: '🔍',
                              color: 'bg-green-50 border-green-200 text-green-800'
                            };
                          case 'disc':
                            return {
                              title: 'Tes DISC',
                              description: 'Mengukur kepribadian dan gaya komunikasi',
                              icon: '👤',
                              color: 'bg-purple-50 border-purple-200 text-purple-800'
                            };
                          default:
                            return {
                              title: `Tes ${type}`,
                              description: 'Tes psikologi',
                              icon: '📝',
                              color: 'bg-gray-50 border-gray-200 text-gray-800'
                            };
                        }
                      };

                      const sectionInfo = getSectionInfo(section.section_type);
                      
                      return (
                        <div
                          key={`${test.id}-section-${section.section_id}-${sectionIndex}`}
                          className={`p-4 rounded-lg border ${sectionInfo.color}`}
                        >
                          <div className="text-center mb-3">
                            <div className="text-3xl mb-2">{sectionInfo.icon}</div>
                            <h4 className="font-semibold">{sectionInfo.title}</h4>
                            <p className="text-xs opacity-75">{sectionInfo.description}</p>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span>Durasi:</span>
                              <span className="font-medium">{section.duration_minutes} menit</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Soal:</span>
                              <span className="font-medium">{section.question_count} pertanyaan</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📝</div>
                    <p className="font-medium">Tes Psikologi</p>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Durasi: {test.duration} menit</p>
                      <p>Soal: {test.questionCount} pertanyaan</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Start Test Button */}
      <div className="pt-4">
        <Button onClick={onStart} className="w-full">
          Start Test
        </Button>
      </div>
    </div>
  );
}
