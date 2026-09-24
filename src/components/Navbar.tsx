"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Menu, X, Shield, ExternalLink, Gamepad2 } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#08090d]/85 backdrop-blur-md border-b border-[#e51d36]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 flex items-center justify-center p-1 rounded-lg bg-black/60 border border-[#e51d36]/30 group-hover:border-[#e51d36] transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(229,29,54,0.5)]">
            <Image
              src={siteConfig.assets.logo}
              alt="UGG Emblem"
              width={38}
              height={38}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-wider text-white group-hover:text-[#e51d36] transition-colors">
                UGG
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#e51d36]/15 text-[#e51d36] border border-[#e51d36]/30">
                Official
              </span>
            </div>
            <span className="text-[11px] font-semibold tracking-wider text-gray-400 group-hover:text-gray-300 transition-colors uppercase">
              UEMK Gamerz Guild
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-300">
          <a href="#home" className="hover:text-[#e51d36] transition-colors py-1">
            Home
          </a>
          <a href="#tournaments" className="hover:text-[#e51d36] transition-colors py-1">
            Tournaments
          </a>
          <a href="#community" className="hover:text-[#e51d36] transition-colors py-1">
            Community
          </a>
          <a href="#about" className="hover:text-[#e51d36] transition-colors py-1">
            About Guild
          </a>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded-md border border-gray-800 hover:border-[#e51d36]/50 bg-black/40 transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-[#e51d36]" />
            Admin
          </Link>
        </nav>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href={siteConfig.socials.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="relative group overflow-hidden px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#e51d36] to-[#b80d22] hover:from-[#ff2a44] hover:to-[#e51d36] transition-all duration-300 shadow-[0_0_20px_rgba(229,29,54,0.4)] hover:shadow-[0_0_25px_rgba(229,29,54,0.7)] flex items-center gap-2"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Join Discord</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-lg text-gray-400 hover:text-white border border-gray-800"
          >
            <Shield className="w-4 h-4 text-[#e51d36]" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-400 hover:text-white border border-gray-800 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#08090d]/95 backdrop-blur-xl border-b border-[#e51d36]/20 px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3 font-semibold text-gray-200">
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#e51d36] py-2 border-b border-gray-800/60"
            >
              Home
            </a>
            <a
              href="#tournaments"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#e51d36] py-2 border-b border-gray-800/60"
            >
              Upcoming Tournaments
            </a>
            <a
              href="#community"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#e51d36] py-2 border-b border-gray-800/60"
            >
              Socials & Channels
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#e51d36] py-2 border-b border-gray-800/60"
            >
              About UGG
            </a>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-[#e51d36]"
            >
              <Shield className="w-4 h-4" />
              Event Admin Portal
            </Link>
          </div>
          <div className="pt-2">
            <a
              href={siteConfig.socials.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-lg text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#e51d36] to-[#b80d22] flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(229,29,54,0.4)]"
            >
              <Gamepad2 className="w-4 h-4" />
              Join Discord Server
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
