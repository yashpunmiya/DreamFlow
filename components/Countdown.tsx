"use client";

import { useEffect, useState } from "react";
import { getSecondsRemaining, type BinaryMarket } from "@/lib/dreamdex/markets";

export function Countdown({ market }: { market: BinaryMarket }) {
  const [seconds, setSeconds] = useState(getSecondsRemaining(market));

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(getSecondsRemaining(market));
    }, 1000);

    return () => clearInterval(interval);
  }, [market]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isUrgent = seconds < 60;

  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400 text-sm">Expires in</span>
      <span
        className={`font-mono text-lg font-medium ${
          isUrgent ? "text-orange-400" : "text-slate-200"
        }`}
      >
        {minutes}:{secs.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
