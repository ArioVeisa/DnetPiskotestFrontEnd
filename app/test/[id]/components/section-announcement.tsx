"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle } from "lucide-react";

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
  // Removed countdown timer - user can start test immediately

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

  const renderGuidelines = () => {
    const type = sectionType.toLowerCase();
    if (type === 'disc') {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-2">Langkah - langkah:</p>
            <ol className="list-decimal ml-5 space-y-1 text-xs">
              <li>Dari 4 pernyataan, pilih satu yang PALING menggambarkan diri Anda (P).</li>
              <li>Pilih satu lagi yang PALING TIDAK menggambarkan diri Anda (K).</li>
            </ol>
            <div className="mt-3">
              <p className="font-semibold mb-1">Poin Penting!</p>
              <ul className="space-y-1 text-xs">
                <li>• Setiap nomor harus memiliki tepat satu pilihan (P) dan satu pilihan (K).</li>
                <li>• (P) dan (K) tidak boleh pada pernyataan yang sama.</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }
    if (type === 'caas') {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-2">Poin Penting!</p>
            <p className="text-xs mb-2">Tidak ada jawaban benar atau salah. Pilih sesuai yang paling Anda rasakan.</p>
            <p className="font-semibold mb-2">Gunakan 5 tingkat skala berikut:</p>
            <ul className="space-y-1 text-xs">
              <li>• 5 - Paling Kuat (PK)</li>
              <li>• 4 - Sangat Kuat (SK)</li>
              <li>• 3 - Kuat (K)</li>
              <li>• 2 - Cukup Kuat (CK)</li>
              <li>• 1 - Tidak Kuat (TK)</li>
            </ul>
          </div>
        </div>
      );
    }
    // teliti / fast accuracy
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-2">Tugas Utama</p>
          <p className="text-xs mb-2">Bandingkan data kiri dan kanan. Tentukan apakah SAMA PERSIS atau TIDAK SAMA.</p>
          <ul className="space-y-1 text-xs mb-3">
            <li>• Pilih &quot;T&quot; (True) jika keduanya Sama Persis</li>
            <li>• Pilih &quot;F&quot; (False) jika ada perbedaan sekecil apa pun</li>
          </ul>
          <p className="font-semibold mb-1">Aturan Penting!</p>
          <ul className="space-y-1 text-xs">
            <li>• Tes dibatasi waktu, waktu berjalan otomatis saat mulai.</li>
            <li>• Setiap jawaban bersifat final dan tidak bisa diubah.</li>
            <li>• Soal disajikan dalam satu halaman scrolling untuk efisiensi.</li>
          </ul>
        </div>
      </div>
    );
  };

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

          {/* Start Button */}
          <div className="flex justify-center">
            <Button 
              onClick={onStart}
              size="lg"
              className="px-8 py-3 text-lg font-semibold"
            >
              Start Test
            </Button>
          </div>

          {/* Instructions by Type */}
          {renderGuidelines()}
        </CardContent>
      </Card>
    </div>
  );
}

