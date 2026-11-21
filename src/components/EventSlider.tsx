"use client";

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Tournament } from "@/types/tournament";
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

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const SLIDE_MS = 5000;
const MIN_SWIPE_PX = 45;

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getReducedMotionServer = () => false; // identical to first client render, so no hydration mismatch

export default function EventSlider({ initialTournaments = [] }: EventSliderProps) {
  const tournaments = initialTournaments;
  const count = tournaments.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedIds, setFailedIds] = useState<Set<string>>(() => new Set());

  // Separate pause sources so one never overrides another
  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [touchPaused, setTouchPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getReducedMotionServer
  );
  const paused = userPaused || hoverPaused || focusPaused || touchPaused || reducedMotion;

  const touchRef = useRef<{ x: number; y: number } | null>(null);

  // Keep index valid if the list shrinks
  const safeIndex = count > 0 ? Math.min(currentIndex, count - 1) : 0;

  const goNext = useCallback(() => {
    if (count > 0) setCurrentIndex((safeIndex + 1) % count);
  }, [count, safeIndex]);

  const goPrev = useCallback(() => {
    if (count > 0) setCurrentIndex((safeIndex - 1 + count) % count);
  }, [count, safeIndex]);

  // Autoplay: one timeout per slide, never runs while any pause source is active
  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = setTimeout(goNext, SLIDE_MS);
    return () => clearTimeout(timer);
  }, [count, paused, safeIndex, goNext]);

  const markFailed = (id: string) =>
    setFailedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
    setTouchPaused(true);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    setTouchPaused(false);
    const start = touchRef.current;
    touchRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = start.x - t.clientX;
    const dy = start.y - t.clientY;
    // Horizontal swipes only, so vertical page scrolling never changes slides
    if (Math.abs(dx) > MIN_SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) goNext();
      else goPrev();
    }
  };

  const onTouchCancel = () => {
    touchRef.current = null;
    setTouchPaused(false);
  };

  const onRegionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  };

  const current = count > 0 ? tournaments[safeIndex] : null;
  const validRegistrationUrl =
    current && isValidRegistrationUrl(current.formUrl) ? current.formUrl : null;
  const posterFailed = current ? failedIds.has(current.id) : false;

  const iconBtn =
    "min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white transition-all shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff1e38] flex items-center justify-center";

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

            {count > 1 && (
              <div className="flex items-center gap-2">
                {/* Pause/Play is visible on ALL screen sizes; hidden only if the OS requests reduced motion (autoplay is off) */}
                {!reducedMotion && (
                  <button
                    type="button"
                    onClick={() => setUserPaused((p) => !p)}
                    className={iconBtn}
                    aria-label={userPaused ? "Play tournament auto-slide" : "Pause tournament auto-slide"}
                    title={userPaused ? "Play auto-slide" : "Pause auto-slide"}
                  >
                    {userPaused ? (
                      <Play className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Pause className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={goPrev}
                  className={`hidden sm:flex ${iconBtn}`}
                  aria-label="Previous Tournament"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className={`hidden sm:flex ${iconBtn}`}
                  aria-label="Next Tournament"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Empty State */}
        {!current ? (
          <div className="h-[360px] sm:h-[420px] rounded-3xl bg-[#0f1118] border border-white/10 flex flex-col items-center justify-center text-center p-6 gap-3">
            <Trophy className="w-12 h-12 text-[#ff1e38]/60" />
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              No Showdowns Currently Scheduled
            </h3>
            <p className="text-xs text-gray-300 max-w-md">
              Upcoming campus tournaments and scrim registrations will appear here. Follow our Discord or
              WhatsApp channels for the latest announcements.
            </p>
          </div>
        ) : (
          <ScrollReveal direction="scale" delay={120}>
            <div
              className="flex flex-col gap-4"
              role="region"
              aria-roledescription="carousel"
              aria-label="Featured Tournaments Carousel"
              onKeyDown={onRegionKeyDown}
              onMouseEnter={() => setHoverPaused(true)}
              onMouseLeave={() => setHoverPaused(false)}
              onFocus={() => setFocusPaused(true)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusPaused(false);
              }}
            >
              {/* Slide: not interactive itself; the Register link is the only action, so no keyboard conflicts */}
              <div
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchCancel}
                role="group"
                aria-roledescription="slide"
                aria-label={`${safeIndex + 1} of ${count}: ${current.title}`}
                aria-live={paused ? "polite" : "off"}
                style={{ touchAction: "pan-y" }}
                className="group relative w-full h-[510px] sm:h-[520px] rounded-3xl overflow-hidden bg-black border border-white/10 hover:border-[#ff1e38]/50 transition-all duration-300 shadow-2xl flex flex-col justify-end"
              >
                {/* Slide timer bar */}
                <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-white/15 z-30 overflow-hidden pointer-events-none">
                  <div
                    key={safeIndex}
                    className={`h-full bg-gradient-to-r from-[#ff1e38] via-[#ff4d61] to-[#ff1e38] shadow-[0_0_12px_rgba(255,30,56,0.9)] ${
                      paused ? "w-full opacity-40" : "animate-slide-timer"
                    }`}
                  />
                </div>

                {/* Poster */}
                <div className="absolute inset-0 z-0">
                  {!posterFailed ? (
                    <Image
                      key={current.id}
                      src={current.posterUrl}
                      alt={current.title}
                      fill
                      priority={safeIndex === 0}
                      sizes="(max-width: 768px) 100vw, 1200px"
                      onError={() => markFailed(current.id)}
                      className="object-cover object-center transition-all duration-700 ease-out scale-100 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0a0c14] to-black flex flex-col items-center justify-center text-gray-400 gap-2">
                      <ImageOff className="w-10 h-10 text-gray-500" />
                      <span className="text-xs font-bold uppercase tracking-wider">Official Tournament Poster</span>
                    </div>
                  )}
                  <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 via-45% to-transparent pointer-events-none" />
                </div>

                {/* Mobile prev/next */}
                <button
                  type="button"
                  onClick={goPrev}
                  className="sm:hidden absolute left-3 top-1/2 -translate-y-1/2 z-20 min-h-[44px] min-w-[44px] rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff1e38]"
                  aria-label="Previous Tournament Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="sm:hidden absolute right-3 top-1/2 -translate-y-1/2 z-20 min-h-[44px] min-w-[44px] rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff1e38]"
                  aria-label="Next Tournament Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Top bar: status + game + counter */}
                <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-2">
                    {current.status === "active" ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/80 backdrop-blur-md text-emerald-400 border border-emerald-500/40 badge-glow-green">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Registration Live
                      </span>
                    ) : current.status === "upcoming" ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/80 backdrop-blur-md text-amber-400 border border-amber-500/40">
                        <Clock className="w-3 h-3" />
                        Upcoming
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/80 backdrop-blur-md text-gray-300 border border-white/20">
                        Completed
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ff1e38] text-white shadow-md">
                      {current.game}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-gray-300">
                    {String(safeIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                  </span>
                </div>

                {/* Details */}
                <div className="relative z-10 p-5 sm:p-8 flex flex-col gap-3.5 max-w-3xl">
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
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 border border-white/15 text-gray-300">
                        <Monitor className="w-3.5 h-3.5" />
                        <span>{current.platform}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-md">
                    {current.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl line-clamp-2">
                    {current.description}
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {current.status === "completed" ? (
                      <div className="min-h-[48px] px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm text-gray-300 bg-white/[0.04] border border-white/10 flex items-center justify-center">
                        Registration Closed
                      </div>
                    ) : validRegistrationUrl ? (
                      <a
                        href={validRegistrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[48px] px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm text-white bg-gradient-to-r from-[#ff1e38] to-[#d90429] hover:from-[#ff334b] hover:to-[#ff1e38] transition-all flex items-center justify-center gap-2 btn-glow-red shadow-lg active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Register on Google Form</span>
                        <ExternalLink className="w-4 h-4 ml-1 opacity-90" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    ) : (
                      <div className="min-h-[48px] px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm text-gray-300 bg-white/[0.04] border border-white/10 flex items-center justify-center">
                        Registration link coming soon
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile dots */}
              <div className="flex sm:hidden items-center justify-center gap-1 w-full py-1">
                {tournaments.map((t, idx) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff1e38] rounded-full"
                    aria-label={`Jump to tournament slide ${idx + 1}`}
                    aria-current={safeIndex === idx ? "true" : undefined}
                  >
                    <span
                      className={`h-2 rounded-full transition-all duration-300 ${
                        safeIndex === idx ? "w-8 bg-[#ff1e38]" : "w-2.5 bg-white/40"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Desktop thumbnails */}
              <div className="hidden sm:grid grid-cols-3 gap-3 w-full">
                {tournaments.map((t, idx) => {
                  const isActive = safeIndex === idx;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      aria-current={isActive ? "true" : undefined}
                      className={`min-h-[64px] relative p-3 rounded-2xl text-left transition-all duration-300 flex items-center gap-3 border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff1e38] ${
                        isActive
                          ? "bg-[#141622] border-[#ff1e38] shadow-[0_0_20px_rgba(255,30,56,0.25)]"
                          : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <div className="relative w-14 h-12 rounded-xl overflow-hidden bg-black shrink-0 flex items-center justify-center">
                        {failedIds.has(t.id) ? (
                          <ImageOff className="w-5 h-5 text-gray-500" />
                        ) : (
                          <Image
                            src={t.posterUrl}
                            alt=""
                            fill
                            sizes="60px"
                            loading="lazy"
                            onError={() => markFailed(t.id)}
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff1e38] block truncate">
                          {t.game}
                        </span>
                        <h4 className="text-xs font-black text-white truncate">{t.title}</h4>
                        <span className="text-[10px] text-gray-300 block truncate">{t.date}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}