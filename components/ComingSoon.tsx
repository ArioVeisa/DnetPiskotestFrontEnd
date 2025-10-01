"use client";
import { Button } from "@/components/ui/button";
import { Clock, Rocket } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full flex flex-col items-center gap-4 animate-fade-in">
        <div className="bg-blue-100 rounded-full p-2 mb-3">
          <Rocket className="w-14 h-14 text-blue-500 animate-bounce-slow" />
        </div>
        <div className="text-3xl font-bold text-center text-blue-700 mb-1">
          Coming Soon!
        </div>
        <div className="text-base text-center text-gray-500 mb-3">
          This feature is under construction.<br />
          Stay tuned, we’re working hard to bring it to you soon.
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full mt-1">
          <Button variant="outline" className="flex-1 text-blue-600 border-blue-200">
            <Clock className="w-5 h-5 mr-2" />
            Notify Me
          </Button>
          <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow">
            <Rocket className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>
        <div className="text-xs text-gray-400 mt-6">© {new Date().getFullYear()} Your Company. All rights reserved.</div>
      </div>
    </div>
  );
}

// tailwind animate-fade-in & animate-bounce-slow (tambahkan di tailwind.config.js jika mau):
// 'fade-in': 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
// 'bounce-slow': 'bounce 2.5s infinite'
