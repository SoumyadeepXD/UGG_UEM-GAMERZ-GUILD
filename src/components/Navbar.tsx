"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { InstagramIcon, WhatsAppIcon, DiscordIcon } from "@/components/SocialIcons";
import { Menu, X, Shield, ExternalLink, Gamepad2, ChevronRight } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#060709]/90 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-black/60 border border-white/10 group-hover:border-[#ff1e38]/60 transition-all p-1">
            <Image
              src={siteConfig.assets.logo}
              alt="UGG Emblem"
              width={34}
              height={34}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-wide text-white group-hover:text-[#ff1e38] transition-colors">
                UGG
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#ff1e38]/15 text-[#ff1e38] border border-[#ff1e38]/30">
                UEMK
              </span>
            </div>
            <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase -mt-0.5 hidden xs:block">
              Gamerz Guild
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-gray-300">
          <a href="#tournaments" className="hover:text-white transition-colors py-1">
            Tournaments
          </a>
          <a href="#community" className="hover:text-white transition-colors py-1">
            Socials
          </a>
          <a href="#about" className="hover:text-white transition-colors py-1">
            About Guild
          </a>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 hover:border-[#ff1e38]/50 bg-white/[0.03] transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-[#ff1e38]" />
            <span>Admin</span>
          </Link>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Quick Discord CTA (Desktop) */}
          <a
            href={siteConfig.socials.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#ff1e38] to-[#d90429] hover:from-[#ff334b] hover:to-[#ff1e38] transition-all btn-glow-red"
          >
            <DiscordIcon className="w-4 h-4" />
            <span>Join Discord</span>
          </a>

          {/* Quick WhatsApp Pill (Mobile & Desktop) */}
          <a
            href={siteConfig.socials.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 transition-colors"
            aria-label="WhatsApp"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">WhatsApp</span>
          </a>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white bg-white/[0.04] border border-white/10 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Clean Sheet Overlay) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#060709]/98 backdrop-blur-2xl border-b border-white/[0.1] px-5 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1 text-sm font-bold text-gray-200">
            <a
              href="#tournaments"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.05] transition-colors text-[#ff1e38]"
            >
              <div className="flex items-center gap-2">
                <span>Tournaments</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#ff1e38]/20 text-[#ff1e38]">
                  Live
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </a>
            <a
              href="#community"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <span>Community & Channels</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <span>About Guild</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </a>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/[0.03] border border-white/10 text-gray-300 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#ff1e38]" />
                <span>Admin Coordinator Portal</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </Link>
          </div>

          {/* Mobile Socials Direct Strip */}
          <div className="pt-2 border-t border-white/[0.08] flex items-center gap-2">
            <a
              href={siteConfig.socials.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl font-bold uppercase tracking-wider text-xs text-white bg-gradient-to-r from-[#ff1e38] to-[#d90429] flex items-center justify-center gap-2 shadow-lg"
            >
              <DiscordIcon className="w-4 h-4" />
              <span>Discord</span>
            </a>
            <a
              href={siteConfig.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/[0.05] border border-white/10 text-pink-400 hover:bg-white/[0.1] flex items-center justify-center"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>
            <a
              href={siteConfig.socials.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/[0.05] border border-white/10 text-emerald-400 hover:bg-white/[0.1] flex items-center justify-center"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
