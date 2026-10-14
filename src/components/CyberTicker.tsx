"use client";

import React from "react";
import { Flame, Shield, Trophy, Radio, Terminal, Gamepad2 } from "lucide-react";

export default function CyberTicker() {
  const items = [
    { icon: Terminal, text: "UEMK GAMERZ GUILD OFFICIAL", color: "text-[#ff1e38]" },
    { icon: Flame, text: "LIVE REGISTRATION: VALORANT RADIANT CUP", color: "text-amber-400" },
    { icon: Trophy, text: "PRIZE VAULT: ₹50,000+ AWARDED", color: "text-yellow-400" },
    { icon: Gamepad2, text: "BGMI CAMPUS WARFARE // SQUAD TPP", color: "text-sky-400" },
    { icon: Radio, text: "DISCORD VOICE SCRIMS: ACTIVE 24/7", color: "text-indigo-400" },
    { icon: Shield, text: "VERIFIED COLLEGIATE BRACKETS", color: "text-emerald-400" },
  ];

  return (
    <div className="relative w-full bg-[#08090f] border-y border-white/[0.08] overflow-hidden py-2.5 z-20">
      {/* Edge gradient mask for smooth fade */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#08090f] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#08090f] to-transparent z-10 pointer-events-none" />

      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="inline-flex items-center gap-2 mx-4 sm:mx-6 text-[10px] sm:text-xs font-bold tracking-wider text-gray-300 uppercase select-none"
            >
              <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${item.color} shrink-0`} />
              <span>{item.text}</span>
              <span className="text-white/20 ml-3 sm:ml-4 font-black">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
