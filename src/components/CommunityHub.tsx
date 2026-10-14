"use client";

import React from "react";
import { siteConfig } from "@/config/site";
import {
  InstagramIcon,
  DiscordIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from "@/components/SocialIcons";
import ScrollReveal from "@/components/ScrollReveal";
import { ExternalLink, Radio, Share2 } from "lucide-react";

export default function CommunityHub() {
  const channels = [
    {
      name: "WhatsApp",
      handle: "Official Channel",
      description: "Instant tournament registrations, emergency alerts, and direct lead contact.",
      link: siteConfig.socials.whatsapp,
      icon: WhatsAppIcon,
      accentBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      badge: "Instant Notices",
    },
    {
      name: "Discord",
      handle: "Official Server",
      description: "Voice lobbies, custom 5-stack scrims, team recruitment, and match bot.",
      link: siteConfig.socials.discord,
      icon: DiscordIcon,
      accentBg: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
      badge: "1,200+ Members",
    },
    {
      name: "Instagram",
      handle: "@uemk_gamerz_guild",
      description: "Tournament photos, champion reels, stories, and esports updates.",
      link: siteConfig.socials.instagram,
      icon: InstagramIcon,
      accentBg: "bg-pink-500/15 text-pink-400 border-pink-500/30",
      badge: "Latest Post",
    },
    {
      name: "YouTube",
      handle: "Esports Streams",
      description: "Live match broadcasts, shoutcasting, frag highlights, and grand finals.",
      link: siteConfig.socials.youtube,
      icon: YouTubeIcon,
      accentBg: "bg-red-500/15 text-red-400 border-red-500/30",
      badge: "Live VODs",
    },
  ];

  return (
    <section id="community" className="relative py-16 sm:py-24 bg-[#060709] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <ScrollReveal direction="up" delay={50}>
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#ff1e38]/10 border border-[#ff1e38]/20 text-[#ff1e38] text-[11px] font-bold uppercase tracking-wider mb-2">
              <Share2 className="w-3.5 h-3.5" />
              <span>Connect & Compete</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Official <span className="text-[#ff1e38]">Communities</span>
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Never miss a tournament notice or bracket drop. Join all our official guild channels.
            </p>
          </div>
        </ScrollReveal>

        {/* 2x2 Grid on Mobile, 4 Columns on Desktop with Staggered Scroll Animation */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {channels.map((channel, idx) => {
            const Icon = channel.icon;
            return (
              <ScrollReveal
                key={idx}
                direction="up"
                delay={100 + idx * 80}
                className="h-full"
              >
                <a
                  href={channel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-4 sm:p-6 rounded-2xl bg-[#0f1118] border border-white/10 hover:border-[#ff1e38]/50 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 shadow-lg h-full"
                >
                  <div>
                    {/* Top Bar with Icon & Badge */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${channel.accentBg} border p-2 flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.05] text-gray-300 hidden xs:inline-block">
                        {channel.badge}
                      </span>
                    </div>

                    {/* Title & Handle */}
                    <h3 className="text-sm sm:text-base font-black text-white group-hover:text-white transition-colors">
                      {channel.name}
                    </h3>
                    <p className="text-[11px] text-gray-400 font-semibold mb-2 truncate">
                      {channel.handle}
                    </p>

                    {/* Description (desktop or larger mobile) */}
                    <p className="text-[11px] text-gray-400 leading-relaxed mb-4 hidden sm:block">
                      {channel.description}
                    </p>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-2 sm:pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-bold text-white group-hover:text-[#ff1e38] transition-colors">
                    <span className="text-[11px] sm:text-xs">Join Channel</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </a>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Discord Scrims Highlight Banner */}
        <ScrollReveal direction="up" delay={350}>
          <div className="mt-8 sm:mt-12 p-5 sm:p-7 rounded-2xl bg-gradient-to-r from-[#141622] to-[#0e1017] border border-white/10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#ff1e38]/15 border border-[#ff1e38]/30 flex items-center justify-center text-[#ff1e38] shrink-0">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                  Hosting a custom match or scrim?
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Get dedicated voice rooms and tournament moderation for your collegiate squad in Discord.
                </p>
              </div>
            </div>
            <a
              href={siteConfig.socials.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold uppercase tracking-wider text-xs text-white bg-gradient-to-r from-[#ff1e38] to-[#d90429] hover:from-[#ff334b] hover:to-[#ff1e38] transition-all flex items-center justify-center gap-2 shrink-0 btn-glow-red"
            >
              <DiscordIcon className="w-4 h-4" />
              <span>Join Discord Server</span>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
