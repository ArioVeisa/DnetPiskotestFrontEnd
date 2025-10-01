"use client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Download } from "lucide-react";

interface CompletionCardProps {
  onContact: () => void;
  onDownload: () => void;
  testId: string;
  date: string;
}

export function CompletionDialog({
  onContact,
  onDownload,
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
          Tes Berhasil Diselesaikan!
        </div>
        <div className="text-gray-500 text-base mb-6 text-center">
          Terima kasih telah menyelesaikan psikotes online
        </div>

        {/* INFORMASI HASIL */}
        <div className="bg-green-50 rounded-lg w-full px-5 py-4 mb-4 border border-green-100">
          <div className="font-semibold text-green-700 mb-1">Informasi Hasil</div>
          <ul className="text-sm text-green-800 space-y-1 list-disc pl-4">
            <li>Hasil tes Anda telah tersimpan dengan aman</li>
            <li>Tim HRD akan meninjau hasil dalam 1-2 hari kerja</li>
            <li>Anda akan dihubungi untuk tahap selanjutnya</li>
          </ul>
        </div>

        {/* LANGKAH SELANJUTNYA */}
        <div className="bg-blue-50 rounded-lg w-full px-5 py-4 mb-6 border border-blue-100">
          <div className="font-semibold text-blue-500 mb-1">Langkah Selanjutnya</div>
          <div className="text-sm text-blue-900">
            Silakan tunggu konfirmasi dari tim rekrutmen kami. Jika ada pertanyaan, Anda dapat menghubungi HRD melalui email yang telah diberikan.
          </div>
        </div>

        {/* BUTTON */}
        <div className="flex flex-col sm:flex-row gap-2 w-full justify-center mb-5">
          <Button
            variant="outline"
            className="flex-1 border px-3 py-2"
            onClick={onContact}
          >
            <span className="inline-flex items-center gap-2 text-blue-500 font-semibold">
              <Mail className="w-5 h-5" />
              Hubungi HRD
            </span>
          </Button>
          <Button
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 font-semibold"
            onClick={onDownload}
          >
            <span className="inline-flex items-center gap-2">
              <Download className="w-5 h-5" />
              Unduh Sertifikat
            </span>
          </Button>
        </div>

        {/* FOOTER */}
        <div className="text-center text-xs text-gray-400 mt-2 w-full">
          ID Tes: {testId} <br />
          Tanggal: {date}
        </div>
      </div>
    </div>
  );
}
