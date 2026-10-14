"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Tournament } from "@/types/tournament";
import { getTournaments } from "@/lib/events";
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
} from "lucide-react";

export default function EventSlider() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "upcoming">("all");
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

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

      // Estimate active card index for dot indicators
      const cardWidth = clientWidth * 0.85;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(index, filteredTournaments.length - 1));
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [tournaments]);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { clientWidth } = sliderRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.85 : clientWidth * 0.85;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  const scrollToCard = (index: number) => {
    if (sliderRef.current) {
      const cards = sliderRef.current.children;
      if (cards[index]) {
        (cards[index] as HTMLElement).scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
      }
    }
  };

  const handleRegisterClick = (url: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const filteredTournaments = tournaments.filter((t) => {
    if (activeFilter === "all") return true;
    return t.status === activeFilter;
  });

  return (
    <section id="tournaments" className="relative py-16 sm:py-24 bg-[#08090f] border-t border-b border-white/[0.08] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#ff1e38]/10 border border-[#ff1e38]/20 text-[#ff1e38] text-[11px] font-bold uppercase tracking-wider mb-2">
              <Flame className="w-3.5 h-3.5" />
              <span>Campus Tournaments</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Upcoming <span className="text-[#ff1e38]">Showdowns</span>
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-lg">
              Swipe to explore active brackets. Tap to open the Google Form and register your squad.
            </p>
          </div>

          {/* Filter Pills & Desktop Arrow Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
            {/* Filter Buttons */}
            <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/10 text-xs font-bold">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeFilter === "all"
                    ? "bg-[#ff1e38] text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter("active")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeFilter === "active"
                    ? "bg-[#ff1e38] text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Live
              </button>
              <button
                onClick={() => setActiveFilter("upcoming")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeFilter === "upcoming"
                    ? "bg-[#ff1e38] text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Upcoming
              </button>
            </div>

            {/* Desktop Navigation Arrows */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className={`p-2 rounded-xl border border-white/10 transition-all ${
                  canScrollLeft
                    ? "bg-white/[0.04] text-white hover:bg-white/[0.08]"
                    : "opacity-30 text-gray-600 cursor-not-allowed"
                }`}
                aria-label="Previous event"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className={`p-2 rounded-xl border border-white/10 transition-all ${
                  canScrollRight
                    ? "bg-white/[0.04] text-white hover:bg-white/[0.08]"
                    : "opacity-30 text-gray-600 cursor-not-allowed"
                }`}
                aria-label="Next event"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sliding Panels Carousel Container */}
        {loading ? (
          <div className="h-72 flex flex-col items-center justify-center text-gray-400 gap-3">
            <RefreshCw className="w-7 h-7 animate-spin text-[#ff1e38]" />
            <p className="text-xs font-semibold">Loading tournament schedule...</p>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="py-12 text-center bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <Gamepad2 className="w-10 h-10 text-[#ff1e38] mx-auto mb-2 opacity-50" />
            <h3 className="text-base font-bold text-white">No tournaments in this category</h3>
            <p className="text-gray-400 text-xs mt-1">Check back soon or join our WhatsApp community.</p>
          </div>
        ) : (
          <div>
            {/* Horizontal Scroll Track (Mobile Peek Calibrated: w-[86vw] on phone, snap-start) */}
            <div
              ref={sliderRef}
              onScroll={checkScroll}
              className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory scroll-smooth"
            >
              {filteredTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  onClick={() => handleRegisterClick(tournament.formUrl)}
                  className="group relative flex-none w-[86vw] max-w-[360px] sm:max-w-[380px] snap-start bg-[#12141c] hover:bg-[#161822] border border-white/10 hover:border-[#ff1e38]/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-xl flex flex-col"
                >
                  {/* Poster Image Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/60">
                    <Image
                      src={tournament.posterUrl}
                      alt={tournament.title}
                      fill
                      sizes="(max-width: 640px) 86vw, 380px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12141c] via-[#12141c]/40 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                      {tournament.status === "active" ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/80 backdrop-blur-md text-emerald-400 border border-emerald-500/40 badge-glow-green">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Registration Open
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/80 backdrop-blur-md text-amber-400 border border-amber-500/40">
                          <Clock className="w-3 h-3" />
                          Upcoming
                        </span>
                      )}
                    </div>

                    {/* Game Category Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#ff1e38] text-white shadow-md">
                        {tournament.game}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Date & Schedule */}
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2 font-medium">
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <Calendar className="w-3.5 h-3.5 text-[#ff1e38]" />
                          <span>{tournament.date}</span>
                        </div>
                        {tournament.platform && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-gray-300 font-semibold">
                            {tournament.platform}
                          </span>
                        )}
                      </div>

                      {/* Tournament Title */}
                      <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#ff1e38] transition-colors leading-snug line-clamp-1 mb-2">
                        {tournament.title}
                      </h3>

                      {/* Short Description */}
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-4">
                        {tournament.description}
                      </p>

                      {/* Prize & Format Highlight Box */}
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-black/40 border border-white/[0.06] mb-4">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-400 block">
                            Prize Pool
                          </span>
                          <div className="flex items-center gap-1 text-white font-extrabold text-xs sm:text-sm mt-0.5">
                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                            <span className="truncate text-amber-300 font-mono font-bold">
                              {tournament.prizePool}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-400 block">
                            Format
                          </span>
                          <div className="flex items-center gap-1 text-white font-bold text-xs sm:text-sm mt-0.5">
                            <Users className="w-3.5 h-3.5 text-[#ff1e38]" />
                            <span className="truncate">{tournament.format}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Direct Registration Button */}
                    <div className="pt-1">
                      <button
                        onClick={(e) => handleRegisterClick(tournament.formUrl, e)}
                        className="w-full min-h-[46px] py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs text-white bg-gradient-to-r from-[#ff1e38] to-[#d90429] hover:from-[#ff334b] hover:to-[#ff1e38] transition-all flex items-center justify-center gap-2 btn-glow-red"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Register on Google Form</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
                      </button>
                      <p className="text-[10px] text-center text-gray-400 mt-1.5">
                        Tap anywhere on card to open form
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Dot Indicators */}
            <div className="flex sm:hidden items-center justify-center gap-1.5 mt-4">
              {filteredTournaments.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToCard(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    activeIndex === idx ? "w-6 bg-[#ff1e38]" : "w-1.5 bg-white/20"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
