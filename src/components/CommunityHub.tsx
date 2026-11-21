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
              <span>Official Channels</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Join the <span className="text-[#ff1e38]">Network</span>
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-md mx-auto">
              Follow UGG across campus comms. Direct tournament bracket links are broadcasted exclusively to these verified handles.
            </p>
          </div>
        </ScrollReveal>

        {/* 4 Social Cards Grid with Staggered Scroll Animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {channels.map((chan, idx) => {
            const Icon = chan.icon;
            return (
              <ScrollReveal
                key={idx}
                direction="up"
                delay={100 + idx * 75}
                className="h-full"
              >
                <a
                  href={chan.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-5 sm:p-6 rounded-2xl bg-[#0b0c14] border border-white/10 hover:border-[#ff1e38]/50 transition-all duration-300 flex flex-col justify-between h-full hover:shadow-[0_8px_30px_rgba(255,30,56,0.15)] active:scale-98"
                >
                  <div>
                    {/* Top row: Icon + Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6 text-white group-hover:text-[#ff1e38] transition-colors" />
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${chan.accentBg}`}>
                        {chan.badge}
                      </span>
                    </div>

                    {/* Channel Title & Handle */}
                    <h3 className="font-black text-lg text-white group-hover:text-[#ff1e38] transition-colors">
                      {chan.name}
                    </h3>
                    <p className="text-xs font-semibold text-gray-400 mb-2">
                      {chan.handle}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {chan.description}
                    </p>
                  </div>

                  {/* Bottom link prompt */}
                  <div className="mt-5 pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-white transition-colors">
                    <span>Connect Now</span>
                    <ExternalLink className="w-4 h-4 text-[#ff1e38] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </a>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Live Guild Status Banner */}
        <ScrollReveal direction="up" delay={450}>
          <div className="mt-10 sm:mt-12 p-4 sm:p-5 rounded-2xl bg-[#0f111a] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
                  UGG Scrim Lobbies Live
                </h4>
                <p className="text-[11px] text-gray-400">
                  Join Discord #custom-match lobbies or WhatsApp alerts to get pinged when scrim rooms open.
                </p>
              </div>
            </div>

            <a
              href={siteConfig.socials.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all shrink-0 hover:border-white/20 active:scale-95"
            >
              Enter Server
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
