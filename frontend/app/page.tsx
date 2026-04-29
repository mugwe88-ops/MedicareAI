"use client";
import Hero from "./components/Hero";
import Specialties from "./components/Specialties";
import Services from "./components/Services";
import Doctors from "./components/Doctors";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Specialties Section - Pulls up to overlap the Hero slightly */}
      <div className="relative z-10 -mt-20">
        <Specialties />
      </div>

      {/* 3. Main Content Wrapper */}
      <div className="max-w-7xl mx-auto px-6 space-y-32 py-20">
        <Services />
        <Doctors />
      </div>
    </main>
  );
}