"use client";

import React from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cyberSound } from "@/lib/cyberSound";
import { InstagramIcon, WhatsAppIcon } from "@/components/SocialIcons";
import CountdownHUD from "@/components/CountdownHUD";
import {
  Trophy,
  Users,
  Swords,
  ChevronDown,
  ExternalLink,
  Target,
  Sparkles,
  Zap,
} from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden">
      {/* Background with custom PC Hardware Image and Vignette */}
      <div className="absolute inset-0 z-0">
        <Image
          src={siteConfig.assets.heroBg}
          alt="UGG Arena Background"
          fill
          priority
          className="object-cover object-center opacity-45 scale-105"
        />
        {/* Layered cyber vignette & scanlines */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/70 to-[#08090d]/80" />
        <div className="absolute inset-0 scanline opacity-25 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#e51d36]/15 blur-[150px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Guild HUD Tag */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/70 border border-[#e51d36]/50 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(229,29,54,0.35)]">
          <span className="w-2 h-2 rounded-full bg-[#e51d36] animate-ping" />
          <span className="text-[11px] font-mono uppercase tracking-widest font-extrabold text-white">
            // STATUS: BATTLE READY • UEMK GAMERZ GUILD
          </span>
        </div>

        {/* Concentric Holographic Radar Emblem Presentation */}
        <div className="relative w-44 h-44 sm:w-56 sm:h-56 mb-8 flex items-center justify-center">
          {/* Outer dashed radar ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-[#e51d36]/40 animate-radar-spin pointer-events-none" />
          
          {/* Middle tactical ring with crosshairs */}
          <div className="absolute inset-3 sm:inset-4 rounded-full border border-[#e51d36]/25 animate-radar-counter pointer-events-none">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#e51d36] rounded-full" />
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-[#e51d36] rounded-full" />
            <span className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#e51d36] rounded-full" />
            <span className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#e51d36] rounded-full" />
          </div>

          {/* Core pulsing ambient glow */}
          <div className="absolute w-32 h-32 rounded-full bg-[#e51d36]/20 blur-xl animate-pulse-glow pointer-events-none" />

          {/* Central UGG Emblem */}
          <div
            className="relative w-28 h-28 sm:w-36 sm:h-36 p-3 rounded-2xl bg-black/85 border border-[#e51d36]/60 shadow-[0_0_35px_rgba(229,29,54,0.6)] backdrop-blur-md flex items-center justify-center group hover:scale-105 transition-transform duration-300 cursor-pointer"
            onMouseEnter={() => cyberSound.playHover()}
            onClick={() => cyberSound.playLaunch()}
          >
            <Image
              src={siteConfig.assets.logo}
              alt="UGG Emblem"
              width={120}
              height={120}
              priority
              className="object-contain filter drop-shadow-[0_0_15px_rgba(229,29,54,0.9)] animate-float"
            />
          </div>
        </div>

        {/* Main Title with futuristic font treatments */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase mb-3 leading-none select-none">
          <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 drop-shadow-md">
            UEMK GAMERZ
          </span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#e51d36] via-[#ff2a44] to-[#ff667a] drop-shadow-[0_0_35px_rgba(229,29,54,0.7)] glow-text-red">
            GUILD
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-xs sm:text-base text-gray-300 font-medium mb-4 leading-relaxed font-sans">
          The official collegiate arena for competitive gamers at UEM Kolkata. Assemble your squad, dominate tournament brackets, and claim glory.
        </p>

        {/* Live Countdown HUD */}
        <div className="w-full">
          <CountdownHUD
            targetDate="2026-10-18T18:00:00+05:30"
            tournamentName="Valorant: Clash of Radiants"
          />
        </div>

        {/* Action Buttons with Cyber Angles */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto mb-14">
          <a
            href="#tournaments"
            onMouseEnter={() => cyberSound.playHover()}
            onClick={() => cyberSound.playClick()}
            className="w-full sm:w-auto px-8 py-3.5 cyber-cut font-extrabold uppercase tracking-wider text-xs sm:text-sm text-white bg-gradient-to-r from-[#e51d36] to-[#b80d22] hover:from-[#ff2a44] hover:to-[#e51d36] transition-all duration-300 shadow-[0_0_25px_rgba(229,29,54,0.5)] hover:shadow-[0_0_40px_rgba(229,29,54,0.8)] flex items-center justify-center gap-2 group"
          >
            <Swords className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>Explore Tournaments</span>
            <ChevronDown className="w-4 h-4" />
          </a>

          <a
            href={siteConfig.socials.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => cyberSound.playHover()}
            onClick={() => cyberSound.playLaunch()}
            className="w-full sm:w-auto px-7 py-3.5 cyber-cut font-bold uppercase tracking-wider text-xs sm:text-sm text-gray-200 bg-black/70 hover:bg-black/90 border border-green-500/40 hover:border-green-400 transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2 group"
          >
            <WhatsAppIcon className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
            <span>WhatsApp Channel</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>

          <a
            href={siteConfig.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => cyberSound.playHover()}
            onClick={() => cyberSound.playLaunch()}
            className="w-full sm:w-auto px-6 py-3.5 cyber-cut font-bold uppercase tracking-wider text-xs sm:text-sm text-gray-200 bg-black/70 hover:bg-black/90 border border-pink-500/40 hover:border-pink-400 transition-all duration-300 shadow-[0_0_15px_rgba(236,72,153,0.2)] hover:shadow-[0_0_25px_rgba(236,72,153,0.4)] flex items-center justify-center gap-2 group"
          >
            <InstagramIcon className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
            <span>Instagram</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>
        </div>

        {/* Guild Live Stats with HUD Corner Brackets */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 w-full max-w-3xl pt-4">
          <div
            className="relative bg-black/60 border border-gray-800 rounded-xl p-4 backdrop-blur-md hover:border-[#e51d36]/60 transition-all group"
            onMouseEnter={() => cyberSound.playHover()}
          >
            <span className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-[#e51d36]" />
            <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-[#e51d36]" />
            <div className="flex items-center justify-center gap-2 text-[#e51d36] mb-1">
              <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-xl sm:text-2xl font-black text-white font-mono">₹50,000+</span>
            </div>
            <p className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400">
              Prize Vault Awarded
            </p>
          </div>

          <div
            className="relative bg-black/60 border border-gray-800 rounded-xl p-4 backdrop-blur-md hover:border-[#e51d36]/60 transition-all group"
            onMouseEnter={() => cyberSound.playHover()}
          >
            <span className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-[#e51d36]" />
            <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-[#e51d36]" />
            <div className="flex items-center justify-center gap-2 text-[#e51d36] mb-1">
              <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-xl sm:text-2xl font-black text-white font-mono">1,500+</span>
            </div>
            <p className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400">
              Registered Gamers
            </p>
          </div>

          <div
            className="col-span-2 md:col-span-1 relative bg-black/60 border border-gray-800 rounded-xl p-4 backdrop-blur-md hover:border-[#e51d36]/60 transition-all group"
            onMouseEnter={() => cyberSound.playHover()}
          >
            <span className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-[#e51d36]" />
            <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-[#e51d36]" />
            <div className="flex items-center justify-center gap-2 text-[#e51d36] mb-1">
              <Zap className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-xl sm:text-2xl font-black text-white font-mono">20+</span>
            </div>
            <p className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400">
              Annual Tournaments
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
