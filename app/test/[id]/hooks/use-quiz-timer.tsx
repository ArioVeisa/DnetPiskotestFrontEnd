import { useState, useRef, useEffect } from "react";

export function useQuizTimer(
  duration: number,
  onExpire: () => void
): { timeLeft: number; start: () => void; reset: () => void } {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset ke durasi baru setiap durasi berubah
  useEffect(() => {
    setTimeLeft(duration);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, [duration]);

  // Cleanup di unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Start
  const start = () => {
    if (timerRef.current !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          onExpire();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  // Reset manual
  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTimeLeft(duration);
  };

  return { timeLeft, start, reset };
}
