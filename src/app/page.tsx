import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import EventSlider from "@/components/EventSlider";
import CommunityHub from "@/components/CommunityHub";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#08090d]">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <EventSlider />
        <CommunityHub />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
