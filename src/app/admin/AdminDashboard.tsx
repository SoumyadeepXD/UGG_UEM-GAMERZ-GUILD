"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tournament, TournamentStatus } from "@/types/tournament";
import { isAllowlistedPosterUrl } from "@/lib/validations/urlAllowlist";
import { cyberSound } from "@/lib/cyberSound";
import {
  Shield,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  CheckCircle,
  Download,
  Sparkles,
  ArrowLeft,
  Eye,
  Layers,
  LogOut,
  AlertCircle,
  RefreshCw,
  Upload,
  ImageOff,
} from "lucide-react";

interface AdminDashboardProps {
  userEmail: string;
  initialTournaments: Tournament[];
}

export default function AdminDashboard({
  userEmail,
  initialTournaments,
}: AdminDashboardProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [failedPreviewUrl, setFailedPreviewUrl] = useState<string | null>(null);

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
    entryFee: "Free",
    description: "",
    formUrl: "https://docs.google.com/forms",
    status: "active",
  });

  const previewImageError = failedPreviewUrl === formData.posterUrl;
  const isPosterAllowlisted = isAllowlistedPosterUrl(formData.posterUrl);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Client-side quick check (4MB limit matches Vercel serverless body constraints)
    if (file.size > 4 * 1024 * 1024) {
      setUploadError("File exceeds 4MB limit. Please upload an image under 4MB.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Invalid format. Permitted formats: JPEG, PNG, WebP, AVIF.");
      return;
    }

    setIsUploadingPoster(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload poster to storage");
      }

      cyberSound.playClick();
      setFormData((prev) => ({ ...prev, posterUrl: data.url }));
      setSaveSuccessMessage("Poster uploaded to Supabase Storage CDN successfully!");
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadError(msg);
    } finally {
      setIsUploadingPoster(false);
      e.target.value = "";
    }
  };

  const handleAddTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details && typeof data.details === "object") {
          const firstKey = Object.keys(data.details)[0];
          const errorMsg = data.details[firstKey]?.[0] || data.error;
          throw new Error(`${firstKey}: ${errorMsg}`);
        }
        throw new Error(data.error || "Failed to create tournament");
      }

      cyberSound.playLaunch();
      const createdTournament: Tournament = data.tournament;
      setTournaments([createdTournament, ...tournaments]);

      // Reset form to defaults
      setFormData({
        title: "",
        game: "Valorant",
        posterUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
        date: "",
        time: "6:00 PM IST",
        prizePool: "₹5,000 + Trophies",
        format: "5v5 Single Elimination",
        platform: "PC",
        entryFee: "Free",
        description: "",
        formUrl: "https://docs.google.com/forms",
        status: "active",
      });

      setSaveSuccessMessage("Tournament saved to database and edge cache purged!");
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Creation failed";
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTournament = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tournament? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/tournaments/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete tournament");
      }

      cyberSound.playClick();
      setTournaments(tournaments.filter((t) => t.id !== id));
      setSaveSuccessMessage("Tournament deleted from database and edge cache purged!");
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Deletion failed";
      alert(message);
    }
  };

  const handleStatusChange = async (id: string, newStatus: TournamentStatus) => {
    try {
      const res = await fetch(`/api/admin/tournaments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      cyberSound.playClick();
      setTournaments(
        tournaments.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
      setSaveSuccessMessage("Status updated and edge cache purged!");
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Status update failed";
      alert(message);
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

  return (
    <div className="min-h-screen bg-[#08090d] text-white">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0c0e15]/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="min-h-[44px] min-w-[44px] flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff1e38] rounded-lg px-2"
            >
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

          <div className="flex items-center gap-3">
            {/* Coordinator Identity Badge */}
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono text-gray-300 bg-white/[0.04] border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{userEmail}</span>
            </span>

            <button
              onClick={handleExportJson}
              className="min-h-[44px] hidden sm:flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff1e38]"
              title="Export tournaments JSON backup"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export</span>
            </button>

            {/* Logout Form via HttpOnly Cookie clearing */}
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="min-h-[44px] flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-lg bg-red-950/40 border border-red-900/60 text-red-300 hover:bg-red-900/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff1e38]"
                title="Sign out of coordinator portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Success notification */}
        {saveSuccessMessage && (
          <div
            role="status"
            className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-bounce"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* Server Error notification */}
        {serverError && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Section 1: Add New Tournament Form + Live Preview */}
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
                Inputs are sanitized and validated with Zod. Uploaded posters are served from Supabase Storage CDN.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Inputs */}
            <form onSubmit={handleAddTournament} className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title-input" className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Tournament Title *
                  </label>
                  <input
                    id="title-input"
                    type="text"
                    required
                    placeholder="e.g. Valorant: Champions Cup"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none focus:ring-2 focus:ring-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label htmlFor="game-input" className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Game Title *
                  </label>
                  <input
                    id="game-input"
                    type="text"
                    required
                    placeholder="e.g. Valorant, BGMI, EA FC 25"
                    value={formData.game}
                    onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                    className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none focus:ring-2 focus:ring-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date-input" className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Tournament Dates *
                  </label>
                  <input
                    id="date-input"
                    type="text"
                    required
                    placeholder="e.g. Nov 20 - 22, 2026"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none focus:ring-2 focus:ring-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label htmlFor="time-input" className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Match Time
                  </label>
                  <input
                    id="time-input"
                    type="text"
                    placeholder="e.g. 6:00 PM IST"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none focus:ring-2 focus:ring-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prize-input" className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Prize Pool *
                  </label>
                  <input
                    id="prize-input"
                    type="text"
                    required
                    placeholder="e.g. ₹10,000 + Trophy"
                    value={formData.prizePool}
                    onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                    className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none focus:ring-2 focus:ring-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white text-amber-400 font-semibold"
                  />
                </div>

                <div>
                  <label htmlFor="format-input" className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Format
                  </label>
                  <input
                    id="format-input"
                    type="text"
                    placeholder="e.g. 5v5 Knockout"
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none focus:ring-2 focus:ring-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Poster Input + Direct Storage Upload Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="poster-input" className="text-[11px] uppercase font-bold text-gray-400">
                    Poster Image (Supabase Storage CDN) *
                  </label>
                  <label
                    htmlFor="poster-file-input"
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-[11px] font-bold cursor-pointer transition-colors active:scale-95 focus-within:ring-2 focus-within:ring-[#ff1e38]"
                  >
                    {isUploadingPoster ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#ff1e38]" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-[#ff1e38]" />
                        <span>Upload File (Max 4MB)</span>
                      </>
                    )}
                  </label>
                  <input
                    id="poster-file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    disabled={isUploadingPoster}
                    onChange={handleFileUpload}
                  />
                </div>

                <input
                  id="poster-input"
                  type="url"
                  required
                  placeholder="https://...supabase.co/storage/v1/object/public/posters/... or images.unsplash.com"
                  value={formData.posterUrl}
                  onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                  className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none focus:ring-2 focus:ring-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                />

                {!isPosterAllowlisted && formData.posterUrl.length > 0 && (
                  <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>Host not in allowlist. Posters must come from this project&apos;s Supabase Storage CDN or images.unsplash.com.</span>
                  </p>
                )}

                {uploadError && (
                  <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{uploadError}</span>
                  </p>
                )}
                <p className="text-[10px] text-gray-500 mt-1">
                  Upload an image to store directly on Supabase Storage CDN, or paste an approved HTTPS URL.
                </p>
              </div>

              <div>
                <label htmlFor="form-url-input" className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                  Registration Link (HTTPS Only) *
                </label>
                <input
                  id="form-url-input"
                  type="url"
                  required
                  placeholder="https://docs.google.com/forms/d/e/.../viewform"
                  value={formData.formUrl}
                  onChange={(e) => setFormData({ ...formData, formUrl: e.target.value })}
                  className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none focus:ring-2 focus:ring-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-[#ff1e38]"
                />
              </div>

              <div>
                <label htmlFor="desc-input" className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                  Description / Rules Summary
                </label>
                <textarea
                  id="desc-input"
                  rows={2}
                  placeholder="Brief description of bracket rules, requirements, and eligibility..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none focus:ring-2 focus:ring-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status-select" className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Registration Status
                  </label>
                  <select
                    id="status-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TournamentStatus })}
                    className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none focus:ring-2 focus:ring-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white"
                  >
                    <option value="active">Active (Registration Live)</option>
                    <option value="upcoming">Upcoming (Coming Soon)</option>
                    <option value="completed">Completed (Archived)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="platform-input" className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Platform
                  </label>
                  <input
                    id="platform-input"
                    type="text"
                    placeholder="e.g. PC, Mobile, PS5"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none focus:ring-2 focus:ring-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !isPosterAllowlisted}
                  className="w-full min-h-[48px] py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs text-white bg-gradient-to-r from-[#ff1e38] to-[#b80d22] hover:from-[#ff2a44] hover:to-[#ff1e38] transition-all duration-300 shadow-[0_0_20px_rgba(229,29,54,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Validating & Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Publish Tournament (Secure API)</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Live Preview Card with Safe Next/Image onError Fallback */}
            <div className="lg:col-span-5 bg-black/50 border border-gray-800/80 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                <span className="flex items-center gap-1.5 text-[#ff1e38]">
                  <Eye className="w-4 h-4" />
                  Live Preview
                </span>
                <span className="text-[10px] text-gray-500">Public carousel appearance</span>
              </div>

              <div className="bg-[#12141d] border border-[#ff1e38]/60 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(229,29,54,0.25)]">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/70">
                  {isPosterAllowlisted && !previewImageError ? (
                    <Image
                      src={formData.posterUrl}
                      alt="Preview Poster"
                      fill
                      sizes="(max-width: 768px) 100vw, 500px"
                      onError={() => setFailedPreviewUrl(formData.posterUrl)}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-black via-gray-950 to-gray-900 flex flex-col items-center justify-center text-center p-4 gap-2">
                      <ImageOff className="w-8 h-8 text-gray-600" />
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        {previewImageError ? "Image failed to load" : "Allowlisted Poster URL Required"}
                      </span>
                      <span className="text-[9px] text-gray-600 max-w-xs">
                        Use Supabase Storage CDN (*.supabase.co) or upload via the button.
                      </span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/75 backdrop-blur-md border">
                      {formData.status === "active" ? (
                        <span className="text-emerald-400">Registration Live</span>
                      ) : formData.status === "upcoming" ? (
                        <span className="text-amber-400">Upcoming</span>
                      ) : (
                        <span className="text-gray-300">Registration Closed</span>
                      )}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 z-10">
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

                  {formData.status === "completed" ? (
                    <div className="w-full min-h-[44px] py-2.5 rounded-lg font-bold uppercase tracking-wider text-[11px] text-gray-400 bg-white/[0.04] border border-white/10 text-center flex items-center justify-center">
                      Registration Closed
                    </div>
                  ) : (
                    <div className="w-full min-h-[44px] py-2.5 rounded-lg font-bold uppercase tracking-wider text-[11px] text-white bg-gradient-to-r from-[#ff1e38] to-[#b80d22] text-center flex items-center justify-center gap-1.5">
                      <span>Register via Google Form</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
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
                  Update statuses or delete tournament records.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {tournaments.length === 0 ? (
              <p className="text-gray-500 text-xs py-8 text-center">
                No tournaments found in database. Create one above!
              </p>
            ) : (
              tournaments.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-black/40 border border-gray-800 hover:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-900 shrink-0">
                      {isAllowlistedPosterUrl(t.posterUrl) ? (
                        <Image
                          src={t.posterUrl}
                          alt={t.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-950 flex items-center justify-center">
                          <ImageOff className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
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

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {/* Status Pill Switcher */}
                    <select
                      value={t.status}
                      aria-label="Tournament Status"
                      onChange={(e) => handleStatusChange(t.id, e.target.value as TournamentStatus)}
                      className={`min-h-[44px] text-[11px] font-bold uppercase rounded-lg px-2.5 py-1.5 outline-none border transition-colors focus:ring-2 focus:ring-[#ff1e38] ${
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

                    {/* Test Registration Form Link */}
                    {t.formUrl.startsWith("https://") && (
                      <a
                        href={t.formUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff1e38]"
                        title="Test Registration Form Link"
                        aria-label="Test Registration Form Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    {/* Delete Tournament Action */}
                    <button
                      onClick={() => handleDeleteTournament(t.id)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-900/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff1e38]"
                      title="Delete Tournament"
                      aria-label="Delete Tournament"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
