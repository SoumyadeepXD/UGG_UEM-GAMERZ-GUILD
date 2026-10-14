"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Tournament, TournamentStatus, HeroSpotlight } from "@/types/tournament";
import {
  getTournaments,
  saveTournamentsLocally,
  parseGoogleSheetCsv,
  getHeroSpotlight,
  saveHeroSpotlight,
  defaultSpotlight,
} from "@/lib/events";
import { initialTournaments } from "@/data/initialTournaments";
import { cyberSound } from "@/lib/cyberSound";
import {
  Shield,
  KeyRound,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  Trophy,
  CheckCircle,
  FileSpreadsheet,
  Download,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Eye,
  EyeOff,
  LogOut,
  Layers,
  Gamepad2,
  Clock,
  Users,
  Flame,
  ArrowRight,
  Radio,
} from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [spotlight, setSpotlight] = useState<HeroSpotlight>(defaultSpotlight);
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetStatus, setSheetStatus] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // New Tournament Form State
  const [formData, setFormData] = useState<Omit<Tournament, "id">>({
    title: "",
    game: "Valorant",
    posterUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
    date: "",
    time: "6:00 PM IST",
    prizePool: "₹5,000 + Trophies",
    format: "5v5 Single Elimination",
    platform: "PC",
    description: "",
    formUrl: "https://forms.google.com",
    status: "active",
  });

  useEffect(() => {
    // Check session
    const sessionAuth = sessionStorage.getItem("ugg_admin_auth");
    if (sessionAuth === "true") {
      setIsAuthenticated(true);
    }

    // Load current events and hero spotlight
    const loadEvents = async () => {
      const data = await getTournaments();
      setTournaments(data);
      setSpotlight(getHeroSpotlight());
      const savedSheet = localStorage.getItem(siteConfig.admin.sheetUrlKey) || "";
      setSheetUrl(savedSheet);
    };
    loadEvents();
  }, []);

  const handleSaveSpotlight = (e: React.FormEvent) => {
    e.preventDefault();
    cyberSound.playLaunch();
    saveHeroSpotlight(spotlight);
    setSaveSuccessMessage("Hero Spotlight updated & live on homepage!");
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleSetTournamentAsSpotlight = (t: Tournament) => {
    cyberSound.playLaunch();
    const updated: HeroSpotlight = {
      id: t.id,
      badge: t.status === "active" ? "Registration Live" : "Upcoming Tournament",
      title: t.title,
      prize: t.prizePool,
      subtitle: `${t.format} • ${t.game}`,
      formUrl: t.formUrl,
      isActive: true,
    };
    setSpotlight(updated);
    saveHeroSpotlight(updated);
    setSaveSuccessMessage(`"${t.title}" is now set as the Hero Spotlight!`);
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === siteConfig.admin.defaultPin) {
      cyberSound.playLaunch();
      setIsAuthenticated(true);
      sessionStorage.setItem("ugg_admin_auth", "true");
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    cyberSound.playClick();
    setIsAuthenticated(false);
    sessionStorage.removeItem("ugg_admin_auth");
    setPinInput("");
  };

  const handleAddTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.formUrl) {
      alert("Please fill in Title, Date, and Google Form URL.");
      return;
    }

    cyberSound.playLaunch();
    const newTournament: Tournament = {
      ...formData,
      id: `ugg-${Date.now()}`,
    };

    const updated = [newTournament, ...tournaments];
    setTournaments(updated);
    saveTournamentsLocally(updated);

    // Reset form
    setFormData({
      title: "",
      game: "Valorant",
      posterUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
      date: "",
      time: "6:00 PM IST",
      prizePool: "₹5,000 + Trophies",
      format: "5v5 Single Elimination",
      platform: "PC",
      description: "",
      formUrl: "https://forms.google.com",
      status: "active",
    });

    setSaveSuccessMessage("Tournament published to website!");
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleDeleteTournament = (id: string) => {
    if (confirm("Are you sure you want to remove this tournament?")) {
      cyberSound.playClick();
      const updated = tournaments.filter((t) => t.id !== id);
      setTournaments(updated);
      saveTournamentsLocally(updated);
    }
  };

  const handleStatusChange = (id: string, newStatus: TournamentStatus) => {
    cyberSound.playClick();
    const updated = tournaments.map((t) =>
      t.id === id ? { ...t, status: newStatus } : t
    );
    setTournaments(updated);
    saveTournamentsLocally(updated);
  };

  const handleSyncGoogleSheet = async () => {
    if (!sheetUrl.trim()) {
      localStorage.removeItem(siteConfig.admin.sheetUrlKey);
      setSheetStatus("Cleared Google Sheet URL. Using local tournaments.");
      return;
    }

    setSheetStatus("Syncing with Google Sheet...");
    try {
      const res = await fetch(sheetUrl.trim(), { cache: "no-store" });
      if (!res.ok) throw new Error("Could not reach sheet URL");
      const csv = await res.text();
      const parsed = parseGoogleSheetCsv(csv);
      if (parsed.length > 0) {
        setTournaments(parsed);
        saveTournamentsLocally(parsed);
        localStorage.setItem(siteConfig.admin.sheetUrlKey, sheetUrl.trim());
        setSheetStatus(`Success! Synced ${parsed.length} tournaments from Google Sheet.`);
      } else {
        setSheetStatus("Warning: No valid tournament rows found in CSV.");
      }
    } catch (err: any) {
      setSheetStatus(`Failed to sync: ${err.message || "Invalid CSV URL"}`);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(tournaments, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ugg-tournaments-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleResetToDefaults = () => {
    if (confirm("Reset to default tournaments? This will overwrite local edits.")) {
      setTournaments(initialTournaments);
      saveTournamentsLocally(initialTournaments);
      localStorage.removeItem(siteConfig.admin.sheetUrlKey);
      setSheetUrl("");
      setSheetStatus("Reset to initial defaults.");
    }
  };

  // If Not Authenticated: Render Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#08090d] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 gaming-grid opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff1e38]/15 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-[#12141e] border border-[#ff1e38]/30 rounded-3xl p-8 shadow-[0_0_40px_rgba(229,29,54,0.25)]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-black/60 border border-[#ff1e38]/40 p-2 mx-auto mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(229,29,54,0.4)]">
              <Image
                src={siteConfig.assets.logo}
                alt="UGG"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              UGG Coordinator Portal
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Enter your access passkey to manage tournaments & registration links
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs uppercase font-extrabold tracking-wider text-gray-300 block mb-2">
                Admin Passkey
              </label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter passcode (e.g. ugg2026)"
                  className="w-full bg-black/50 border border-gray-800 focus:border-[#ff1e38] rounded-xl px-4 py-3 text-white text-sm outline-none transition-all pr-12 shadow-inner"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pinError && (
                <p className="text-xs text-red-500 font-semibold mt-2">
                  Incorrect passkey. Default is <code className="bg-black/60 px-1 py-0.5 rounded text-white">{siteConfig.admin.defaultPin}</code>.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs text-white bg-gradient-to-r from-[#ff1e38] to-[#b80d22] hover:from-[#ff2a44] hover:to-[#ff1e38] transition-all duration-300 shadow-[0_0_20px_rgba(229,29,54,0.4)] flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
            </button>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Main Website</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-[#08090d] text-white">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-[#0c0e15]/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 text-[#ff1e38]" />
              <span>Back to Site</span>
            </Link>
            <span className="text-gray-700">|</span>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#ff1e38]" />
              <span className="font-extrabold text-sm tracking-wider uppercase">
                UGG Tournament Manager
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleExportJson}
              className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleResetToDefaults}
              className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-red-900 text-gray-400 hover:text-red-400"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-900/60 text-red-300 hover:bg-red-900/50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Success notification */}
        {saveSuccessMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-bounce">
            <CheckCircle className="w-4 h-4" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* Section 0: Hero Spotlight Card Manager */}
        <section className="bg-[#10121b] border border-[#ff1e38]/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(255,30,56,0.1)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#ff1e38]/20 text-[#ff1e38] flex items-center justify-center shadow-[0_0_15px_rgba(255,30,56,0.4)]">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-wide text-white flex items-center gap-2">
                  <span>Hero Spotlight Event</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold uppercase">
                    Homepage Live
                  </span>
                </h2>
                <p className="text-xs text-gray-400">
                  Control the featured tournament banner and Google Form registration shortcut on the main page.
                </p>
              </div>
            </div>

            {/* Quick Select from Tournaments dropdown */}
            {tournaments.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
                  Quick Pick:
                </span>
                <select
                  onChange={(e) => {
                    const sel = tournaments.find((t) => t.id === e.target.value);
                    if (sel) handleSetTournamentAsSpotlight(sel);
                  }}
                  value={tournaments.find((t) => t.id === spotlight.id || t.title === spotlight.title)?.id || ""}
                  className="bg-black/60 border border-gray-700 hover:border-[#ff1e38] focus:border-[#ff1e38] text-white text-xs rounded-xl px-3 py-2 outline-none"
                >
                  <option value="" disabled>-- Select a Tournament --</option>
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.game})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Edit Form */}
            <form onSubmit={handleSaveSpotlight} className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Badge / Tagline *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Registration Live, Slots Filling Fast"
                    value={spotlight.badge}
                    onChange={(e) => setSpotlight({ ...spotlight, badge: e.target.value })}
                    className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Tournament Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Valorant: Clash of Radiants"
                    value={spotlight.title}
                    onChange={(e) => setSpotlight({ ...spotlight, title: e.target.value })}
                    className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Prize Pool *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹10,000, ₹25,000 + Trophies"
                    value={spotlight.prize}
                    onChange={(e) => setSpotlight({ ...spotlight, prize: e.target.value })}
                    className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Subtitle / Format & Eligibility
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5v5 Inter-College, Squad TPP"
                    value={spotlight.subtitle}
                    onChange={(e) => setSpotlight({ ...spotlight, subtitle: e.target.value })}
                    className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                  Google Form Registration Link *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://docs.google.com/forms/d/e/.../viewform"
                  value={spotlight.formUrl}
                  onChange={(e) => setSpotlight({ ...spotlight, formUrl: e.target.value })}
                  className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={spotlight.isActive}
                    onChange={(e) => setSpotlight({ ...spotlight, isActive: e.target.checked })}
                    className="rounded accent-[#ff1e38] w-4 h-4 cursor-pointer"
                  />
                  <span>Show Spotlight Card on Homepage</span>
                </label>

                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl font-bold uppercase tracking-wider text-xs text-white bg-gradient-to-r from-[#ff1e38] to-[#b80d22] hover:from-[#ff334b] hover:to-[#ff1e38] transition-all duration-300 shadow-[0_0_20px_rgba(255,30,56,0.4)] flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Save Hero Spotlight</span>
                </button>
              </div>
            </form>

            {/* Live Replica Preview */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <span className="text-[11px] uppercase font-bold text-gray-400 tracking-wider mb-2 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#ff1e38] animate-pulse" />
                <span>Live Hero Card Replica</span>
              </span>

              {spotlight.isActive ? (
                <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#171a24] to-[#12141c] border border-[#ff1e38]/50 shadow-[0_0_25px_rgba(255,30,56,0.2)] text-left flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#ff1e38]/15 border border-[#ff1e38]/30 flex items-center justify-center text-[#ff1e38] shrink-0">
                      <Flame className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#ff1e38]">
                          {spotlight.badge || "Registration Live"}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-white truncate">
                        {spotlight.title || "Untitled Tournament"}
                      </h4>
                      <p className="text-[11px] text-gray-400 truncate">
                        {spotlight.prize && (
                          <>
                            Prize: <strong className="text-amber-400">{spotlight.prize}</strong>
                            {spotlight.subtitle ? " • " : ""}
                          </>
                        )}
                        {spotlight.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-[#ff1e38] text-white text-xs font-bold shrink-0 flex items-center gap-1">
                    <span>Register</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-black/40 border border-dashed border-gray-800 text-center text-xs text-gray-500">
                  Spotlight banner is currently hidden. Check the box above to enable.
                </div>
              )}

              <p className="text-[10px] text-gray-500 mt-2 text-center">
                This exact banner renders under the emblem in the Hero section and links to your registration form.
              </p>
            </div>
          </div>
        </section>

        {/* Section 1: Add Event Form with Live Card Preview */}
        <section className="bg-[#10121b] border border-gray-800 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#ff1e38]/15 text-[#ff1e38] flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wide">
                Publish New Tournament
              </h2>
              <p className="text-xs text-gray-400">
                Event will immediately reflect on the public slider and redirect to your Google Form.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Fields */}
            <form onSubmit={handleAddTournament} className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Tournament Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Valorant Winter Cup"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Game / Category *
                  </label>
                  <select
                    value={formData.game}
                    onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                    className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="Valorant">Valorant</option>
                    <option value="BGMI">BGMI</option>
                    <option value="EA Sports FC 25">EA Sports FC 25</option>
                    <option value="Counter-Strike 2">Counter-Strike 2</option>
                    <option value="Rocket League">Rocket League</option>
                    <option value="Call of Duty">Call of Duty</option>
                    <option value="Free Fire">Free Fire</option>
                    <option value="Chess">Chess</option>
                    <option value="Other">Other Esports</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Date & Schedule *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oct 25 - 27, 2026"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Prize Pool
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹10,000 + Trophies"
                    value={formData.prizePool}
                    onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                    className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Format
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5v5 Knockout"
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                  Poster Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or Imgur/Cloud link"
                  value={formData.posterUrl}
                  onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                  className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                  Google Form Registration Link *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://docs.google.com/forms/d/e/.../viewform"
                  value={formData.formUrl}
                  onChange={(e) => setFormData({ ...formData, formUrl: e.target.value })}
                  className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none text-[#ff1e38]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                  Description / Rules Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of bracket rules, requirements, and eligibility..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Registration Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TournamentStatus })}
                    className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="active">Active (Registration Live)</option>
                    <option value="upcoming">Upcoming (Coming Soon)</option>
                    <option value="completed">Completed (Archived)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Platform
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PC, Mobile, PS5"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs text-white bg-gradient-to-r from-[#ff1e38] to-[#b80d22] hover:from-[#ff2a44] hover:to-[#ff1e38] transition-all duration-300 shadow-[0_0_20px_rgba(229,29,54,0.4)] flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Tournament to Site</span>
                </button>
              </div>
            </form>

            {/* Live Preview Card */}
            <div className="lg:col-span-5 bg-black/50 border border-gray-800/80 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                <span className="flex items-center gap-1.5 text-[#ff1e38]">
                  <Eye className="w-4 h-4" />
                  Live Preview
                </span>
                <span className="text-[10px] text-gray-500">As seen on public slider</span>
              </div>

              {/* Exact Preview Card */}
              <div className="bg-[#12141d] border border-[#ff1e38]/60 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(229,29,54,0.25)]">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/70">
                  <img
                    src={formData.posterUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop"}
                    alt="Preview Poster"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop";
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/75 backdrop-blur-md text-emerald-400 border border-emerald-500/40">
                      {formData.status === "active" ? "Registration Live" : "Upcoming"}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#ff1e38] text-white">
                      {formData.game}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#ff1e38]" />
                      {formData.date || "Date TBA"}
                    </span>
                    <span className="bg-gray-800 px-1.5 py-0.5 rounded text-[10px]">
                      {formData.platform || "Platform"}
                    </span>
                  </div>

                  <h4 className="font-black text-white text-base truncate">
                    {formData.title || "Your Tournament Title Here"}
                  </h4>

                  <p className="text-[11px] text-gray-400 line-clamp-2">
                    {formData.description || "Tournament description and bracket format will appear here..."}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-black/40 text-[11px]">
                    <div>
                      <span className="text-[9px] uppercase text-gray-500 block">Prize</span>
                      <span className="font-bold text-amber-400">{formData.prizePool}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-gray-500 block">Format</span>
                      <span className="font-bold text-white">{formData.format}</span>
                    </div>
                  </div>

                  <div className="w-full py-2.5 rounded-lg font-bold uppercase tracking-wider text-[11px] text-white bg-gradient-to-r from-[#ff1e38] to-[#b80d22] text-center flex items-center justify-center gap-1.5">
                    <span>Register via Google Form</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Manage Existing Tournaments */}
        <section className="bg-[#10121b] border border-gray-800 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#ff1e38]/15 text-[#ff1e38] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-wide">
                  Active Tournament Roster ({tournaments.length})
                </h2>
                <p className="text-xs text-gray-400">
                  Update statuses or remove completed tournaments.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {tournaments.length === 0 ? (
              <p className="text-gray-500 text-xs py-8 text-center">
                No tournaments found. Create one above!
              </p>
            ) : (
              tournaments.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-black/40 border border-gray-800 hover:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-900 shrink-0">
                      <img
                        src={t.posterUrl}
                        alt={t.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop";
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{t.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#ff1e38]/20 text-[#ff1e38] font-bold">
                          {t.game}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-3 mt-1">
                        <span>{t.date}</span>
                        <span>•</span>
                        <span className="text-amber-400 font-semibold">{t.prizePool}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-center flex-wrap">
                    {/* Set Spotlight Button */}
                    <button
                      onClick={() => handleSetTournamentAsSpotlight(t)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        spotlight.id === t.id || spotlight.title === t.title
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                          : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800 hover:border-amber-500/40"
                      }`}
                      title={
                        spotlight.id === t.id || spotlight.title === t.title
                          ? "Currently set as Hero Spotlight"
                          : "Promote to Hero Spotlight card"
                      }
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px]">
                        {spotlight.id === t.id || spotlight.title === t.title
                          ? "Active Spotlight"
                          : "Set Spotlight"}
                      </span>
                    </button>

                    {/* Status Pill Switcher */}
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t.id, e.target.value as TournamentStatus)}
                      className={`text-[11px] font-bold uppercase rounded-lg px-2.5 py-1.5 outline-none border transition-colors ${
                        t.status === "active"
                          ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-300"
                          : t.status === "upcoming"
                          ? "bg-amber-950/50 border-amber-500/50 text-amber-300"
                          : "bg-gray-900 border-gray-700 text-gray-400"
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                    </select>

                    {/* Test Form Link */}
                    <a
                      href={t.formUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700"
                      title="Test Google Form Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* Delete Event */}
                    <button
                      onClick={() => handleDeleteTournament(t.id)}
                      className="p-2 rounded-lg bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-900/60"
                      title="Delete Tournament"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section 3: Google Sheets Live Sync */}
        <section className="bg-[#10121b] border border-gray-800 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wide">
                Google Sheets Live Sync (Optional)
              </h2>
              <p className="text-xs text-gray-400">
                Plug in your Google Sheet CSV to automatically feed tournaments into the website.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                placeholder="Paste Google Sheet published CSV link (e.g. https://docs.google.com/.../pub?output=csv)"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="flex-1 bg-black/60 border border-gray-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={handleSyncGoogleSheet}
                className="px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Save & Sync</span>
              </button>
            </div>

            {sheetStatus && (
              <p className="text-xs text-emerald-400 font-semibold">{sheetStatus}</p>
            )}

            {/* Quick 3-Step Guide */}
            <div className="p-4 rounded-2xl bg-black/40 border border-gray-800 text-xs text-gray-400 space-y-2">
              <span className="font-bold text-white block uppercase tracking-wider text-[11px]">
                How to link your Google Sheet in 60 seconds:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-gray-400 text-[11px]">
                <li>Create a Google Sheet with headers: <code className="text-emerald-300">id, title, game, posterUrl, date, prizePool, format, description, formUrl, status</code></li>
                <li>Go to <strong>File → Share → Publish to web</strong></li>
                <li>Under link format, choose <strong>Comma-separated values (.csv)</strong> and click <strong>Publish</strong></li>
                <li>Copy that published link and paste it above!</li>
              </ol>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
