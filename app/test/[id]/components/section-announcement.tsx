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
          title: 'Tes CAAS (Career Assessment and Analysis System)',
          description: 'Tes ini mengukur kemampuan analisis karier dan perencanaan masa depan Anda.',
          icon: '🎯',
          color: 'bg-blue-50 border-blue-200'
        };
      case 'teliti':
        return {
          title: 'Tes Ketelitian',
          description: 'Tes ini mengukur tingkat ketelitian dan akurasi Anda dalam menyelesaikan tugas.',
          icon: '🔍',
          color: 'bg-green-50 border-green-200'
        };
      case 'disc':
        return {
          title: 'Tes DISC',
          description: 'Tes ini mengukur kepribadian dan gaya komunikasi Anda.',
          icon: '👤',
          color: 'bg-purple-50 border-purple-200'
        };
      default:
        return {
          title: `Tes ${type}`,
          description: 'Tes ini akan mengukur kemampuan dan kepribadian Anda.',
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
              <span className="font-medium">Durasi:</span>
              <span className="text-blue-600 font-bold">{duration} menit</span>
            </div>
            
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Jumlah Soal:</span>
              <span className="text-green-600 font-bold">{questionCount} soal</span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {countdown > 0 ? countdown : 'Siap!'}
            </div>
            <p className="text-gray-600">
              {countdown > 0 
                ? `Tes akan dimulai dalam ${countdown} detik...` 
                : 'Klik tombol di bawah untuk memulai tes'
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
              {canStart ? 'Mulai Tes' : 'Persiapan...'}
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Panduan Tes:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Baca setiap pertanyaan dengan teliti</li>
                  <li>• Pilih jawaban yang paling sesuai dengan diri Anda</li>
                  <li>• Anda dapat menggunakan tombol Mark for Review untuk menandai pertanyaan</li>
                  <li>• Pastikan semua pertanyaan terjawab sebelum waktu habis</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

