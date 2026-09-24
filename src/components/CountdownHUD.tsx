"use client";

import React, { useState, useEffect } from "react";
import { Clock, ShieldAlert } from "lucide-react";

export default function CountdownHUD({
  targetDate = "2026-10-18T18:00:00+05:30",
  tournamentName = "Valorant: Clash of Radiants",
}: {
  targetDate?: string;
  tournamentName?: string;
}) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <div className="relative p-4 sm:p-5 rounded-2xl bg-[#0b0d14]/90 border border-[#e51d36]/40 backdrop-blur-md shadow-[0_0_30px_rgba(229,29,54,0.2)] max-w-xl mx-auto w-full my-6 group">
      {/* Decorative HUD corners */}
      <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#e51d36]" />
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#e51d36]" />
      <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#e51d36]" />
      <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#e51d36]" />

      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-800/80 text-[11px] font-mono uppercase tracking-wider">
        <div className="flex items-center gap-1.5 text-gray-300">
          <Clock className="w-3.5 h-3.5 text-[#e51d36] animate-spin" style={{ animationDuration: "12s" }} />
          <span>Next Match Countdown</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Brackets Open</span>
        </div>
      </div>

      {/* Ticking Numbers Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 pt-3 text-center">
        {units.map((unit, idx) => (
          <div
            key={idx}
            className="p-2 sm:p-3 rounded-xl bg-black/60 border border-gray-800/80 group-hover:border-[#e51d36]/30 transition-colors"
          >
            <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wider block glow-text-red">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-400 tracking-widest block mt-0.5">
              {unit.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 text-center">
        <span className="text-[10px] text-gray-400 font-mono">
          TARGET: <span className="text-[#e51d36] font-bold">{tournamentName}</span>
        </span>
      </div>
    </div>
  );
}
