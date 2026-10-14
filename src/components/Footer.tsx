"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import {
  InstagramIcon,
  DiscordIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from "@/components/SocialIcons";
import { Shield, ArrowUp, Heart } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#050608] border-t border-white/[0.08] text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 p-1 flex items-center justify-center">
                <Image
                  src={siteConfig.assets.logo}
                  alt="UGG Emblem"
                  width={34}
                  height={34}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-black text-lg text-white tracking-wider block">
                  {siteConfig.name}
                </span>
                <span className="text-[11px] font-bold text-[#ff1e38] uppercase tracking-wider block">
                  {siteConfig.fullName}
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              The official gaming and collegiate esports guild of University of Engineering & Management, Kolkata. Organizing high-stakes tournaments, LAN events, and competitive scrims.
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 hover:border-pink-500 hover:text-pink-400 flex items-center justify-center text-gray-300 transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.socials.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 hover:border-indigo-500 hover:text-indigo-400 flex items-center justify-center text-gray-300 transition-colors"
                aria-label="Discord"
              >
                <DiscordIcon className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 hover:border-emerald-500 hover:text-emerald-400 flex items-center justify-center text-gray-300 transition-colors"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 hover:border-red-500 hover:text-red-400 flex items-center justify-center text-gray-300 transition-colors"
                aria-label="YouTube"
              >
                <YouTubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#home" className="hover:text-white transition-colors">
                  Home Arena
                </a>
              </li>
              <li>
                <a href="#tournaments" className="hover:text-white transition-colors">
                  Upcoming Tournaments
                </a>
              </li>
              <li>
                <a href="#community" className="hover:text-white transition-colors">
                  Social Channels
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About UGG
                </a>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-[#ff1e38] transition-colors flex items-center gap-1.5 text-gray-400 hover:text-white font-semibold pt-1"
                >
                  <Shield className="w-3.5 h-3.5 text-[#ff1e38]" />
                  Coordinator Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* University Info & Back to Top */}
          <div className="flex flex-col justify-between">
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
                Affiliation
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                University of Engineering & Management (UEM), Kolkata Campus, Action Area III, New Town, West Bengal.
              </p>
            </div>

            <div className="pt-4 sm:pt-6">
              <button
                onClick={scrollToTop}
                className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white flex items-center justify-center gap-2 transition-all font-semibold"
              >
                <ArrowUp className="w-3.5 h-3.5 text-[#ff1e38]" />
                <span>Back to Top</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-10 sm:mt-12 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-gray-500 text-[11px]">
          <p>© {new Date().getFullYear()} UGG (UEMK GAMERZ GUILD). All rights reserved.</p>
          <p className="flex items-center justify-center gap-1">
            Engineered with <Heart className="w-3 h-3 text-[#ff1e38] fill-[#ff1e38]" /> for UEMK Gamers
          </p>
        </div>
      </div>
    </footer>
  );
}
