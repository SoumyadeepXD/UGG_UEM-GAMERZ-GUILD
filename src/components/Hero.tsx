"use client";

import React from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { InstagramIcon, WhatsAppIcon, DiscordIcon } from "@/components/SocialIcons";
import {
  Trophy,
  Users,
  Swords,
  ChevronDown,
  ExternalLink,
  Flame,
  ArrowRight,
} from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative pt-24 pb-14 sm:pt-32 sm:pb-20 overflow-hidden esports-mesh">
      {/* Background PC Hardware with dark vignette */}
      <div className="absolute inset-0 z-0">
        <Image
          src={siteConfig.assets.heroBg}
          alt="UGG Arena Background"
          fill
          priority
          className="object-cover object-center opacity-30 sm:opacity-40"
        />
        {/* Gradients to ensure 100% text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060709]/80 via-[#060709]/90 to-[#060709]" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#ff1e38]/15 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* University Official Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md mb-5">
          <span className="w-2 h-2 rounded-full bg-[#ff1e38] animate-ping" />
          <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-gray-200">
            Official Gaming Guild of UEM Kolkata
          </span>
        </div>

        {/* Emblem Showcase */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute -inset-3 bg-[#ff1e38]/25 rounded-3xl blur-xl" />
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 p-3 rounded-2xl bg-[#0e1017] border border-white/10 shadow-2xl flex items-center justify-center">
            <Image
              src={siteConfig.assets.logo}
              alt="UGG Emblem"
              width={95}
              height={95}
              priority
              className="object-contain drop-shadow-[0_4px_12px_rgba(255,30,56,0.6)]"
            />
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase mb-3 text-white leading-tight">
          <span className="block text-white">UEMK GAMERZ</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ff1e38] via-[#ff3b53] to-[#ff6b7e]">
            GUILD
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-xl text-xs sm:text-base text-gray-400 font-medium mb-6 leading-relaxed px-2">
          The collegiate esports battleground of UEM Kolkata. Compete in Valorant, BGMI, and EA FC tournaments, join scrim lobbies, and claim campus glory.
        </p>

        {/* Mobile-First Quick Social Bar (One-Tap Row on Phone) */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full max-w-md mb-6">
          <a
            href={siteConfig.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-200 hover:text-white transition-all text-xs font-bold"
          >
            <InstagramIcon className="w-4 h-4 text-pink-400" />
            <span className="truncate">Instagram</span>
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </a>

          <a
            href={siteConfig.socials.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-200 hover:text-white transition-all text-xs font-bold"
          >
            <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
            <span className="truncate">WhatsApp</span>
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </a>

          <a
            href={siteConfig.socials.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-200 hover:text-white transition-all text-xs font-bold"
          >
            <DiscordIcon className="w-4 h-4 text-indigo-400" />
            <span className="truncate">Discord</span>
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </a>
        </div>

        {/* Live Active Tournament Spotlight Card (Direct Registration Shortcut) */}
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSc_dummy_valorant_form/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-md p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#171a24] to-[#12141c] border border-[#ff1e38]/30 hover:border-[#ff1e38] transition-all duration-300 text-left mb-6 group shadow-lg flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#ff1e38]/15 border border-[#ff1e38]/30 flex items-center justify-center text-[#ff1e38] shrink-0 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#ff1e38]">
                  Registration Live
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h4 className="text-xs sm:text-sm font-black text-white truncate">
                Valorant: Clash of Radiants
              </h4>
              <p className="text-[11px] text-gray-400 truncate">
                Prize: <strong className="text-amber-400">₹10,000</strong> • 5v5 Inter-College
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#ff1e38] text-white text-xs font-bold shrink-0 flex items-center gap-1 group-hover:bg-[#ff334b] transition-colors">
            <span>Register</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

        {/* Main CTA */}
        <div className="w-full max-w-md mb-10">
          <a
            href="#tournaments"
            className="w-full py-3.5 px-6 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm text-white bg-gradient-to-r from-[#ff1e38] to-[#d90429] hover:from-[#ff334b] hover:to-[#ff1e38] transition-all btn-glow-red flex items-center justify-center gap-2"
          >
            <Swords className="w-4 h-4" />
            <span>Explore All Tournaments</span>
            <ChevronDown className="w-4 h-4" />
          </a>
        </div>

        {/* Guild Live Stats Grid (Compact on Phone) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-md">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 text-center">
            <span className="text-base sm:text-xl font-black text-white block">₹50K+</span>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Prizes
            </span>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 text-center">
            <span className="text-base sm:text-xl font-black text-white block">1,500+</span>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Gamers
            </span>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 text-center">
            <span className="text-base sm:text-xl font-black text-white block">20+</span>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Tourneys
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
