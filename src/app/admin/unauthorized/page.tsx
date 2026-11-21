import React from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { ShieldX, ArrowLeft, LogOut } from "lucide-react";

export const metadata = {
  title: "Access Restricted | UGG",
  robots: {
    index: false,
    follow: false,
  },
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#08090d] flex items-center justify-center p-4 relative overflow-hidden text-gray-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#11131a] border border-red-500/30 rounded-3xl p-8 sm:p-10 shadow-[0_0_50px_rgba(239,68,68,0.15)] text-center">
        <div className="w-16 h-16 rounded-2xl bg-black/60 border border-red-500/30 p-2 mx-auto mb-6 flex items-center justify-center shadow-lg">
          <Image
            src={siteConfig.assets.logo}
            alt="UGG"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-950/60 border border-red-500/40 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-4">
          <ShieldX className="w-3.5 h-3.5" />
          <span>ACCESS DENIED // 403 FORBIDDEN</span>
        </div>

        <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
          Coordinator Clearance Required
        </h1>

        <p className="text-xs text-gray-400 leading-relaxed mb-8">
          You are authenticated, but your account lacks authorized coordinator credentials for the UEMK Gamerz Guild tournament management system.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <form action="/auth/logout" method="POST" className="w-full sm:w-auto">
            <button
              type="submit"
              aria-label="Sign out of coordinator portal"
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs text-red-300 bg-red-950/40 border border-red-900/60 hover:bg-red-900/50 transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>

          <Link
            href="/"
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
