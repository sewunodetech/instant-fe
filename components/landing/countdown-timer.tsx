"use client";

import { useEffect, useState } from "react";

const START_SECONDS = 1 * 3600 + 42 * 60; // 1h 42m

function format(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}h ${m < 10 ? "0" : ""}${m}m ${s < 10 ? "0" : ""}${s}s`;
}

export function CountdownTimer() {
  const [seconds, setSeconds] = useState(START_SECONDS);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : prev));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="font-mono font-extrabold tabular-nums text-on-surface" suppressHydrationWarning>
      {format(seconds)}
    </span>
  );
}
