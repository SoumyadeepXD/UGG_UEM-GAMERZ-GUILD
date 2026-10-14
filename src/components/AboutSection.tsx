"use client";

import React from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import ScrollReveal from "@/components/ScrollReveal";
import {
  ShieldCheck,
  Zap,
  Target,
  Medal,
  Gamepad,
} from "lucide-react";

export default function AboutSection() {
  const games = [
    "Valorant",
    "BGMI",
    "EA Sports FC",
    "Counter-Strike 2",
    "Rocket League",
    "Call of Duty",
    "Free Fire",
    "Chess",
  ];

  const pillars = [
    {
      title: "Verified Tournaments",
      desc: "Transparent brackets, official refereeing, and verified cash prize distributions.",
      icon: Medal,
      iconBg: "bg-[#ff1e38]/15 text-[#ff1e38]",
    },
    {
      title: "Weekly Scrims",
      desc: "Daily custom lobbies, voice channel coordination, and campus squad scrims.",
      icon: Zap,
      iconBg: "bg-indigo-500/15 text-indigo-400",
    },
    {
      title: "Multi-Game Roster",
      desc: "Active tournaments in PC shooters (Valorant, CS2), mobile battle royales (BGMI), and sports sims.",
      icon: Gamepad,
      iconBg: "bg-pink-500/15 text-pink-400",
    },
    {
      title: "Fair Play Policy",
      desc: "Zero tolerance for toxicity, unauthorized hacks, or unsportsmanlike behavior.",
      icon: ShieldCheck,
      iconBg: "bg-emerald-500/15 text-emerald-400",
    },
  ];

  return (
    <section id="about" className="relative py-16 sm:py-24 bg-[#08090f] border-t border-white/[0.08] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Guild Badge Card with Scroll Animation */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <ScrollReveal direction="right" delay={100} className="w-full flex justify-center">
              <div className="relative w-full max-w-sm rounded-3xl bg-[#0f1118] border border-white/10 p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-center text-center">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-4 p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center shadow-lg">
                  <Image
                    src={siteConfig.assets.logo}
                    alt="UGG Emblem"
                    width={110}
                    height={110}
                    className="object-contain drop-shadow-[0_4px_12px_rgba(255,30,56,0.6)]"
                  />
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  UEMK GAMERZ GUILD
                </h3>
                <p className="text-[11px] uppercase font-bold tracking-widest text-[#ff1e38] mt-1">
                  Official Esports Society of UEM Kolkata
                </p>

                <div className="w-full mt-5 pt-5 border-t border-white/[0.08] grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-sm sm:text-base font-black text-white">LAN & Online</div>
                    <div className="text-[9px] text-gray-400 uppercase font-semibold">Formats</div>
                  </div>
                  <div className="border-x border-white/[0.08]">
                    <div className="text-sm sm:text-base font-black text-[#ff1e38]">Fair Play</div>
                    <div className="text-[9px] text-gray-400 uppercase font-semibold">Standard</div>
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-black text-white">All Year</div>
                    <div className="text-[9px] text-gray-400 uppercase font-semibold">Tourneys</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Information & Pillars */}
          <div className="lg:col-span-7">
            <ScrollReveal direction="left" delay={120}>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#ff1e38]/10 border border-[#ff1e38]/20 text-[#ff1e38] text-[11px] font-bold uppercase tracking-wider mb-3">
                <Target className="w-3.5 h-3.5" />
                <span>Who We Are</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight mb-4">
                Built by Gamers, <br />
                <span className="text-[#ff1e38]">Driven by Competition</span>
              </h2>

              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                <strong>UEMK Gamerz Guild (UGG)</strong> is the official collegiate esports society at the University of Engineering & Management, Kolkata. We organize competitive LAN and online tournaments, manage campus representative rosters, and host active practice scrims.
              </p>
            </ScrollReveal>

            {/* 4 Pillars Grid (2x2 on mobile & desktop) with Staggered Scroll Animation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
              {pillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <ScrollReveal
                    key={idx}
                    direction="up"
                    delay={180 + idx * 70}
                    className="h-full"
                  >
                    <div className="p-3.5 sm:p-4 rounded-xl bg-[#0f1118] border border-white/10 h-full">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className={`w-7 h-7 rounded-lg ${pillar.iconBg} flex items-center justify-center shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-white text-xs sm:text-sm">{pillar.title}</h4>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>

            {/* Competitive Title Tags */}
            <ScrollReveal direction="up" delay={380}>
              <div>
                <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-gray-400 block mb-2.5">
                  Featured Competitive Titles:
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {games.map((game, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/[0.04] border border-white/10 text-gray-300"
                    >
                      {game}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
