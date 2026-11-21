"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Tournament } from "@/types/tournament";
import { initialTournaments as fallbackTournaments } from "@/data/initialTournaments";
import { isValidRegistrationUrl } from "@/lib/validations/urlAllowlist";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trophy,
  ExternalLink,
  Flame,
  Users,
  Clock,
  Sparkles,
  Monitor,
  Pause,
  Play,
  ImageOff,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

interface EventSliderProps {
  initialTournaments?: Tournament[];
}

export default function EventSlider({ initialTournaments = [] }: EventSliderProps) {
  const tournaments = initialTournaments.length > 0 ? initialTournaments : fallbackTournaments;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });
  const [failedSlideIndex, setFailedSlideIndex] = useState<number | null>(null);
  const posterError = failedSlideIndex === currentIndex;

  // Touch Swipe tracking for Mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Honor prefers-reduced-motion dynamically when user system preference changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setIsPaused(true);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Auto-play slideshow every 5.0 seconds
  useEffect(() => {
    if (tournaments.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tournaments.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [tournaments.length, isPaused, currentIndex]);

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

  const current = tournaments[currentIndex] || tournaments[0];
  const validRegistrationUrl = current && isValidRegistrationUrl(current.formUrl) ? current.formUrl : null;

  const handleCardClick = () => {
    if (validRegistrationUrl) {
      window.open(validRegistrationUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section
      id="tournaments"
      aria-label="Tournaments Arena"
      className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 bg-[#060709] border-b border-white/[0.08] overflow-hidden"
    >
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

            {/* Prev/Next arrows & Play/Pause for desktop & tablet (min 44px tap target) */}
            {tournaments.length > 1 && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white transition-all shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff1e38] flex items-center justify-center"
                  aria-label={isPaused ? "Play tournament auto-slide" : "Pause tournament auto-slide"}
                  title={isPaused ? "Play auto-slide" : "Pause auto-slide"}
                >
                  {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                </button>
                <button
                  onClick={handlePrev}
                  className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white transition-all shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff1e38] flex items-center justify-center"
                  aria-label="Previous Tournament"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white transition-all shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff1e38] flex items-center justify-center"
                  aria-label="Next Tournament"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Empty State */}
        {tournaments.length === 0 ? (
          <div className="h-[360px] sm:h-[420px] rounded-3xl bg-[#0f1118] border border-white/10 flex flex-col items-center justify-center text-center p-6 gap-3">
            <Trophy className="w-12 h-12 text-[#ff1e38]/60" />
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              No Showdowns Currently Scheduled
            </h3>
            <p className="text-xs text-gray-400 max-w-md">
              Upcoming campus tournaments and scrim registrations will appear here. Follow our Discord or WhatsApp channels for the latest announcements.
            </p>
          </div>
        ) : (
          /* Carousel Region */
          <ScrollReveal direction="scale" delay={120}>
            <div
              className="flex flex-col gap-4"
              role="region"
              aria-roledescription="carousel"
              aria-label="Featured Tournaments Carousel"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Main Full-Bleed Poster Carousel Card */}
              <div
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onClick={handleCardClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick();
                  }
                }}
                tabIndex={0}
                role="group"
                aria-roledescription="slide"
                aria-label={`${currentIndex + 1} of ${tournaments.length}: ${current.title}`}
                className="group relative w-full h-[510px] sm:h-[520px] rounded-3xl overflow-hidden bg-black border border-white/10 hover:border-[#ff1e38]/50 transition-all duration-300 shadow-2xl cursor-pointer flex flex-col justify-end focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff1e38]"
              >
                {/* 5-Second Slide Timer Bar along top edge of event window */}
                <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-white/15 z-30 overflow-hidden pointer-events-none">
                  <div
                    key={currentIndex}
                    className={`h-full bg-gradient-to-r from-[#ff1e38] via-[#ff4d61] to-[#ff1e38] shadow-[0_0_12px_rgba(255,30,56,0.9)] ${
                      isPaused ? "w-full opacity-40" : "animate-slide-timer"
                    }`}
                  />
                </div>

                {/* Poster Image (Fills the entire slide, prioritized for fast LCP with safe onError fallback) */}
                <div className="absolute inset-0 z-0">
                  {!posterError ? (
                    <Image
                      key={current.id}
                      src={current.posterUrl}
                      alt={current.title}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 1200px"
                      onError={() => setFailedSlideIndex(currentIndex)}
                      className="object-cover object-center transition-all duration-700 ease-out scale-100 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0a0c14] to-black flex flex-col items-center justify-center text-gray-500 gap-2">
                      <ImageOff className="w-10 h-10 text-gray-700" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Official Tournament Poster</span>
                    </div>
                  )}

                  {/* Top Subtle Gradient for Top Badges */}
                  <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />

                  {/* Solid Deep Black Gradient from Bottom Upwards */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 via-45% to-transparent pointer-events-none" />
                </div>

                {/* Floating Prev / Next on Mobile (min 44px tap target) */}
                <button
                  onClick={handlePrev}
                  className="sm:hidden absolute left-3 top-1/2 -translate-y-1/2 z-20 min-h-[44px] min-w-[44px] rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff1e38]"
                  aria-label="Previous Tournament Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="sm:hidden absolute right-3 top-1/2 -translate-y-1/2 z-20 min-h-[44px] min-w-[44px] rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff1e38]"
                  aria-label="Next Tournament Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Top Bar inside Slide: Status + Game Badge + Slide Counter */}
                <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
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

                {/* Event Details Content */}
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
                        <Monitor className="w-3.5 h-3.5" />
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

                  {/* Registration Action: Semantic validated external link */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {validRegistrationUrl ? (
                      <a
                        href={validRegistrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="min-h-[48px] px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm text-white bg-gradient-to-r from-[#ff1e38] to-[#d90429] hover:from-[#ff334b] hover:to-[#ff1e38] transition-all flex items-center justify-center gap-2 btn-glow-red shadow-lg active:scale-98 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Register on Google Form</span>
                        <ExternalLink className="w-4 h-4 ml-1 opacity-90" />
                      </a>
                    ) : (
                      <div className="min-h-[48px] px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm text-gray-400 bg-white/[0.04] border border-white/10 flex items-center justify-center gap-2">
                        <span>Registration Link Verification Pending</span>
                      </div>
                    )}

                    <span className="text-[11px] text-gray-400 text-center sm:text-left font-medium">
                      Tap to open official verified registration form ↗
                    </span>
                  </div>
                </div>
              </div>

              {/* Carousel Thumbnails & Progress Bar (Desktop & Mobile) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                {/* Mobile Slide Indicator Dots: Guaranteed 44px minimum tap target */}
                <div className="flex sm:hidden items-center justify-center gap-1 w-full py-1">
                  {tournaments.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff1e38] rounded-full"
                      aria-label={`Jump to tournament slide ${idx + 1}`}
                      aria-current={currentIndex === idx ? "true" : undefined}
                    >
                      <span
                        className={`h-2 rounded-full transition-all duration-300 ${
                          currentIndex === idx ? "w-8 bg-[#ff1e38]" : "w-2.5 bg-white/30"
                        }`}
                      />
                    </button>
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
                        className={`min-h-[64px] relative p-3 rounded-2xl text-left transition-all duration-300 flex items-center gap-3 border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff1e38] ${
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
                            loading="lazy"
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
