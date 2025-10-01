// components/ResultDialog.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Trophy,
  Target,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Star,
  Download,
} from "lucide-react";
import type { ResultDetail } from "../services/result-service";

export interface ResultDialogProps {
  open: boolean;
  detail?: ResultDetail;
  onOpenChange: (open: boolean) => void;
  onDownloadPdf: () => void;
}

export function ResultDialog({
  open,
  detail,
  onOpenChange,
  onDownloadPdf,
}: ResultDialogProps) {
  if (!detail) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[90vw] max-w-full sm:max-w-2xl max-h-[95vh] p-0 overflow-hidden bg-gradient-to-br from-slate-50 to-white">
        <DialogTitle className="mt-3 pt-4 text-lg sm:text-xl flex items-center justify-center text-center px-2">
          Assessment Results Summary
        </DialogTitle>

        <ScrollArea className="h-[75vh] px-4 sm:px-6">
          {/* Candidate Profile Section */}
          <div className="py-6">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-slate-50">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                      <AvatarImage src={detail.avatarUrl} />
                      <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {detail.candidateName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                      {detail.candidateName}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 mb-3">
                      {detail.position}
                    </p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        <User className="h-3 w-3 mr-1" />
                        Candidate
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 hover:bg-green-200"
                      >
                        <Trophy className="h-3 w-3 mr-1" />
                        Assessment Complete
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8 gap-4">
            <Card className="border-0 hover:shadow-xl bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Star className="h-5 w-5" />
                  Personality Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="font-bold text-lg sm:text-xl text-purple-800 mb-2">
                    {detail.personality}
                  </p>
                  <Badge
                    variant="outline"
                    className="border-purple-300 text-purple-700"
                  >
                    DISC Assessment
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 hover:shadow-xl bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Target className="h-5 w-5" />
                  Fast Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="font-bold text-2xl sm:text-3xl text-green-800 mb-2">
                    {detail.fastAccuracy}
                  </p>
                  <Badge
                    variant="outline"
                    className="border-green-300 text-green-700"
                  >
                    Correct Answers
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 hover:shadow-xl bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <BarChart3 className="h-5 w-5" />
                  CAAS Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="font-bold text-2xl sm:text-3xl text-blue-800 mb-2">
                    {detail.caas}/100
                  </p>
                  <Badge
                    variant="outline"
                    className="border-blue-300 text-blue-700"
                  >
                    High Adaptability
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Assessment Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Total Questions</span>
                    <Badge variant="secondary" className="font-bold">
                      {detail.totalQuestion}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>DISC Personality Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detail.discProfile.map((d) => (
                    <div
                      key={d.dimension}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium">{d.dimension}</span>
                      <Badge variant="outline" className="font-semibold">
                        {d.score}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Strengths & Development */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="h-5 w-5" />
                  Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detail.strengths.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="font-medium text-gray-800">{s}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Target className="h-5 w-5" />
                  Development Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detail.developmentAreas.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm"
                    >
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-800">{d}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Best Fit Role */}
          <Card className="border-0 shadow-lg mb-6 bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-800">
                <Trophy className="h-5 w-5" />
                Best Fit Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {detail.bestFitRoles.map((role) => (
                <div
                  key={role.name}
                  className="p-4 bg-white rounded-lg shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
                    <span className="font-semibold text-base sm:text-lg text-gray-800">
                      {role.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-indigo-100 text-indigo-800 font-bold text-base sm:text-lg px-3 py-1"
                    >
                      {role.percentage}%
                    </Badge>
                  </div>
                  <Progress
                    value={role.percentage}
                    className="h-3 bg-gray-200"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </ScrollArea>

        <Separator />

        <DialogFooter className="p-4 sm:p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:ml-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="hover:bg-gray-100 w-full sm:w-auto"
            >
              Close
            </Button>
            <Button
              onClick={onDownloadPdf}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
