"use client";

import { useEffect, useState } from "react";

const targetDate = new Date("2026-08-24T00:00:00Z").getTime();

export default function CountdownBanner() {
  const [remainingMs, setRemainingMs] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setRemainingMs(difference);
      } else {
        setRemainingMs(0);
      }
    };

    updateCountdown();
    // Use a fast interval for smooth milliseconds countdown
    const timer = setInterval(updateCountdown, 30);

    return () => clearInterval(timer);
  }, []);

  if (!isMounted) return null; // Avoid hydration mismatch

  if (remainingMs === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden bg-linear-to-r from-[#812a72] via-[#993487] to-[#812a72] px-4 py-2.5 text-center shadow-md">
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-white/10 opacity-0 mix-blend-overlay transition-opacity duration-1000 hover:opacity-100" />

      <div className="relative flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-3">
        <span className="text-xs font-semibold tracking-widest text-white/90 uppercase md:text-sm">
          Republic of Sabjiwala Launches in
        </span>

        <span className="inline-flex items-center font-bold tracking-wider text-white tabular-nums">
          <span className="rounded-md bg-white/20 px-3 py-1 text-sm shadow-inner backdrop-blur-sm md:text-base">
            {remainingMs.toLocaleString("en-US")}{" "}
            <span className="ml-1 text-xs text-white/70 md:text-sm">ms</span>
          </span>
        </span>
      </div>
    </div>
  );
}
