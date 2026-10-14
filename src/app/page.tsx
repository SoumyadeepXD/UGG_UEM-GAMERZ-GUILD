import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CyberTicker from "@/components/CyberTicker";
import EventSlider from "@/components/EventSlider";
import CommunityHub from "@/components/CommunityHub";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#060709] text-gray-100 selection:bg-[#ff1e38] selection:text-white relative">
      <ScrollProgress />
      <Navbar />
      <main className="flex-1 relative z-10">
        <EventSlider />
        <CyberTicker />
        <Hero />
        <CommunityHub />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
