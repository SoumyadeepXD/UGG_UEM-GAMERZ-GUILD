"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Structured console error log for client monitoring
    console.error("Application error captured by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#060709] text-gray-100 flex items-center justify-center p-4">
      <div className="relative max-w-md w-full bg-[#0d0f17] border border-red-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(255,30,56,0.2)]">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5 text-[#ff1e38]">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
          System Glitch Detected
        </h1>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          An unexpected error interrupted your session. Our esports engineering team has been notified.
        </p>

        {error.digest && (
          <div className="mb-6 p-2.5 rounded-xl bg-black/60 border border-white/10 text-[10px] font-mono text-gray-400 select-all">
            Error Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full min-h-[44px] py-3 px-5 rounded-xl font-bold uppercase tracking-wider text-xs text-white bg-gradient-to-r from-[#ff1e38] to-[#b80d22] hover:from-[#ff334b] hover:to-[#ff1e38] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full min-h-[44px] py-3 px-5 rounded-xl font-bold uppercase tracking-wider text-xs text-gray-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all flex items-center justify-center gap-2 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Home className="w-4 h-4" />
            <span>Back to Arena</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
