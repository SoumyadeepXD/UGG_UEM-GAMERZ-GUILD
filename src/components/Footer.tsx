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
import {
  Shield,
  ArrowUp,
  Heart,
} from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#050608] border-t border-gray-900 text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-black/60 border border-[#e51d36]/30 p-1 flex items-center justify-center">
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
                <span className="text-[11px] font-bold text-[#e51d36] uppercase tracking-wider block">
                  {siteConfig.fullName}
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              The premier gaming and collegiate esports guild of University of Engineering & Management, Kolkata. Organizing high-tier tournaments, LAN battles, and fostering competitive excellence.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#12141e] border border-gray-800 hover:border-pink-500 hover:text-pink-400 flex items-center justify-center text-gray-300 transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.socials.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#12141e] border border-gray-800 hover:border-indigo-500 hover:text-indigo-400 flex items-center justify-center text-gray-300 transition-colors"
                aria-label="Discord"
              >
                <DiscordIcon className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#12141e] border border-gray-800 hover:border-green-500 hover:text-green-400 flex items-center justify-center text-gray-300 transition-colors"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#12141e] border border-gray-800 hover:border-red-500 hover:text-red-400 flex items-center justify-center text-gray-300 transition-colors"
                aria-label="YouTube"
              >
                <YouTubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#home" className="hover:text-[#e51d36] transition-colors">
                  Home Arena
                </a>
              </li>
              <li>
                <a href="#tournaments" className="hover:text-[#e51d36] transition-colors">
                  Upcoming Tournaments
                </a>
              </li>
              <li>
                <a href="#community" className="hover:text-[#e51d36] transition-colors">
                  Socials & Communities
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#e51d36] transition-colors">
                  About the Guild
                </a>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#e51d36] transition-colors flex items-center gap-1.5 text-gray-500 hover:text-gray-300">
                  <Shield className="w-3 h-3 text-[#e51d36]" />
                  Coordinator Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* University Info & Back to Top */}
          <div className="flex flex-col justify-between">
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
                Affiliation
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                University of Engineering & Management (UEM), Kolkata Campus, New Town, West Bengal.
              </p>
            </div>

            <div className="pt-6">
              <button
                onClick={scrollToTop}
                className="w-full py-2.5 px-4 rounded-xl bg-[#12141e] hover:bg-[#161826] border border-gray-800 hover:border-[#e51d36]/60 text-gray-300 hover:text-white flex items-center justify-center gap-2 transition-all font-semibold"
              >
                <ArrowUp className="w-3.5 h-3.5 text-[#e51d36]" />
                <span>Back to Top</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-6 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-gray-500 text-[11px]">
          <p>© {new Date().getFullYear()} UGG (UEMK GAMERZ GUILD). All rights reserved.</p>
          <p className="flex items-center justify-center gap-1">
            Engineered with <Heart className="w-3 h-3 text-[#e51d36] fill-[#e51d36]" /> for UEMK Gamers
          </p>
        </div>
      </div>
    </footer>
  );
}
