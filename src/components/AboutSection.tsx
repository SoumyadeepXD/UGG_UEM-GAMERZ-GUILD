"use client";

import React from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cyberSound } from "@/lib/cyberSound";
import {
  ShieldCheck,
  Zap,
  Target,
  Medal,
  Gamepad,
  Terminal,
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
          {/* Left Column: Hologram Emblem Card */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-b from-[#141724] to-[#0a0b12] border border-[#e51d36]/40 p-8 shadow-[0_0_45px_rgba(229,29,54,0.3)] flex flex-col items-center justify-center text-center group">
              {/* Corner HUD accents */}
              <span className="absolute top-3 left-3 text-[10px] font-mono text-[#e51d36]">[#UGG_CORE]</span>
              <span className="absolute bottom-3 right-3 text-[10px] font-mono text-[#e51d36]">[v2.0_READY]</span>

              {/* Holographic Radar Ring */}
              <div className="relative w-36 h-36 mb-6 p-3 rounded-2xl bg-black/85 border border-[#e51d36]/60 shadow-[0_0_30px_rgba(229,29,54,0.6)] group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                <div className="absolute -inset-2 rounded-full border border-dashed border-[#e51d36]/40 animate-radar-spin pointer-events-none" />
                <Image
                  src={siteConfig.assets.logo}
                  alt="UGG Emblem"
                  width={140}
                  height={140}
                  className="object-contain"
                />
              </div>

              <h3 className="text-2xl font-black text-white uppercase tracking-tight font-sans">
                UEMK GAMERZ GUILD
              </h3>
              <p className="text-xs uppercase font-mono font-extrabold tracking-widest text-[#e51d36] mt-1">
                Official Esports Society of UEM Kolkata
              </p>

              <div className="w-full mt-6 pt-6 border-t border-gray-800/80 grid grid-cols-3 gap-2 font-mono">
                <div className="text-center">
                  <div className="text-base sm:text-lg font-black text-white">LAN & NET</div>
                  <div className="text-[9px] text-gray-400 uppercase font-semibold">Formats</div>
                </div>
                <div className="text-center border-x border-gray-800">
                  <div className="text-base sm:text-lg font-black text-[#e51d36]">FAIR PLAY</div>
                  <div className="text-[9px] text-gray-400 uppercase font-semibold">Vigilance</div>
                </div>
                <div className="text-center">
                  <div className="text-base sm:text-lg font-black text-white">ALL YEAR</div>
                  <div className="text-[9px] text-gray-400 uppercase font-semibold">Tournaments</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Pillars */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#e51d36]/15 border border-[#e51d36]/30 text-[#e51d36] text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <Terminal className="w-3.5 h-3.5" />
              <span>// GUILD_BRIEFING: ABOUT_UGG</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mb-6">
              Forged by Gamers, <br />
              <span className="text-[#e51d36] glow-text-red">Driven by Victory</span>
            </h2>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 font-medium font-sans">
              <strong>UEMK Gamerz Guild (UGG)</strong> is the official gaming and collegiate esports organization at the University of Engineering & Management, Kolkata. We provide competitive infrastructure, tournament broadcasting, and high-tier collegiate scrims.
            </p>

            {/* Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div
                className="p-4 rounded-xl bg-[#12141e] border border-gray-800 hover:border-[#e51d36]/50 transition-colors"
                onMouseEnter={() => cyberSound.playHover()}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#e51d36]/15 text-[#e51d36] flex items-center justify-center">
                    <Medal className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Verified Tournaments</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Transparent brackets, live shoutcasting, anti-cheat vigilance, and prompt cash prize distributions.
                </p>
              </div>

              <div
                className="p-4 rounded-xl bg-[#12141e] border border-gray-800 hover:border-indigo-500/50 transition-colors"
                onMouseEnter={() => cyberSound.playHover()}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Scrims & Practice</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Weekly practice lobbies, custom rooms, and inter-university scrim matches across all top titles.
                </p>
              </div>

              <div
                className="p-4 rounded-xl bg-[#12141e] border border-gray-800 hover:border-pink-500/50 transition-colors"
                onMouseEnter={() => cyberSound.playHover()}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/15 text-pink-400 flex items-center justify-center">
                    <Gamepad className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Multi-Platform Roster</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  From PC tactical shooters like Valorant to mobile titans like BGMI and PS5 sports simulations.
                </p>
              </div>

              <div
                className="p-4 rounded-xl bg-[#12141e] border border-gray-800 hover:border-emerald-500/50 transition-colors"
                onMouseEnter={() => cyberSound.playHover()}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Fair Play Standard</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Strict zero-tolerance policy towards toxicity, harassment, and unauthorized mods.
                </p>
              </div>
            </div>

            {/* Supported Game Badges with Sound */}
            <div>
              <span className="text-xs uppercase font-mono font-extrabold tracking-wider text-gray-400 block mb-3">
                // ACTIVE_COMPETITIVE_DISCIPLINES:
              </span>
              <div className="flex flex-wrap gap-2">
                {games.map((game, i) => (
                  <span
                    key={i}
                    onMouseEnter={() => cyberSound.playHover()}
                    className="px-3 py-1 cyber-cut-sm text-xs font-mono font-bold uppercase tracking-wider bg-black/70 border border-gray-800 text-gray-300 hover:border-[#e51d36] hover:text-white transition-all cursor-default shadow-sm"
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
