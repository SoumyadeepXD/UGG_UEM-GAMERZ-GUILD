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
  Monitor,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function EventSlider() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Touch Swipe tracking for Mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getTournaments();
      setTournaments(data);
      setLoading(false);
    };
    loadData();
  }, []);

  // Auto-play slideshow every 5.5 seconds
  useEffect(() => {
    if (tournaments.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tournaments.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [tournaments.length, isPaused]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + tournaments.length) % tournaments.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % tournaments.length);
  };

  // Touch handlers for mobile swipe
  const minSwipeDistance = 45;
  const onTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    setIsPaused(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  const current = tournaments[currentIndex];

  const handleRegister = (url: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="tournaments" className="relative py-14 sm:py-20 bg-[#060709] border-t border-b border-white/[0.08] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <ScrollReveal direction="up" delay={50}>
          <div className="flex items-end justify-between mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#ff1e38]/10 border border-[#ff1e38]/20 text-[#ff1e38] text-[11px] font-bold uppercase tracking-wider mb-2">
                <Flame className="w-3.5 h-3.5" />
                <span>Tournaments Arena</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                Featured <span className="text-[#ff1e38]">Showdowns</span>
              </h2>
            </div>

            {/* Prev/Next arrows for desktop & tablet */}
            {tournaments.length > 1 && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white transition-all shadow-md active:scale-95"
                  aria-label="Previous Tournament"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white transition-all shadow-md active:scale-95"
                  aria-label="Next Tournament"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Loading State */}
        {loading || !current ? (
          <div className="h-[460px] sm:h-[500px] rounded-3xl bg-[#0f1118] border border-white/10 flex flex-col items-center justify-center text-gray-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#ff1e38]" />
            <p className="text-xs font-semibold">Loading tournament carousel...</p>
          </div>
        ) : (
          <ScrollReveal direction="scale" delay={120}>
            <div
              className="flex flex-col gap-4"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
            {/* Main Full-Bleed Poster Carousel Card */}
            <div
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onClick={() => handleRegister(current.formUrl)}
              className="group relative w-full h-[510px] sm:h-[520px] rounded-3xl overflow-hidden bg-black border border-white/10 hover:border-[#ff1e38]/50 transition-all duration-300 shadow-2xl cursor-pointer flex flex-col justify-end"
            >
              {/* Poster Image (Fills the entire slide) */}
              <div className="absolute inset-0 z-0">
                <Image
                  key={current.id}
                  src={current.posterUrl}
                  alt={current.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover object-center transition-all duration-700 ease-out scale-100 group-hover:scale-105"
                />

                {/* Top Subtle Gradient for Top Badges */}
                <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />

                {/* Solid Deep Black Gradient from Bottom Upwards (Makes text 100% sharp!) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 via-45% to-transparent pointer-events-none" />
              </div>

              {/* Floating Prev / Next on Mobile (Small subtle side tap areas) */}
              <button
                onClick={handlePrev}
                className="sm:hidden absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="sm:hidden absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Top Bar inside Slide: Status + Game Badge + Slide Counter */}
              <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {current.status === "active" ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/80 backdrop-blur-md text-emerald-400 border border-emerald-500/40 badge-glow-green">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Registration Live
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/80 backdrop-blur-md text-amber-400 border border-amber-500/40">
                      <Clock className="w-3 h-3" />
                      Upcoming
                    </span>
                  )}

                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ff1e38] text-white shadow-md">
                    {current.game}
                  </span>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-gray-300">
                  {String(currentIndex + 1).padStart(2, "0")} / {String(tournaments.length).padStart(2, "0")}
                </span>
              </div>

              {/* Event Details Content (Anchored over the rich black gradient at the bottom) */}
              <div className="relative z-10 p-5 sm:p-8 flex flex-col gap-3.5 max-w-3xl">
                {/* Meta Badges Strip */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/15 text-gray-200">
                    <Calendar className="w-3.5 h-3.5 text-[#ff1e38]" />
                    <span>{current.date}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-amber-500/30 text-amber-300 font-bold">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{current.prizePool}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/15 text-gray-300">
                    <Users className="w-3.5 h-3.5 text-[#ff1e38]" />
                    <span>{current.format}</span>
                  </div>

                  {current.platform && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 border border-white/15 text-gray-400">
                      <Monitor className="w-3 h-3" />
                      <span>{current.platform}</span>
                    </div>
                  )}
                </div>

                {/* Tournament Main Title */}
                <h3 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-md">
                  {current.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl line-clamp-2">
                  {current.description}
                </p>

                {/* Registration Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={(e) => handleRegister(current.formUrl, e)}
                    className="min-h-[48px] px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm text-white bg-gradient-to-r from-[#ff1e38] to-[#d90429] hover:from-[#ff334b] hover:to-[#ff1e38] transition-all flex items-center justify-center gap-2 btn-glow-red shadow-lg active:scale-98"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Register on Google Form</span>
                    <ExternalLink className="w-4 h-4 ml-1 opacity-90" />
                  </button>

                  <span className="text-[11px] text-gray-400 text-center sm:text-left font-medium">
                    Tap to open official registration form ↗
                  </span>
                </div>
              </div>
            </div>

            {/* Carousel Thumbnails & Progress Bar (Desktop & Mobile) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              {/* Mobile Slide Indicator Dots */}
              <div className="flex sm:hidden items-center justify-center gap-2 w-full py-1">
                {tournaments.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentIndex === idx ? "w-8 bg-[#ff1e38]" : "w-2 bg-white/20"
                    }`}
                    aria-label={`Jump to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Desktop Interactive Thumbnail Strip */}
              <div className="hidden sm:grid grid-cols-3 gap-3 w-full">
                {tournaments.map((tourney, idx) => {
                  const isActive = currentIndex === idx;
                  return (
                    <button
                      key={tourney.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative p-3 rounded-2xl text-left transition-all duration-300 flex items-center gap-3 border ${
                        isActive
                          ? "bg-[#141622] border-[#ff1e38] shadow-[0_0_20px_rgba(255,30,56,0.25)]"
                          : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="relative w-14 h-12 rounded-xl overflow-hidden bg-black shrink-0">
                        <Image
                          src={tourney.posterUrl}
                          alt={tourney.title}
                          fill
                          sizes="60px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff1e38] block truncate">
                          {tourney.game}
                        </span>
                        <h4 className="text-xs font-black text-white truncate">
                          {tourney.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 block truncate">
                          {tourney.date}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
