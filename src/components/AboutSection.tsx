"use client";

import React from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import {
  ShieldCheck,
  Zap,
  Target,
  Medal,
  Award,
  Gamepad,
  CheckCircle2,
} from "lucide-react";

export default function AboutSection() {
  const games = [
    "Valorant",
    "BGMI",
    "EA Sports FC",
    "Counter-Strike 2",
    "Rocket League",
    "Call of Duty Mobile",
    "Free Fire",
    "Clash Royale",
    "Chess",
  ];

  return (
    <section id="about" className="relative py-24 bg-[#08090d] border-t border-gray-800/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Visual Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-b from-[#161826] to-[#0c0d14] border border-[#e51d36]/30 p-8 shadow-[0_0_40px_rgba(229,29,54,0.25)] flex flex-col items-center justify-center text-center group">
              <div className="relative w-36 h-36 mb-6 p-3 rounded-2xl bg-black/80 border border-[#e51d36]/50 shadow-[0_0_30px_rgba(229,29,54,0.5)] group-hover:scale-105 transition-transform duration-300">
                <Image
                  src={siteConfig.assets.logo}
                  alt="UGG Emblem"
                  width={140}
                  height={140}
                  className="object-contain"
                />
              </div>

              <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                UEMK GAMERZ GUILD
              </h3>
              <p className="text-xs uppercase font-extrabold tracking-widest text-[#e51d36] mt-1">
                Official Esports Society of UEM Kolkata
              </p>

              <div className="w-full mt-6 pt-6 border-t border-gray-800/80 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-lg font-black text-white">LAN & Online</div>
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">Formats</div>
                </div>
                <div className="text-center border-x border-gray-800">
                  <div className="text-lg font-black text-[#e51d36]">Fair Play</div>
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">Strict Rules</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-white">All Year</div>
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">Tournaments</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Pillars */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#e51d36]/15 border border-[#e51d36]/30 text-[#e51d36] text-xs font-bold uppercase tracking-wider mb-3">
              <Target className="w-3.5 h-3.5" />
              <span>Who We Are</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mb-6">
              Built By Gamers, <br />
              <span className="text-[#e51d36] glow-text-red">Driven by Competition</span>
            </h2>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 font-medium">
              <strong>UEMK Gamerz Guild (UGG)</strong> is the official gaming and esports society at the University of Engineering & Management, Kolkata. We bridge the gap between casual campus gaming and high-tier competitive esports.
            </p>

            {/* Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-[#12141e] border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#e51d36]/15 text-[#e51d36] flex items-center justify-center">
                    <Medal className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Verified Tournaments</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Transparent brackets, anti-cheat vigilance, and verified cash prize distributions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#12141e] border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Scrims & Practice</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Weekly practice lobbies, custom rooms, and inter-university scrim matches.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#12141e] border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/15 text-pink-400 flex items-center justify-center">
                    <Gamepad className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Multi-Title Roster</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  From tactical PC shooters like Valorant to mobile titans like BGMI and sports sims.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#12141e] border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Fair Play & Community</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Strict zero-tolerance policy towards toxicity, harassment, and unauthorized mods.
                </p>
              </div>
            </div>

            {/* Supported Game Badges */}
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-gray-400 block mb-3">
                Featured Competitive Titles:
              </span>
              <div className="flex flex-wrap gap-2">
                {games.map((game, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-black/60 border border-gray-800 text-gray-300 hover:border-[#e51d36]/50 hover:text-white transition-colors"
                  >
                    {game}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
