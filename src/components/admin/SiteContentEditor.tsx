"use client";

import React, { useState, useEffect } from "react";
import { DEF } from "@/data/uggContent";
import { load, save, UggContent } from "@/lib/ugg/util";
import { cyberSound } from "@/lib/cyberSound";
import {
  Palette,
  Layout,
  Calendar,
  Users,
  Image as ImageIcon,
  Award,
  Share2,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Upload,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Globe,
  Sliders,
  Code,
} from "lucide-react";

export default function SiteContentEditor() {
  const [content, setContent] = useState<UggContent>(() => load());
  const [activeSection, setActiveSection] = useState<string>("brand");
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Subscribe to storage update events so changes from another window sync
  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        setContent(load());
      } catch {
        // ignore
      }
    };
    window.addEventListener("ugg-storage-update", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);
    return () => {
      window.removeEventListener("ugg-storage-update", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  const handleSave = () => {
    try {
      save(content);
      cyberSound.playLaunch();
      setSaveNotification("Website content successfully saved and synchronized to live site!");
      setTimeout(() => setSaveNotification(null), 4000);
    } catch (e: unknown) {
      alert("Failed to save content: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleResetSection = () => {
    if (!confirm(`Reset this section (${activeSection}) to default settings?`)) return;
    cyberSound.playClick();
    setContent((prev) => {
      const next = structuredClone(prev);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (next as any)[activeSection] = structuredClone((DEF as any)[activeSection]);
      return next;
    });
    setSaveNotification(`Section "${activeSection}" reset to default. Press Save to persist.`);
    setTimeout(() => setSaveNotification(null), 4000);
  };

  const handleImageUpload = async (
    targetFieldSetter: (url: string) => void,
    fieldKey: string,
    file?: File | null
  ) => {
    if (!file) return;
    setUploadError(null);

    // If file is under 4MB, upload directly to Supabase Storage CDN endpoint
    if (file.size <= 4 * 1024 * 1024) {
      setIsUploading(fieldKey);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          targetFieldSetter(data.url);
          cyberSound.playClick();
          setSaveNotification("Uploaded image to Supabase CDN! Press Save to persist.");
          setTimeout(() => setSaveNotification(null), 3500);
          return;
        }
      } catch {
        // Fallback to FileReader if endpoint fails
      } finally {
        setIsUploading(null);
      }
    }

    // Fallback: FileReader Base64 for instant client offline usability (limit 2.5MB)
    if (file.size > 2.5 * 1024 * 1024) {
      setUploadError("Image is too large (max 4MB for CDN, 2.5MB for DataURL).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        targetFieldSetter(reader.result);
        cyberSound.playClick();
        setSaveNotification("Image attached! Press Save to persist.");
        setTimeout(() => setSaveNotification(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const sections = [
    { id: "brand", label: "Brand & Theme", icon: Palette },
    { id: "hero", label: "Hero Banner", icon: Layout },
    { id: "about", label: "About & Stats", icon: Sliders },
    { id: "esports", label: "Esports & GameDev", icon: Award },
    { id: "timeline", label: "Event Timeline", icon: Calendar },
    { id: "gallery", label: "Photo Gallery", icon: ImageIcon },
    { id: "team", label: "Leadership Team", icon: Users },
    { id: "sponsors", label: "Sponsors & Partners", icon: Globe },
    { id: "footer", label: "Footer & Contributors", icon: Share2 },
  ];

  return (
    <div className="space-y-6">
      {/* CMS Action Notification */}
      {saveNotification && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center justify-between gap-2 shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-pulse"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveNotification}</span>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] underline hover:text-white"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {uploadError && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-950/70 border border-red-500/60 text-red-300 text-xs font-bold flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Top Section Nav Tabs + Sticky Action Bar */}
      <div className="bg-[#10121b] border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Section switcher pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isSelected = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  cyberSound.playClick();
                  setActiveSection(sec.id);
                }}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-[#ff1e38] text-white shadow-[0_0_15px_rgba(255,30,56,0.4)]"
                    : "bg-black/50 text-gray-400 hover:text-white hover:bg-gray-800/80 border border-gray-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          <button
            type="button"
            onClick={handleResetSection}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Reset this section to factory default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Section</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] text-gray-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleSave}
            className="min-h-[40px] px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff1e38] to-[#b80d22] hover:from-[#ff2a44] hover:to-[#ff1e38] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(255,30,56,0.5)] transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Website Changes</span>
          </button>
        </div>
      </div>

      {/* Editor Main Content Area */}
      <div className="bg-[#10121b] border border-gray-800 rounded-3xl p-6 sm:p-8">
        {/* SECTION 1: Brand & Theme */}
        {activeSection === "brand" && (
          <div className="space-y-6">
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-base font-black uppercase tracking-wide flex items-center gap-2 text-white">
                <Palette className="w-5 h-5 text-[#ff1e38]" />
                Brand Identity & Cyber Theme
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Customize your guild name, subtitle, neon accent color, dark cyber background, and logo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1.5">
                  Guild Acronym / Name
                </label>
                <input
                  type="text"
                  value={content.brand.name}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      brand: { ...content.brand, name: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none focus:ring-2 focus:ring-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1.5">
                  Guild Subtitle
                </label>
                <input
                  type="text"
                  value={content.brand.sub}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      brand: { ...content.brand, sub: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none focus:ring-2 focus:ring-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div className="p-4 rounded-2xl bg-black/40 border border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Neon Accent Color</span>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {content.theme.accent || "#e11d2e"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label="Neon Accent Color"
                    value={content.theme.accent || "#e11d2e"}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        theme: { ...content.theme, accent: e.target.value },
                      })
                    }
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Background Tint</span>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {content.theme.bg || "#050506"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label="Background Tint"
                    value={content.theme.bg || "#050506"}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        theme: { ...content.theme, bg: e.target.value },
                      })
                    }
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>
            </div>

            {/* Logo Management */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] uppercase font-bold text-gray-400">
                  Guild Logo (Image URL or CDN Upload)
                </label>
                <label className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-[11px] font-bold cursor-pointer transition-colors">
                  {isUploading === "brand.logo" ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-[#ff1e38]" />
                  ) : (
                    <Upload className="w-3 h-3 text-[#ff1e38]" />
                  )}
                  <span>Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageUpload(
                        (url) =>
                          setContent((prev) => ({
                            ...prev,
                            brand: { ...prev.brand, logo: url },
                          })),
                        "brand.logo",
                        e.target.files?.[0]
                      )
                    }
                  />
                </label>
              </div>

              <input
                type="text"
                placeholder="https://... or data:image/png;base64,..."
                value={content.brand.logo}
                onChange={(e) =>
                  setContent({
                    ...content,
                    brand: { ...content.brand, logo: e.target.value },
                  })
                }
                className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none focus:ring-2 focus:ring-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
              />

              {content.brand.logo && (
                <div className="mt-3 p-3 rounded-xl bg-black/50 border border-gray-800 inline-flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content.brand.logo}
                    alt="Logo Preview"
                    className="w-10 h-10 object-contain rounded"
                  />
                  <span className="text-[11px] text-gray-400">Current Logo Preview</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 2: Hero Banner */}
        {activeSection === "hero" && (
          <div className="space-y-6">
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-base font-black uppercase tracking-wide flex items-center gap-2 text-white">
                <Layout className="w-5 h-5 text-[#ff1e38]" />
                Hero Banner & Kinetic Motion
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Configure rotating kinetic headlines, descriptions, call-to-action buttons, and background video/poster.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1.5">
                  Hero Kicker Badge
                </label>
                <input
                  type="text"
                  value={content.hero.kicker}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, kicker: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none focus:ring-2 focus:ring-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1.5">
                  Hero Paragraph / Description
                </label>
                <textarea
                  rows={2}
                  value={content.hero.text}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, text: e.target.value },
                    })
                  }
                  className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none focus:ring-2 focus:ring-[#ff1e38] rounded-xl px-3.5 py-2.5 text-xs text-white resize-none"
                />
              </div>
            </div>

            {/* Kinetic Words List */}
            <div className="p-4 rounded-2xl bg-black/40 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Kinetic Rotating Words ({content.hero.words.length})
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Cycle dynamically across the glowing main headline (e.g. PLAY., COMPETE., CREATE.)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setContent({
                      ...content,
                      hero: {
                        ...content.hero,
                        words: [...content.hero.words, "DOMINATE."],
                      },
                    })
                  }
                  className="min-h-[36px] px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 hover:border-gray-600 text-xs text-white font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-[#ff1e38]" />
                  <span>Add Word</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {content.hero.words.map((w, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-gray-500 w-5">#{idx + 1}</span>
                    <input
                      type="text"
                      value={w}
                      onChange={(e) => {
                        const nextWords = [...content.hero.words];
                        nextWords[idx] = e.target.value;
                        setContent({
                          ...content,
                          hero: { ...content.hero, words: nextWords },
                        });
                      }}
                      className="flex-1 min-h-[38px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-lg px-3 py-1.5 text-xs text-white font-bold tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const nextWords = content.hero.words.filter((_, i) => i !== idx);
                        setContent({
                          ...content,
                          hero: { ...content.hero, words: nextWords },
                        });
                      }}
                      className="p-2 text-red-400 hover:text-red-300"
                      title="Remove word"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons & URLs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-3">
                <label className="text-[11px] uppercase font-bold text-gray-400 block">
                  Primary Button (Left)
                </label>
                <input
                  type="text"
                  placeholder="Button Text (e.g. Explore Events)"
                  value={content.hero.btn1}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, btn1: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Target URL (e.g. #events)"
                  value={content.hero.btn1Url}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, btn1Url: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-gray-300 font-mono"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] uppercase font-bold text-gray-400 block">
                  Secondary Button (Right)
                </label>
                <input
                  type="text"
                  placeholder="Button Text (e.g. Join Community)"
                  value={content.hero.btn2}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, btn2: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Target URL (e.g. https://discord.gg/...)"
                  value={content.hero.joinUrl}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, joinUrl: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-gray-300 font-mono"
                />
              </div>
            </div>

            {/* Video or Background Media */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1.5">
                  Background Video URL (Optional MP4 / WebM)
                </label>
                <input
                  type="text"
                  placeholder="https://...mp4"
                  value={content.hero.video || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, video: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1.5">
                  Fallback Poster / Hero Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={content.hero.img || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, img: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: About & Stats */}
        {activeSection === "about" && (
          <div className="space-y-6">
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-base font-black uppercase tracking-wide flex items-center gap-2 text-white">
                <Sliders className="w-5 h-5 text-[#ff1e38]" />
                About UGG & Key Impact Metrics
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Edit your guild&apos;s story, mission statement, and animated live counter stats.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1.5">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={content.about.title}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      about: { ...content.about, title: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1.5">
                  Mission Statement / Guild Story
                </label>
                <textarea
                  rows={4}
                  value={content.about.text}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      about: { ...content.about, text: e.target.value },
                    })
                  }
                  className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white resize-none"
                />
              </div>
            </div>

            {/* Impact Stats List */}
            <div className="p-5 rounded-2xl bg-black/40 border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Guild Animated Stat Counters ({content.about.stats.length})
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Numbers count up on scroll viewport reveal
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setContent({
                      ...content,
                      about: {
                        ...content.about,
                        stats: [...content.about.stats, { n: "100+", l: "New Milestone" }],
                      },
                    })
                  }
                  className="min-h-[36px] px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 hover:border-gray-600 text-xs text-white font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-[#ff1e38]" />
                  <span>Add Stat</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.about.stats.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-black/60 border border-gray-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-500">Value:</span>
                        <input
                          type="text"
                          value={st.n}
                          onChange={(e) => {
                            const nextStats = [...content.about.stats];
                            nextStats[idx] = { ...st, n: e.target.value };
                            setContent({
                              ...content,
                              about: { ...content.about, stats: nextStats },
                            });
                          }}
                          className="w-24 min-h-[36px] bg-gray-900 border border-gray-700 focus:border-[#ff1e38] focus:outline-none rounded-lg px-2.5 py-1 text-xs text-amber-400 font-black"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-500">Label:</span>
                        <input
                          type="text"
                          value={st.l}
                          onChange={(e) => {
                            const nextStats = [...content.about.stats];
                            nextStats[idx] = { ...st, l: e.target.value };
                            setContent({
                              ...content,
                              about: { ...content.about, stats: nextStats },
                            });
                          }}
                          className="flex-1 min-h-[36px] bg-gray-900 border border-gray-700 focus:border-[#ff1e38] focus:outline-none rounded-lg px-2.5 py-1 text-xs text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const nextStats = content.about.stats.filter((_, i) => i !== idx);
                        setContent({
                          ...content,
                          about: { ...content.about, stats: nextStats },
                        });
                      }}
                      className="p-2 text-red-400 hover:text-red-300"
                      title="Remove stat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: Esports & GameDev */}
        {activeSection === "esports" && (
          <div className="space-y-8">
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-base font-black uppercase tracking-wide flex items-center gap-2 text-white">
                <Award className="w-5 h-5 text-[#ff1e38]" />
                Esports Arena & Game Development Pillars
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Configure both primary guilds: competitive gaming (Esports) and creation (Game Dev).
              </p>
            </div>

            {/* Esports Pillar */}
            <div className="p-5 rounded-2xl bg-black/40 border border-gray-800 space-y-4">
              <h4 className="text-sm font-black uppercase tracking-wider text-[#ff1e38]">
                1. Esports Pillar
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={content.esports.title}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        esports: { ...content.esports, title: e.target.value },
                      })
                    }
                    className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Art Badge Tag
                  </label>
                  <input
                    type="text"
                    value={content.esports.art}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        esports: { ...content.esports, art: e.target.value },
                      })
                    }
                    className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={content.esports.text}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      esports: { ...content.esports, text: e.target.value },
                    })
                  }
                  className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={content.esports.btn}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        esports: { ...content.esports, btn: e.target.value },
                      })
                    }
                    className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Target URL
                  </label>
                  <input
                    type="text"
                    value={content.esports.url}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        esports: { ...content.esports, url: e.target.value },
                      })
                    }
                    className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-gray-300 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Game Dev Pillar */}
            <div className="p-5 rounded-2xl bg-black/40 border border-gray-800 space-y-4">
              <h4 className="text-sm font-black uppercase tracking-wider text-emerald-400">
                2. Game Development Pillar
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={content.gamedev.title}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        gamedev: { ...content.gamedev, title: e.target.value },
                      })
                    }
                    className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Art Badge Tag
                  </label>
                  <input
                    type="text"
                    value={content.gamedev.art}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        gamedev: { ...content.gamedev, art: e.target.value },
                      })
                    }
                    className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={content.gamedev.text}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      gamedev: { ...content.gamedev, text: e.target.value },
                    })
                  }
                  className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={content.gamedev.btn}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        gamedev: { ...content.gamedev, btn: e.target.value },
                      })
                    }
                    className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                    Target URL
                  </label>
                  <input
                    type="text"
                    value={content.gamedev.url}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        gamedev: { ...content.gamedev, url: e.target.value },
                      })
                    }
                    className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-gray-300 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: Event Timeline */}
        {activeSection === "timeline" && (
          <div className="space-y-6">
            <div className="border-b border-gray-800 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black uppercase tracking-wide flex items-center gap-2 text-white">
                  <Calendar className="w-5 h-5 text-[#ff1e38]" />
                  Event Timeline ({content.timeline.items.length})
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Manage roadmap schedule milestones displayed in the interactive timeline.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setContent({
                    ...content,
                    timeline: {
                      ...content.timeline,
                      items: [
                        ...content.timeline.items,
                        {
                          date: "TBA 2026",
                          title: "New Championship Series",
                          status: "upcoming",
                        },
                      ],
                    },
                  })
                }
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-700 hover:border-gray-600 text-xs text-white font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-[#ff1e38]" />
                <span>Add Milestone</span>
              </button>
            </div>

            <div className="space-y-3">
              {content.timeline.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-black/40 border border-gray-800 hover:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xs font-mono text-gray-500 w-6">#{idx + 1}</span>

                    <input
                      type="text"
                      placeholder="Date (e.g. Dec 8 – Dec 10)"
                      value={item.date}
                      onChange={(e) => {
                        const nextItems = [...content.timeline.items];
                        nextItems[idx] = { ...item, date: e.target.value };
                        setContent({
                          ...content,
                          timeline: { ...content.timeline, items: nextItems },
                        });
                      }}
                      className="w-36 min-h-[40px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
                    />

                    <input
                      type="text"
                      placeholder="Event Title"
                      value={item.title}
                      onChange={(e) => {
                        const nextItems = [...content.timeline.items];
                        nextItems[idx] = { ...item, title: e.target.value };
                        setContent({
                          ...content,
                          timeline: { ...content.timeline, items: nextItems },
                        });
                      }}
                      className="flex-1 min-h-[40px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3 py-2 text-xs text-white font-semibold"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <select
                      value={item.status}
                      aria-label="Timeline Milestone Status"
                      onChange={(e) => {
                        const nextItems = [...content.timeline.items];
                        nextItems[idx] = { ...item, status: e.target.value };
                        setContent({
                          ...content,
                          timeline: { ...content.timeline, items: nextItems },
                        });
                      }}
                      className="min-h-[40px] bg-black/80 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3 py-2 text-xs font-bold uppercase text-white"
                    >
                      <option value="live">Live</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="registering">Registering</option>
                      <option value="completed">Completed</option>
                    </select>

                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => {
                        const nextItems = [...content.timeline.items];
                        [nextItems[idx - 1], nextItems[idx]] = [nextItems[idx], nextItems[idx - 1]];
                        setContent({
                          ...content,
                          timeline: { ...content.timeline, items: nextItems },
                        });
                      }}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center p-2 text-gray-400 hover:text-white disabled:opacity-30"
                      title="Move Up"
                      aria-label="Move Milestone Up"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={idx === content.timeline.items.length - 1}
                      onClick={() => {
                        const nextItems = [...content.timeline.items];
                        [nextItems[idx], nextItems[idx + 1]] = [nextItems[idx + 1], nextItems[idx]];
                        setContent({
                          ...content,
                          timeline: { ...content.timeline, items: nextItems },
                        });
                      }}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center p-2 text-gray-400 hover:text-white disabled:opacity-30"
                      title="Move Down"
                      aria-label="Move Milestone Down"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => {
                        const nextItems = content.timeline.items.filter((_, i) => i !== idx);
                        setContent({
                          ...content,
                          timeline: { ...content.timeline, items: nextItems },
                        });
                      }}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center p-2 text-red-400 hover:text-red-300"
                      title="Remove Milestone"
                      aria-label="Remove Milestone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 6: Photo Gallery */}
        {activeSection === "gallery" && (
          <div className="space-y-6">
            <div className="border-b border-gray-800 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black uppercase tracking-wide flex items-center gap-2 text-white">
                  <ImageIcon className="w-5 h-5 text-[#ff1e38]" />
                  Photo Gallery Showcase ({content.gallery.items.length})
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Upload photos from tournaments, meetups, and game jams displayed in the lightbox gallery.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setContent({
                    ...content,
                    gallery: {
                      ...content.gallery,
                      items: [
                        ...content.gallery.items,
                        {
                          img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=75&w=600&auto=format&fit=crop",
                          caption: "New Tournament Moment",
                        },
                      ],
                    },
                  })
                }
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-700 hover:border-gray-600 text-xs text-white font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-[#ff1e38]" />
                <span>Add Photo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.gallery.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-black/40 border border-gray-800 hover:border-gray-700 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="font-bold text-white">Photo #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextItems = content.gallery.items.filter((_, i) => i !== idx);
                        setContent({
                          ...content,
                          gallery: { ...content.gallery, items: nextItems },
                        });
                      }}
                      className="text-red-400 hover:text-red-300 text-[11px] flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-gray-950 shrink-0 border border-gray-800">
                      {item.img ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.img}
                          alt={item.caption}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px]">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={item.img}
                          onChange={(e) => {
                            const nextItems = [...content.gallery.items];
                            nextItems[idx] = { ...item, img: e.target.value };
                            setContent({
                              ...content,
                              gallery: { ...content.gallery, items: nextItems },
                            });
                          }}
                          className="w-full min-h-[38px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                        />
                        <label className="p-2 rounded-lg bg-gray-900 border border-gray-700 hover:bg-gray-800 cursor-pointer text-gray-300 hover:text-white shrink-0">
                          <Upload className="w-3.5 h-3.5 text-[#ff1e38]" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageUpload(
                                (url) => {
                                  const nextItems = [...content.gallery.items];
                                  nextItems[idx] = { ...item, img: url };
                                  setContent({
                                    ...content,
                                    gallery: { ...content.gallery, items: nextItems },
                                  });
                                },
                                `gallery-${idx}`,
                                e.target.files?.[0]
                              )
                            }
                          />
                        </label>
                      </div>

                      <input
                        type="text"
                        placeholder="Caption (e.g. Valorant Campus Finals)"
                        value={item.caption}
                        onChange={(e) => {
                          const nextItems = [...content.gallery.items];
                          nextItems[idx] = { ...item, caption: e.target.value };
                          setContent({
                            ...content,
                            gallery: { ...content.gallery, items: nextItems },
                          });
                        }}
                        className="w-full min-h-[38px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 7: Leadership Team */}
        {activeSection === "team" && (
          <div className="space-y-6">
            <div className="border-b border-gray-800 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black uppercase tracking-wide flex items-center gap-2 text-white">
                  <Users className="w-5 h-5 text-[#ff1e38]" />
                  Leadership Team Roster ({content.team.items.length})
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Manage guild coordinators, leads, and executive officers.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setContent({
                    ...content,
                    team: {
                      ...content.team,
                      items: [
                        ...content.team.items,
                        {
                          name: "New Member",
                          role: "Lead Coordinator",
                          img: "",
                          link: "#team",
                        },
                      ],
                    },
                  })
                }
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-700 hover:border-gray-600 text-xs text-white font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-[#ff1e38]" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.team.items.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-black/40 border border-gray-800 hover:border-gray-700 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="font-bold text-white">Member #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextItems = content.team.items.filter((_, i) => i !== idx);
                        setContent({
                          ...content,
                          team: { ...content.team, items: nextItems },
                        });
                      }}
                      className="text-red-400 hover:text-red-300 text-[11px] flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => {
                        const nextItems = [...content.team.items];
                        nextItems[idx] = { ...m, name: e.target.value };
                        setContent({
                          ...content,
                          team: { ...content.team, items: nextItems },
                        });
                      }}
                      className="w-full min-h-[38px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-lg px-2.5 py-1 text-xs text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                      Role / Position
                    </label>
                    <input
                      type="text"
                      value={m.role}
                      onChange={(e) => {
                        const nextItems = [...content.team.items];
                        nextItems[idx] = { ...m, role: e.target.value };
                        setContent({
                          ...content,
                          team: { ...content.team, items: nextItems },
                        });
                      }}
                      className="w-full min-h-[38px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-lg px-2.5 py-1 text-xs text-[#ff1e38]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                      Avatar URL (Optional)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="https://..."
                        value={m.img || ""}
                        onChange={(e) => {
                          const nextItems = [...content.team.items];
                          nextItems[idx] = { ...m, img: e.target.value };
                          setContent({
                            ...content,
                            team: { ...content.team, items: nextItems },
                          });
                        }}
                        className="flex-1 min-h-[38px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                      />
                      <label className="p-2 rounded-lg bg-gray-900 border border-gray-700 hover:bg-gray-800 cursor-pointer text-gray-300 shrink-0">
                        <Upload className="w-3.5 h-3.5 text-[#ff1e38]" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleImageUpload(
                              (url) => {
                                const nextItems = [...content.team.items];
                                nextItems[idx] = { ...m, img: url };
                                setContent({
                                  ...content,
                                  team: { ...content.team, items: nextItems },
                                });
                              },
                              `team-${idx}`,
                              e.target.files?.[0]
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 8: Sponsors & Partners */}
        {activeSection === "sponsors" && (
          <div className="space-y-6">
            <div className="border-b border-gray-800 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black uppercase tracking-wide flex items-center gap-2 text-white">
                  <Globe className="w-5 h-5 text-[#ff1e38]" />
                  Sponsors & Industry Partners ({content.sponsors.items.length})
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Manage brand partners, hardware sponsors, and sponsorship contact email.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setContent({
                    ...content,
                    sponsors: {
                      ...content.sponsors,
                      items: [
                        ...content.sponsors.items,
                        { name: "New Partner", logo: "", url: "#" },
                      ],
                    },
                  })
                }
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-700 hover:border-gray-600 text-xs text-white font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-[#ff1e38]" />
                <span>Add Partner</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                  Sponsorship Contact Email
                </label>
                <input
                  type="email"
                  value={content.sponsors.email}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      sponsors: { ...content.sponsors, email: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                  Sponsorship CTA Button
                </label>
                <input
                  type="text"
                  value={content.sponsors.cta}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      sponsors: { ...content.sponsors, cta: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {content.sponsors.items.map((sp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-black/50 border border-gray-800 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="font-bold text-white">Sponsor #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextItems = content.sponsors.items.filter((_, i) => i !== idx);
                        setContent({
                          ...content,
                          sponsors: { ...content.sponsors, items: nextItems },
                        });
                      }}
                      className="text-red-400 hover:text-red-300 text-[11px] flex items-center gap-1"
                      title="Remove partner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Intel"
                      value={sp.name}
                      onChange={(e) => {
                        const nextItems = [...content.sponsors.items];
                        nextItems[idx] = { ...sp, name: e.target.value };
                        setContent({
                          ...content,
                          sponsors: { ...content.sponsors, items: nextItems },
                        });
                      }}
                      className="w-full min-h-[38px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-lg px-2.5 py-1 text-xs text-white font-bold"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400">
                        Transparent PNG Logo
                      </label>
                      <label className="p-1 px-2 rounded bg-gray-900 border border-gray-700 hover:bg-gray-800 cursor-pointer text-gray-300 text-[10px] flex items-center gap-1">
                        <Upload className="w-3 h-3 text-[#ff1e38]" />
                        <span>Upload PNG</span>
                        <input
                          type="file"
                          accept="image/png,image/webp,image/svg+xml"
                          className="hidden"
                          onChange={(e) =>
                            handleImageUpload(
                              (url) => {
                                const nextItems = [...content.sponsors.items];
                                nextItems[idx] = { ...sp, logo: url };
                                setContent({
                                  ...content,
                                  sponsors: { ...content.sponsors, items: nextItems },
                                });
                              },
                              `sponsor-${idx}`,
                              e.target.files?.[0]
                            )
                          }
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="PNG URL or Upload (leave empty for text-only)"
                      value={sp.logo || ""}
                      onChange={(e) => {
                        const nextItems = [...content.sponsors.items];
                        nextItems[idx] = { ...sp, logo: e.target.value };
                        setContent({
                          ...content,
                          sponsors: { ...content.sponsors, items: nextItems },
                        });
                      }}
                      className="w-full min-h-[38px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-lg px-2.5 py-1 text-xs text-gray-300 font-mono"
                    />
                  </div>

                  {/* Transparent Logo Live Preview */}
                  <div className="p-2.5 rounded-xl bg-black/70 border border-gray-800 flex items-center justify-between min-h-[46px]">
                    {sp.logo && sp.logo.trim() ? (
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sp.logo}
                          alt={sp.name}
                          className="h-8 max-w-[120px] object-contain"
                        />
                        <span className="text-[10px] text-emerald-400 font-mono">Transparent PNG Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-gray-400 tracking-wider">
                          {sp.name || "UNNAMED"}
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono">(Text Fallback)</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={sp.url}
                      onChange={(e) => {
                        const nextItems = [...content.sponsors.items];
                        nextItems[idx] = { ...sp, url: e.target.value };
                        setContent({
                          ...content,
                          sponsors: { ...content.sponsors, items: nextItems },
                        });
                      }}
                      className="w-full min-h-[38px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-lg px-2.5 py-1 text-xs text-gray-400 font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 9: Footer & Contributors */}
        {activeSection === "footer" && (
          <div className="space-y-6">
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-base font-black uppercase tracking-wide flex items-center gap-2 text-white">
                <Share2 className="w-5 h-5 text-[#ff1e38]" />
                Footer Information & Contributors
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Manage the contributors tab (who created & maintains the site), footer columns, and social channels.
              </p>
            </div>

            {/* Created & Maintained by Contributors Section */}
            <div className="p-5 rounded-2xl bg-black/40 border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-[#ff1e38]" />
                    Created & Maintained by (Contributors List)
                  </h4>
                  <p className="text-xs text-gray-400">
                    Replaced the old Explore tab. Clicking a contributor profile link opens their GitHub/LinkedIn/Portfolio in a new tab.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextCols = [...content.footer.cols];
                    if (!nextCols[0]) {
                      nextCols[0] = { title: "Created & Maintained by", links: [] };
                    }
                    nextCols[0] = {
                      ...nextCols[0],
                      title: "Created & Maintained by",
                      links: [
                        ...nextCols[0].links,
                        { t: "New Contributor", u: "https://github.com" },
                      ],
                    };
                    setContent({
                      ...content,
                      footer: { ...content.footer, cols: nextCols },
                    });
                  }}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 hover:border-gray-600 text-xs text-white font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#ff1e38]" />
                  <span>Add Contributor</span>
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {((content.footer.cols[0]?.links) || []).map((contributor, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-black/60 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs font-mono text-gray-500 w-5">#{idx + 1}</span>
                      <input
                        type="text"
                        placeholder="Contributor Name"
                        value={contributor.t}
                        onChange={(e) => {
                          const nextCols = [...content.footer.cols];
                          const nextLinks = [...nextCols[0].links];
                          nextLinks[idx] = { ...contributor, t: e.target.value };
                          nextCols[0] = { ...nextCols[0], title: "Created & Maintained by", links: nextLinks };
                          setContent({
                            ...content,
                            footer: { ...content.footer, cols: nextCols },
                          });
                        }}
                        className="w-48 min-h-[38px] bg-black/70 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                      />
                      <input
                        type="url"
                        placeholder="Profile URL (e.g. https://github.com/soumyadeepxd)"
                        value={contributor.u}
                        onChange={(e) => {
                          const nextCols = [...content.footer.cols];
                          const nextLinks = [...nextCols[0].links];
                          nextLinks[idx] = { ...contributor, u: e.target.value };
                          nextCols[0] = { ...nextCols[0], title: "Created & Maintained by", links: nextLinks };
                          setContent({
                            ...content,
                            footer: { ...content.footer, cols: nextCols },
                          });
                        }}
                        className="flex-1 min-h-[38px] bg-black/70 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-lg px-3 py-1.5 text-xs text-gray-300 font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {contributor.u && contributor.u.startsWith("http") && (
                        <a
                          href={contributor.u}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white"
                          title="Test profile link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const nextCols = [...content.footer.cols];
                          const nextLinks = nextCols[0].links.filter((_, i) => i !== idx);
                          nextCols[0] = { ...nextCols[0], title: "Created & Maintained by", links: nextLinks };
                          setContent({
                            ...content,
                            footer: { ...content.footer, cols: nextCols },
                          });
                        }}
                        className="p-2 text-red-400 hover:text-red-300"
                        title="Remove contributor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Footer Navigation Columns */}
            <div className="p-5 rounded-2xl bg-black/40 border border-gray-800 space-y-4">
              <h4 className="text-sm font-bold text-white">
                Additional Footer Columns ({content.footer.cols.length > 1 ? content.footer.cols.length - 1 : 0})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.footer.cols.slice(1).map((col, cIdx) => (
                  <div key={cIdx} className="p-4 rounded-xl bg-black/60 border border-gray-800 space-y-3">
                    <input
                      type="text"
                      value={col.title}
                      onChange={(e) => {
                        const nextCols = [...content.footer.cols];
                        nextCols[cIdx + 1] = { ...col, title: e.target.value };
                        setContent({
                          ...content,
                          footer: { ...content.footer, cols: nextCols },
                        });
                      }}
                      className="w-full min-h-[38px] bg-black/80 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-lg px-2.5 py-1 text-xs text-white font-bold"
                    />
                    <div className="space-y-2">
                      {col.links.map((link, lIdx) => (
                        <div key={lIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={link.t}
                            onChange={(e) => {
                              const nextCols = [...content.footer.cols];
                              const nextLinks = [...col.links];
                              nextLinks[lIdx] = { ...link, t: e.target.value };
                              nextCols[cIdx + 1] = { ...col, links: nextLinks };
                              setContent({
                                ...content,
                                footer: { ...content.footer, cols: nextCols },
                              });
                            }}
                            className="w-32 min-h-[34px] bg-black/70 border border-gray-800 rounded px-2 text-xs text-gray-200"
                          />
                          <input
                            type="text"
                            value={link.u}
                            onChange={(e) => {
                              const nextCols = [...content.footer.cols];
                              const nextLinks = [...col.links];
                              nextLinks[lIdx] = { ...link, u: e.target.value };
                              nextCols[cIdx + 1] = { ...col, links: nextLinks };
                              setContent({
                                ...content,
                                footer: { ...content.footer, cols: nextCols },
                              });
                            }}
                            className="flex-1 min-h-[34px] bg-black/70 border border-gray-800 rounded px-2 text-xs text-gray-400 font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                  Location Text
                </label>
                <input
                  type="text"
                  value={content.footer.location}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      footer: { ...content.footer, location: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={content.footer.tagline}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      footer: { ...content.footer, tagline: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#ff1e38] font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                Copyright Text
              </label>
              <input
                type="text"
                value={content.footer.copy}
                onChange={(e) =>
                  setContent({
                    ...content,
                    footer: { ...content.footer, copy: e.target.value },
                  })
                }
                className="w-full min-h-[44px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            {/* Social Links List */}
            <div className="p-4 rounded-2xl bg-black/40 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Social Media Channels ({content.socials.length})
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Links rendered in the footer copy row
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setContent({
                      ...content,
                      socials: [...content.socials, { t: "New Link", u: "#" }],
                    })
                  }
                  className="min-h-[36px] px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 hover:border-gray-600 text-xs text-white font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-[#ff1e38]" />
                  <span>Add Social</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {content.socials.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Platform"
                      value={s.t}
                      onChange={(e) => {
                        const nextSocials = [...content.socials];
                        nextSocials[idx] = { ...s, t: e.target.value };
                        setContent({ ...content, socials: nextSocials });
                      }}
                      className="w-28 min-h-[38px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-lg px-2.5 py-1 text-xs text-white font-bold"
                    />
                    <input
                      type="text"
                      placeholder="URL"
                      value={s.u}
                      onChange={(e) => {
                        const nextSocials = [...content.socials];
                        nextSocials[idx] = { ...s, u: e.target.value };
                        setContent({ ...content, socials: nextSocials });
                      }}
                      className="flex-1 min-h-[38px] bg-black/60 border border-gray-800 focus:border-[#ff1e38] focus:outline-none rounded-lg px-2.5 py-1 text-xs text-gray-300 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const nextSocials = content.socials.filter((_, i) => i !== idx);
                        setContent({ ...content, socials: nextSocials });
                      }}
                      className="p-2 text-red-400 hover:text-red-300"
                      title="Remove social link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
