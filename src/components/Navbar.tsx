"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cyberSound } from "@/lib/cyberSound";
import { Menu, X, Shield, ExternalLink, Gamepad2, Volume2, VolumeX } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(cyberSound.getMuted());
  }, []);

  const handleToggleSound = () => {
    const newState = cyberSound.toggleMute();
    setIsMuted(newState);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#08090d]/85 backdrop-blur-md border-b border-[#e51d36]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          onMouseEnter={() => cyberSound.playHover()}
          onClick={() => cyberSound.playClick()}
        >
          <div className="relative w-11 h-11 flex items-center justify-center p-1 rounded-xl bg-black/70 border border-[#e51d36]/40 group-hover:border-[#e51d36] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(229,29,54,0.6)]">
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
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#e51d36]/15 text-[#e51d36] border border-[#e51d36]/30">
                v2.0
              </span>
            </div>
            <span className="text-[11px] font-semibold tracking-wider text-gray-400 group-hover:text-gray-300 transition-colors uppercase">
              UEMK Gamerz Guild
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-mono font-bold uppercase tracking-wider text-gray-300">
          <a
            href="#home"
            className="hover:text-[#e51d36] transition-colors py-1 relative group"
            onMouseEnter={() => cyberSound.playHover()}
            onClick={() => cyberSound.playClick()}
          >
            // 01 Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#e51d36] transition-all duration-300 group-hover:w-full" />
          </a>
          <a
            href="#tournaments"
            className="hover:text-[#e51d36] transition-colors py-1 relative group"
            onMouseEnter={() => cyberSound.playHover()}
            onClick={() => cyberSound.playClick()}
          >
            // 02 Tournaments
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#e51d36] transition-all duration-300 group-hover:w-full" />
          </a>
          <a
            href="#community"
            className="hover:text-[#e51d36] transition-colors py-1 relative group"
            onMouseEnter={() => cyberSound.playHover()}
            onClick={() => cyberSound.playClick()}
          >
            // 03 Community
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#e51d36] transition-all duration-300 group-hover:w-full" />
          </a>
          <a
            href="#about"
            className="hover:text-[#e51d36] transition-colors py-1 relative group"
            onMouseEnter={() => cyberSound.playHover()}
            onClick={() => cyberSound.playClick()}
          >
            // 04 Guild
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#e51d36] transition-all duration-300 group-hover:w-full" />
          </a>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white px-2.5 py-1 rounded-md border border-gray-800 hover:border-[#e51d36]/50 bg-black/50 transition-all"
            onMouseEnter={() => cyberSound.playHover()}
            onClick={() => cyberSound.playClick()}
          >
            <Shield className="w-3.5 h-3.5 text-[#e51d36]" />
            <span>Admin</span>
          </Link>
        </nav>

        {/* Action Controls & Sound Toggle */}
        <div className="hidden md:flex items-center gap-3">
          {/* Cyber SFX Button */}
          <button
            onClick={handleToggleSound}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/60 border border-gray-800 hover:border-[#e51d36]/50 text-gray-400 hover:text-white text-xs font-mono transition-all group"
            title={isMuted ? "Enable Cyber SFX" : "Mute Cyber SFX"}
            aria-label="Toggle Sound"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-gray-500" />
                <span className="text-[10px] text-gray-500">SFX OFF</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#e51d36]" />
                <div className="flex items-end gap-0.5 h-3.5">
                  <span className="w-0.5 bg-[#e51d36] h-2 animate-pulse" />
                  <span className="w-0.5 bg-[#e51d36] h-3 animate-pulse" style={{ animationDelay: "150ms" }} />
                  <span className="w-0.5 bg-[#e51d36] h-1.5 animate-pulse" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">SFX ON</span>
              </>
            )}
          </button>

          {/* Join Discord CTA */}
          <a
            href={siteConfig.socials.discord}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => cyberSound.playHover()}
            onClick={() => cyberSound.playLaunch()}
            className="relative px-5 py-2.5 cyber-cut-sm text-xs font-extrabold uppercase tracking-wider text-white bg-gradient-to-r from-[#e51d36] to-[#b80d22] hover:from-[#ff2a44] hover:to-[#e51d36] transition-all duration-300 shadow-[0_0_20px_rgba(229,29,54,0.45)] hover:shadow-[0_0_30px_rgba(229,29,54,0.8)] flex items-center gap-2 group"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Join Discord</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>

        {/* Mobile menu trigger & sound */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-lg bg-black/50 border border-gray-800 text-gray-400 hover:text-white"
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-gray-500" /> : <Volume2 className="w-4 h-4 text-[#e51d36]" />}
          </button>
          <Link
            href="/admin"
            className="p-2 rounded-lg text-gray-400 hover:text-white border border-gray-800"
          >
            <Shield className="w-4 h-4 text-[#e51d36]" />
          </Link>
          <button
            onClick={() => {
              cyberSound.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="p-2 rounded-lg text-gray-400 hover:text-white border border-gray-800 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#08090d]/95 backdrop-blur-xl border-b border-[#e51d36]/30 px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3 font-mono font-bold text-xs uppercase tracking-wider text-gray-200">
            <a
              href="#home"
              onClick={() => {
                cyberSound.playClick();
                setMobileMenuOpen(false);
              }}
              className="hover:text-[#e51d36] py-2 border-b border-gray-800/60"
            >
              // 01 Home Arena
            </a>
            <a
              href="#tournaments"
              onClick={() => {
                cyberSound.playClick();
                setMobileMenuOpen(false);
              }}
              className="hover:text-[#e51d36] py-2 border-b border-gray-800/60"
            >
              // 02 Upcoming Tournaments
            </a>
            <a
              href="#community"
              onClick={() => {
                cyberSound.playClick();
                setMobileMenuOpen(false);
              }}
              className="hover:text-[#e51d36] py-2 border-b border-gray-800/60"
            >
              // 03 Socials & Channels
            </a>
            <a
              href="#about"
              onClick={() => {
                cyberSound.playClick();
                setMobileMenuOpen(false);
              }}
              className="hover:text-[#e51d36] py-2 border-b border-gray-800/60"
            >
              // 04 About Guild
            </a>
            <Link
              href="/admin"
              onClick={() => {
                cyberSound.playClick();
                setMobileMenuOpen(false);
              }}
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
              onClick={() => cyberSound.playLaunch()}
              className="w-full py-3 cyber-cut-sm text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#e51d36] to-[#b80d22] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(229,29,54,0.5)]"
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
