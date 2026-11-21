import React from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { ArrowLeft, Flame, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "404 - Sector Not Found | UGG",
  description: "The requested esports tournament or sector does not exist.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060709] text-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff1e38]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg bg-[#0e1017] border border-white/10 rounded-3xl p-8 sm:p-12 shadow-[0_0_50px_rgba(255,30,56,0.15)] text-center">
        {/* Logo emblem */}
        <div className="w-16 h-16 rounded-2xl bg-black/60 border border-white/10 p-2 mx-auto mb-6 flex items-center justify-center shadow-lg">
          <Image
            src={siteConfig.assets.logo}
            alt="UGG Emblem"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>

        {/* 404 HUD Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#ff1e38]/15 border border-[#ff1e38]/30 text-[#ff1e38] text-[11px] font-mono font-bold uppercase tracking-wider mb-4">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>ERROR 404 // SIGNAL LOST</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-2">
          Sector <span className="text-[#ff1e38]">Not Found</span>
        </h1>

        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-8 max-w-md mx-auto">
          The requested coordinate or tournament arena does not exist, has expired, or is currently restricted under Phase 1 security protocol.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs text-white bg-gradient-to-r from-[#ff1e38] to-[#d90429] hover:from-[#ff334b] hover:to-[#ff1e38] transition-all flex items-center justify-center gap-2 btn-glow-red shadow-lg active:scale-98 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Arena</span>
          </Link>

          <Link
            href="/#tournaments"
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff1e38]"
          >
            <Flame className="w-4 h-4 text-[#ff1e38]" />
            <span>View Tournaments</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
