"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface Props {
  autoRedirectMs?: number;
}

export default function SessionExpiredDialog({ autoRedirectMs = 30000 }: Props) {
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const router = useRouter();

  // buka dialog ketika event "session-expired" diterima
  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setCountdown(autoRedirectMs / 1000); // reset countdown ke 30 detik
    };
    window.addEventListener("session-expired", handler);
    return () => window.removeEventListener("session-expired", handler);
  }, [autoRedirectMs]);

  // countdown & auto-redirect
  useEffect(() => {
    if (open && countdown && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    } else if (open && countdown === 0) {
      setOpen(false);
      router.replace("/login");
    }
  }, [open, countdown, router]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader className="flex flex-col items-center text-center space-y-3">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <AlertDialogTitle className="text-xl font-bold">
            Sesi Habis
          </AlertDialogTitle>
          <AlertDialogDescription>
            Sesi login kamu sudah habis. Kamu akan diarahkan ke halaman login
            dalam{" "}
            <span className="font-semibold text-red-600">
              {countdown ?? ""}
            </span>{" "}
            detik.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center space-x-2">
          <AlertDialogCancel
            onClick={() => router.replace("/login")}
            className="px-4"
          >
            Login Sekarang
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => router.replace("/login")}
            className="px-4"
          >
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
