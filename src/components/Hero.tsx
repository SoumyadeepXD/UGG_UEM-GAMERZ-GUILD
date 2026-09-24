"use client";

import React from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { InstagramIcon, WhatsAppIcon } from "@/components/SocialIcons";
import { Trophy, Users, Swords, ChevronDown, ExternalLink } from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background with the custom PC Hardware Image and Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={siteConfig.assets.heroBg}
          alt="UGG Arena Background"
          fill
          priority
          className="object-cover object-center opacity-55 scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Dark vignette and red atmospheric gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/60 to-[#08090d]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#08090d]/70 to-[#08090d]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#e51d36]/15 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Guild Tag Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-[#e51d36]/40 backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(229,29,54,0.3)] animate-pulse">
          <span className="w-2 h-2 rounded-full bg-[#e51d36] inline-block animate-ping" />
          <span className="text-xs uppercase tracking-widest font-extrabold text-white">
            Official Gaming Guild of UEM Kolkata
          </span>
        </div>

        {/* Logo Emblem Presentation */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-6 p-2 rounded-2xl bg-black/70 border border-[#e51d36]/50 shadow-[0_0_35px_rgba(229,29,54,0.45)] backdrop-blur-sm flex items-center justify-center group hover:scale-105 transition-transform duration-300">
          <Image
            src={siteConfig.assets.logo}
            alt="UGG Logo"
            width={120}
            height={120}
            priority
            className="object-contain filter drop-shadow-[0_0_12px_rgba(229,29,54,0.8)]"
          />
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase mb-4 leading-none">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
            UEMK GAMERZ
          </span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#e51d36] via-[#ff2a44] to-[#ff5c72] drop-shadow-[0_0_30px_rgba(229,29,54,0.6)]">
            GUILD
          </span>
        </h1>

        {/* Tagline */}
        <p className="max-w-2xl text-base sm:text-lg text-gray-300 font-medium mb-8 leading-relaxed">
          The ultimate collegiate arena for competitive gamers. Compete in Valorant, BGMI, EA FC, and inter-university showdowns. Represent your campus, take the crown.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto mb-14">
          <a
            href="#tournaments"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm text-white bg-gradient-to-r from-[#e51d36] to-[#b80d22] hover:from-[#ff2a44] hover:to-[#e51d36] transition-all duration-300 shadow-[0_0_25px_rgba(229,29,54,0.45)] hover:shadow-[0_0_35px_rgba(229,29,54,0.8)] flex items-center justify-center gap-2 group"
          >
            <Swords className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>Upcoming Tournaments</span>
            <ChevronDown className="w-4 h-4" />
          </a>

          <a
            href={siteConfig.socials.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm text-gray-200 bg-black/60 hover:bg-black/80 border border-green-500/40 hover:border-green-400 transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2 group"
          >
            <WhatsAppIcon className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
            <span>WhatsApp Channel</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>

          <a
            href={siteConfig.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm text-gray-200 bg-black/60 hover:bg-black/80 border border-pink-500/40 hover:border-pink-400 transition-all duration-300 shadow-[0_0_15px_rgba(236,72,153,0.2)] hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] flex items-center justify-center gap-2 group"
          >
            <InstagramIcon className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
            <span>Instagram</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>
        </div>

        {/* Guild Live Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-3xl pt-6 border-t border-gray-800/80">
          <div className="bg-black/40 border border-gray-800/60 rounded-xl p-4 backdrop-blur-sm hover:border-[#e51d36]/40 transition-colors">
            <div className="flex items-center justify-center gap-2 text-[#e51d36] mb-1">
              <Trophy className="w-5 h-5" />
              <span className="text-2xl font-black text-white">₹50,000+</span>
            </div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-400">
              Prizes Awarded
            </p>
          </div>

          <div className="bg-black/40 border border-gray-800/60 rounded-xl p-4 backdrop-blur-sm hover:border-[#e51d36]/40 transition-colors">
            <div className="flex items-center justify-center gap-2 text-[#e51d36] mb-1">
              <Users className="w-5 h-5" />
              <span className="text-2xl font-black text-white">1,500+</span>
            </div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-400">
              Active Gamers
            </p>
          </div>

          <div className="col-span-2 md:col-span-1 bg-black/40 border border-gray-800/60 rounded-xl p-4 backdrop-blur-sm hover:border-[#e51d36]/40 transition-colors">
            <div className="flex items-center justify-center gap-2 text-[#e51d36] mb-1">
              <Swords className="w-5 h-5" />
              <span className="text-2xl font-black text-white">20+</span>
            </div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-400">
              Annual Tournaments
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
