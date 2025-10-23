"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";

interface SectionAnnouncementProps {
  sectionType: string;
  duration: number;
  questionCount: number;
  onStart: () => void;
}

export function SectionAnnouncement({ 
  sectionType, 
  duration, 
  questionCount, 
  onStart 
}: SectionAnnouncementProps) {
  const [countdown, setCountdown] = useState(30); // 30 detik countdown
  const [canStart, setCanStart] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanStart(true);
    }
  }, [countdown]);

  const getSectionInfo = (type: string) => {
    switch (type.toLowerCase()) {
      case 'caas':
        return {
          title: 'CAAS Test (Career Assessment and Analysis System)',
          description: 'This test measures your career analysis ability and future planning skills.',
          icon: '🎯',
          color: 'bg-blue-50 border-blue-200'
        };
      case 'teliti':
        return {
          title: 'Fast Accuracy Test',
          description: 'This test measures your accuracy and speed in completing tasks.',
          icon: '🔍',
          color: 'bg-green-50 border-green-200'
        };
      case 'disc':
        return {
          title: 'DISC Test',
          description: 'This test measures your personality and communication style.',
          icon: '👤',
          color: 'bg-purple-50 border-purple-200'
        };
      default:
        return {
          title: `${type} Test`,
          description: 'This test will measure your abilities and personality.',
          icon: '📝',
          color: 'bg-gray-50 border-gray-200'
        };
    }
  };

  const info = getSectionInfo(sectionType);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className={`w-full max-w-2xl ${info.color}`}>
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">{info.icon}</div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            {info.title}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {info.description}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Test Information */}
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Duration:</span>
              <span className="text-blue-600 font-bold">{duration} minutes</span>
            </div>
            
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Number of Questions:</span>
              <span className="text-green-600 font-bold">{questionCount} questions</span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {countdown > 0 ? countdown : 'Ready!'}
            </div>
            <p className="text-gray-600">
              {countdown > 0 
                ? `Test will start in ${countdown} seconds...` 
                : 'Click the button below to start the test'
              }
            </p>
          </div>

          {/* Start Button */}
          <div className="flex justify-center">
            <Button 
              onClick={onStart}
              disabled={!canStart}
              size="lg"
              className="px-8 py-3 text-lg font-semibold"
            >
              {canStart ? 'Start Test' : 'Preparing...'}
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Test Guidelines:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Read each question carefully</li>
                  <li>• Choose the answer that best fits you</li>
                  <li>• You can use the Mark for Review button to flag questions</li>
                  <li>• Make sure all questions are answered before time runs out</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

