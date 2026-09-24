"use client";

import React from "react";
import { Flame, Shield, Trophy, Radio, Terminal, Gamepad2 } from "lucide-react";

export default function CyberTicker() {
  const items = [
    { icon: Terminal, text: "SYS_STATUS: ONLINE", color: "text-emerald-400" },
    { icon: Shield, text: "UEMK GAMERZ GUILD OFFICIAL", color: "text-[#e51d36]" },
    { icon: Flame, text: "LIVE REGISTRATION: VALORANT CLASH OF RADIANTS", color: "text-amber-400" },
    { icon: Trophy, text: "PRIZE VAULT: ₹50,000+ DISTRIBUTED", color: "text-yellow-400" },
    { icon: Gamepad2, text: "BGMI WARFARE // SQUAD TPP", color: "text-sky-400" },
    { icon: Radio, text: "DISCORD VOICE SCRIMS: ACTIVE 24/7", color: "text-indigo-400" },
  ];

  return (
    <div className="relative w-full bg-[#06070a] border-y border-[#e51d36]/30 overflow-hidden py-2.5 z-20 backdrop-blur-md">
      {/* Subtle edge fade overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#06070a] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#06070a] to-transparent z-10 pointer-events-none" />

      <div className="flex animate-marquee whitespace-nowrap">
        {/* Render twice for continuous loop */}
        {[...items, ...items].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="inline-flex items-center gap-2 mx-6 text-[11px] sm:text-xs font-mono font-bold tracking-wider text-gray-300 uppercase select-none"
            >
              <Icon className={`w-3.5 h-3.5 ${item.color} shrink-0`} />
              <span>{item.text}</span>
              <span className="text-[#e51d36]/50 ml-4 font-black">//</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
