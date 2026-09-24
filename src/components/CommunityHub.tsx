"use client";

import React from "react";
import { siteConfig } from "@/config/site";
import { cyberSound } from "@/lib/cyberSound";
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
  Terminal,
  Activity,
} from "lucide-react";

export default function CommunityHub() {
  const channels = [
    {
      name: "Instagram",
      handle: "@uemk_gamerz_guild",
      description: "Tournament announcements, match photography, champion stories, and esports reel drops.",
      link: siteConfig.socials.instagram,
      icon: InstagramIcon,
      accentColor: "from-pink-600 via-rose-500 to-amber-500",
      borderGlow: "hover:border-pink-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.35)]",
      badge: "Featured Link",
      stats: "Highlights & Reels",
      ping: "12ms",
    },
    {
      name: "Discord Server",
      handle: "UGG Official Discord",
      description: "Competitive voice channels, recruit 5-stacks for Valorant & BGMI scrims, and chat with college pros.",
      link: siteConfig.socials.discord,
      icon: DiscordIcon,
      accentColor: "from-indigo-600 via-purple-600 to-blue-500",
      borderGlow: "hover:border-indigo-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.35)]",
      badge: "1,200+ Gamers",
      stats: "Active Scrim Rooms",
      ping: "8ms",
    },
    {
      name: "WhatsApp Channel",
      handle: "UGG Broadcasts",
      description: "Instant tournament form drops, schedule changes, emergency alerts, and direct contact with leads.",
      link: siteConfig.socials.whatsapp,
      icon: WhatsAppIcon,
      accentColor: "from-emerald-600 to-teal-500",
      borderGlow: "hover:border-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.35)]",
      badge: "Instant Notices",
      stats: "Direct Flash Alerts",
      ping: "14ms",
    },
    {
      name: "YouTube & Streams",
      handle: "UGG Esports Live",
      description: "Official live broadcasts of campus finals, shoutcasting, top 10 frags, and champion interviews.",
      link: siteConfig.socials.youtube,
      icon: YouTubeIcon,
      accentColor: "from-red-600 to-red-800",
      borderGlow: "hover:border-red-600 hover:shadow-[0_0_30px_rgba(229,29,54,0.35)]",
      badge: "Live Broadcasts",
      stats: "Casted Tournaments",
      ping: "18ms",
    },
  ];

  return (
    <section id="community" className="relative py-24 bg-[#0a0b11] overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#e51d36]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-900/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#e51d36]/15 border border-[#e51d36]/30 text-[#e51d36] text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Terminal className="w-3.5 h-3.5" />
            <span>// COMM_LINKS: BROADCAST_ARRAY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Guild <span className="text-[#e51d36] glow-text-red">Communities</span> & Feeds
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-3 font-mono">
            Direct frequency arrays. Connect across Instagram, Discord, and WhatsApp.
          </p>
        </div>

        {/* Cards Grid with Cyber Terminal Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {channels.map((channel, idx) => {
            const Icon = channel.icon;
            return (
              <a
                key={idx}
                href={channel.link}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => cyberSound.playHover()}
                onClick={() => cyberSound.playLaunch()}
                className={`group relative p-6 rounded-2xl bg-[#12141f] border border-gray-800 transition-all duration-300 flex flex-col justify-between ${channel.borderGlow} hover:-translate-y-2`}
              >
                {/* Tactical corner accent */}
                <span className="absolute top-2 right-2 text-[9px] font-mono text-gray-600 group-hover:text-[#e51d36]">
                  [{channel.ping}]
                </span>

                <div>
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${channel.accentColor} p-2.5 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-black/60 border border-gray-800 text-gray-300">
                      {channel.badge}
                    </span>
                  </div>

                  {/* Channel Title & Handle */}
                  <h3 className="text-lg font-black text-white group-hover:text-gray-100 transition-colors uppercase font-sans">
                    {channel.name}
                  </h3>
                  <p className="text-xs text-[#e51d36] font-mono font-semibold mb-3">
                    {channel.handle}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-gray-400 leading-relaxed mb-6 font-sans">
                    {channel.description}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <Activity className="w-3 h-3 text-emerald-400" />
                    <span>{channel.stats}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-white group-hover:text-[#e51d36] transition-colors">
                    <span>CONNECT</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Discord Scrims Highlight Banner with Cyber Cuts */}
        <div className="mt-12 p-6 sm:p-8 cyber-cut bg-gradient-to-r from-black/90 via-[#141724] to-black/90 border border-[#e51d36]/40 shadow-[0_0_35px_rgba(229,29,54,0.2)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#e51d36]/20 border border-[#e51d36]/50 flex items-center justify-center text-[#e51d36] shrink-0 shadow-[0_0_20px_rgba(229,29,54,0.4)]">
              <Radio className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white uppercase tracking-wide font-sans">
                Hosting a custom match or scrim?
              </h4>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl font-sans">
                Get custom roles, dedicated voice rooms, and referee tournament moderation in our Discord server for your campus squad.
              </p>
            </div>
          </div>
          <a
            href={siteConfig.socials.discord}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => cyberSound.playHover()}
            onClick={() => cyberSound.playLaunch()}
            className="w-full md:w-auto px-6 py-3.5 cyber-cut font-extrabold uppercase tracking-wider text-xs text-white bg-gradient-to-r from-[#e51d36] to-[#b80d22] hover:from-[#ff2a44] hover:to-[#e51d36] transition-all duration-300 shadow-[0_0_20px_rgba(229,29,54,0.45)] flex items-center justify-center gap-2 shrink-0 font-mono"
          >
            <DiscordIcon className="w-4 h-4" />
            <span>Join Discord Server</span>
          </a>
        </div>
      </div>
    </section>
  );
}
