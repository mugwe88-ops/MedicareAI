"use client";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Doctors from "./components/Doctors";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="h-20"></div> {/* Spacer for fixed Navbar */}
      
      <Hero /> {/* This now contains the ONLY specialty grid */}
      
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto space-y-16">
          <Services />
          <Doctors />
        </div>
      </section>
    </main>
  );
}