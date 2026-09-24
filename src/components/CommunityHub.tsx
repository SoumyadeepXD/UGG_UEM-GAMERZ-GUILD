"use client";

import React from "react";
import { siteConfig } from "@/config/site";
import {
  InstagramIcon,
  DiscordIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from "@/components/SocialIcons";
import {
  ExternalLink,
  Radio,
  Share2,
} from "lucide-react";

export default function CommunityHub() {
  const channels = [
    {
      name: "Instagram",
      handle: "@uemk_gamerz_guild",
      description: "Follow for tournament announcements, champion highlights, behind-the-scenes, and esports photography.",
      link: siteConfig.socials.instagram,
      icon: InstagramIcon,
      accentColor: "from-pink-600 via-rose-500 to-amber-500",
      borderGlow: "hover:border-pink-500 hover:shadow-[0_0_25px_rgba(236,72,153,0.35)]",
      actionText: "View on Instagram",
      badge: "Featured Post",
      stats: "Daily Highlights & Stories",
    },
    {
      name: "Discord Server",
      handle: "UGG Official Discord",
      description: "Join competitive voice lobbies, recruit 5-stacks for Valorant & BGMI scrims, and chat with collegiate pros.",
      link: siteConfig.socials.discord,
      icon: DiscordIcon,
      accentColor: "from-indigo-600 via-purple-600 to-blue-500",
      borderGlow: "hover:border-indigo-500 hover:shadow-[0_0_25px_rgba(99,102,241,0.35)]",
      actionText: "Join Discord Server",
      badge: "1,200+ Members",
      stats: "Active Voice & Scrims",
    },
    {
      name: "WhatsApp Channel",
      handle: "UGG Broadcasts",
      description: "Instant tournament registrations, emergency fixture changes, bracket alerts, and direct queries with heads.",
      link: siteConfig.socials.whatsapp,
      icon: WhatsAppIcon,
      accentColor: "from-emerald-600 to-teal-500",
      borderGlow: "hover:border-emerald-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)]",
      actionText: "Join WhatsApp Channel",
      badge: "Instant Notices",
      stats: "Direct Flash Alerts",
    },
    {
      name: "YouTube & Streams",
      handle: "UGG Esports Live",
      description: "Watch live caster broadcasts of collegiate finals, top frags, highlight reels, and championship replays.",
      link: siteConfig.socials.youtube,
      icon: YouTubeIcon,
      accentColor: "from-red-600 to-red-800",
      borderGlow: "hover:border-red-600 hover:shadow-[0_0_25px_rgba(229,29,54,0.35)]",
      actionText: "Subscribe & Watch",
      badge: "Live Broadcasts",
      stats: "Official Tournament Streams",
    },
  ];

  return (
    <section id="community" className="relative py-24 bg-[#0a0b11] overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#e51d36]/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#e51d36]/15 border border-[#e51d36]/30 text-[#e51d36] text-xs font-bold uppercase tracking-wider mb-3">
            <Share2 className="w-3.5 h-3.5" />
            <span>Connect & Compete</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Guild <span className="text-[#e51d36] glow-text-red">Communities</span> & Channels
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mt-3">
            Never miss a tournament signup, scrim announcement, or bracket update. Connect across all our official handles.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {channels.map((channel, idx) => {
            const Icon = channel.icon;
            return (
              <a
                key={idx}
                href={channel.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative p-6 rounded-2xl bg-[#12141e] border border-gray-800 transition-all duration-300 flex flex-col justify-between ${channel.borderGlow} hover:-translate-y-1.5`}
              >
                <div>
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${channel.accentColor} p-2.5 flex items-center justify-center text-white shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-black/60 border border-gray-800 text-gray-300 group-hover:border-gray-700">
                      {channel.badge}
                    </span>
                  </div>

                  {/* Channel Title & Handle */}
                  <h3 className="text-lg font-black text-white group-hover:text-gray-100 transition-colors">
                    {channel.name}
                  </h3>
                  <p className="text-xs text-[#e51d36] font-semibold mb-3">
                    {channel.handle}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-gray-400 leading-relaxed mb-6">
                    {channel.description}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-400">
                    {channel.stats}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-white group-hover:text-[#e51d36] transition-colors">
                    <span>Join</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Discord Scrims Highlight Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-black/80 via-[#141722]/90 to-black/80 border border-[#e51d36]/30 shadow-[0_0_30px_rgba(229,29,54,0.15)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#e51d36]/15 border border-[#e51d36]/40 flex items-center justify-center text-[#e51d36] shrink-0">
              <Radio className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white uppercase tracking-wide">
                Hosting a custom match or scrim?
              </h4>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
                Get custom roles, dedicated voice rooms, and referee moderation in our Discord server for your college squad.
              </p>
            </div>
          </div>
          <a
            href={siteConfig.socials.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs text-white bg-gradient-to-r from-[#e51d36] to-[#b80d22] hover:from-[#ff2a44] hover:to-[#e51d36] transition-all duration-300 shadow-[0_0_15px_rgba(229,29,54,0.4)] flex items-center justify-center gap-2 shrink-0"
          >
            <DiscordIcon className="w-4 h-4" />
            <span>Join the Server</span>
          </a>
        </div>
      </div>
    </section>
  );
}
