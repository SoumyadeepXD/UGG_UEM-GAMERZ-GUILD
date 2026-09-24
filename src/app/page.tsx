import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CyberTicker from "@/components/CyberTicker";
import EventSlider from "@/components/EventSlider";
import CommunityHub from "@/components/CommunityHub";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import CyberBackground from "@/components/CyberBackground";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#08090d] relative overflow-hidden">
      {/* Ambient background particles & grid */}
      <CyberBackground />

      <Navbar />
      <main className="flex-1 relative z-10">
        <Hero />
        <CyberTicker />
        <EventSlider />
        <CommunityHub />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
