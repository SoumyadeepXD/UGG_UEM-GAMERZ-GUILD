"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Tournament } from "@/types/tournament";
import { getTournaments } from "@/lib/events";
import { cyberSound } from "@/lib/cyberSound";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trophy,
  ExternalLink,
  Flame,
  Gamepad2,
  Users,
  Clock,
  Sparkles,
  RefreshCw,
  Crosshair,
} from "lucide-react";

export default function EventSlider() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "upcoming">("all");
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const loadData = async () => {
    setLoading(true);
    const data = await getTournaments();
    setTournaments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      const totalScrollable = scrollWidth - clientWidth;
      if (totalScrollable > 0) {
        setScrollProgress((scrollLeft / totalScrollable) * 100);
      }
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [tournaments]);

  const scroll = (direction: "left" | "right") => {
    cyberSound.playClick();
    if (sliderRef.current) {
      const { clientWidth } = sliderRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 350);
    }
  };

  const handleRegisterClick = (url: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    cyberSound.playLaunch();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const filteredTournaments = tournaments.filter((t) => {
    if (activeFilter === "all") return true;
    return t.status === activeFilter;
  });

  return (
    <section id="tournaments" className="relative py-24 bg-[#08090d] border-t border-b border-gray-800/80 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 gaming-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#e51d36]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-red-950/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#e51d36]/15 border border-[#e51d36]/30 text-[#e51d36] text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <Crosshair className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "10s" }} />
              <span>// SYSTEM_PROTOCOL: ARENA_TOURNAMENTS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              Collegiate <span className="text-[#e51d36] glow-text-red">Showdowns</span>
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-xl font-mono">
              Swipe or slide through live tournament brackets. Direct submission into Google Forms.
            </p>
          </div>

          {/* Filter Pills & Slider Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center p-1 rounded-xl bg-black/70 border border-gray-800 font-mono">
              <button
                onClick={() => {
                  cyberSound.playClick();
                  setActiveFilter("all");
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeFilter === "all"
                    ? "bg-[#e51d36] text-white shadow-[0_0_15px_rgba(229,29,54,0.6)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                All (0{tournaments.length})
              </button>
              <button
                onClick={() => {
                  cyberSound.playClick();
                  setActiveFilter("active");
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeFilter === "active"
                    ? "bg-[#e51d36] text-white shadow-[0_0_15px_rgba(229,29,54,0.6)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Live Now
              </button>
              <button
                onClick={() => {
                  cyberSound.playClick();
                  setActiveFilter("upcoming");
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeFilter === "upcoming"
                    ? "bg-[#e51d36] text-white shadow-[0_0_15px_rgba(229,29,54,0.6)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Upcoming
              </button>
            </div>

            {/* Slider Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className={`p-2.5 rounded-xl border transition-all ${
                  canScrollLeft
                    ? "bg-black/70 border-gray-700 text-white hover:border-[#e51d36] hover:bg-[#e51d36]/20 shadow-[0_0_10px_rgba(229,29,54,0.2)]"
                    : "bg-black/20 border-gray-800 text-gray-600 cursor-not-allowed"
                }`}
                aria-label="Previous events"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className={`p-2.5 rounded-xl border transition-all ${
                  canScrollRight
                    ? "bg-black/70 border-gray-700 text-white hover:border-[#e51d36] hover:bg-[#e51d36]/20 shadow-[0_0_10px_rgba(229,29,54,0.2)]"
                    : "bg-black/20 border-gray-800 text-gray-600 cursor-not-allowed"
                }`}
                aria-label="Next events"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sliding Panels Carousel Container */}
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-gray-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#e51d36]" />
            <p className="text-xs font-mono tracking-wider uppercase">Loading Tactical Grid...</p>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="py-16 text-center bg-black/40 border border-gray-800/80 rounded-2xl p-8">
            <Gamepad2 className="w-12 h-12 text-[#e51d36] mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-white uppercase font-mono">No Tournaments Deployed</h3>
            <p className="text-gray-400 text-xs mt-1">Check back soon or join Discord for scrim announcements.</p>
          </div>
        ) : (
          <div>
            <div
              ref={sliderRef}
              onScroll={checkScroll}
              className="flex items-stretch gap-6 overflow-x-auto pb-6 pt-2 scroll-smooth no-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {filteredTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  onMouseEnter={() => cyberSound.playHover()}
                  onClick={() => handleRegisterClick(tournament.formUrl)}
                  className="group relative flex-none w-[310px] sm:w-[380px] md:w-[410px] snap-start bg-[#10121a] hover:bg-[#151824] border border-gray-800 hover:border-[#e51d36] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_0_35px_rgba(229,29,54,0.45)] flex flex-col"
                >
                  {/* Decorative corner reticle */}
                  <span className="absolute top-2 right-2 z-20 text-[10px] font-mono text-[#e51d36]/60 group-hover:text-[#e51d36] transition-colors">
                    [+]
                  </span>

                  {/* Poster Image Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/80">
                    <Image
                      src={tournament.posterUrl}
                      alt={tournament.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 410px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#10121a] via-[#10121a]/30 to-transparent" />
                    <div className="absolute inset-0 scanline opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                      {tournament.status === "active" ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider bg-black/80 backdrop-blur-md text-emerald-400 border border-emerald-500/50 shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Registration Live
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider bg-black/80 backdrop-blur-md text-amber-400 border border-amber-500/50 shadow-lg">
                          <Clock className="w-3 h-3" />
                          Upcoming Clash
                        </span>
                      )}
                    </div>

                    {/* Game Tag Badge */}
                    <div className="absolute top-3 right-8 z-10">
                      <span className="px-2.5 py-1 cyber-cut-sm text-[10px] font-mono font-extrabold uppercase tracking-wider bg-[#e51d36] text-white shadow-[0_0_12px_rgba(229,29,54,0.7)]">
                        {tournament.game}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Date & Platform */}
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2 font-mono font-medium">
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <Calendar className="w-3.5 h-3.5 text-[#e51d36]" />
                          <span>{tournament.date}</span>
                        </div>
                        {tournament.platform && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-gray-300">
                            {tournament.platform}
                          </span>
                        )}
                      </div>

                      {/* Tournament Title */}
                      <h3 className="text-xl font-black text-white group-hover:text-[#e51d36] transition-colors leading-snug line-clamp-1 mb-2 font-sans uppercase">
                        {tournament.title}
                      </h3>

                      {/* Short Description */}
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-4 font-sans">
                        {tournament.description}
                      </p>

                      {/* Highlights HUD Box */}
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-black/50 border border-gray-800/80 mb-4 font-mono">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-500 block">
                            Prize Vault
                          </span>
                          <div className="flex items-center gap-1 text-white font-black text-xs sm:text-sm mt-0.5">
                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                            <span className="truncate">{tournament.prizePool}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-500 block">
                            Format
                          </span>
                          <div className="flex items-center gap-1 text-white font-bold text-xs sm:text-sm mt-0.5">
                            <Users className="w-3.5 h-3.5 text-[#e51d36]" />
                            <span className="truncate">{tournament.format}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="pt-2">
                      <button
                        onClick={(e) => handleRegisterClick(tournament.formUrl, e)}
                        className="w-full py-3 px-4 cyber-cut text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#e51d36] to-[#b80d22] group-hover:from-[#ff2a44] group-hover:to-[#e51d36] transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(229,29,54,0.35)] group-hover:shadow-[0_0_25px_rgba(229,29,54,0.7)]"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Register via Google Form</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <p className="text-[10px] text-center text-gray-500 mt-2 font-mono">
                        // Direct redirect to Google Form application
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Slider Progress Bar (Cross-device indicator) */}
            <div className="mt-4 max-w-md mx-auto flex items-center gap-3">
              <span className="text-[10px] font-mono text-gray-500">01</span>
              <div className="flex-1 h-1 bg-gray-900 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-[#e51d36] shadow-[0_0_8px_rgba(229,29,54,0.8)] transition-all duration-150"
                  style={{ width: `${Math.max(15, scrollProgress)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-gray-500">0{tournaments.length}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
