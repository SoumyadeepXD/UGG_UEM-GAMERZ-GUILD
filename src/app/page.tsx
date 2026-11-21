import React from "react";
import Navbar from "@/components/Navbar";
import CyberTicker from "@/components/CyberTicker";
import EventSlider from "@/components/EventSlider";
import CommunityHub from "@/components/CommunityHub";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import { getPublishedTournaments } from "@/lib/events";

/**
 * Baseline ISR configuration:
 * Statically pre-rendered at build time. On-demand revalidation is triggered
 * whenever an admin modifies tournaments (via revalidatePath('/')).
 * Zero database queries occur per public request.
 */
export const revalidate = 86400;

export default async function Home() {
  const tournaments = await getPublishedTournaments();

  return (
    <div className="flex flex-col min-h-screen bg-[#060709] text-gray-100 selection:bg-[#ff1e38] selection:text-white relative">
      <ScrollProgress />
      <Navbar />
      <main className="flex-1 relative z-10">
        <EventSlider initialTournaments={tournaments} />
        <CyberTicker />
        <CommunityHub />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
