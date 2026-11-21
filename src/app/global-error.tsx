"use client";

import React, { useEffect } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical root error caught by global error boundary:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#060709] text-gray-100 flex items-center justify-center p-4 antialiased">
        <div className="max-w-md w-full bg-[#0d0f17] border border-red-600/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-600/30 flex items-center justify-center mx-auto mb-5 text-red-500">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
            Critical Arena Failure
          </h1>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            A critical system error occurred. Please reload to restore connection.
          </p>

          <button
            onClick={() => reset()}
            className="w-full min-h-[44px] py-3 px-5 rounded-xl font-bold uppercase tracking-wider text-xs text-white bg-[#ff1e38] hover:bg-[#e0162f] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Arena</span>
          </button>
        </div>
      </body>
    </html>
  );
}
