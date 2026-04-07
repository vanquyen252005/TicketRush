import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: number;
  onExpire?: () => void;
  className?: string;
}

export function CountdownTimer({ targetDate, onExpire, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(targetDate - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = targetDate - Date.now();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  const isLowTime = minutes < 1;

  return (
    <div
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        ${isLowTime ? "bg-red-500 text-white animate-pulse" : "bg-blue-500 text-white"}
        ${className}
      `}
    >
      <Clock className="w-5 h-5" />
      <span className="font-mono text-lg">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
