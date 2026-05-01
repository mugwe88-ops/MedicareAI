"use client";

import Hero from "./components/Hero";
import Services from "./components/Services";
import Doctors from "./components/Doctors";

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* Navbar is now handled globally in layout.tsx */}
      <Hero />
      
      {/* 1. Services Row */}
      <section className="py-20 bg-white px-4 border-t border-slate-50">
        <div className="max-w-7xl mx-auto">
          <Services />
        </div>
      </section>

      {/* 2. Professional Trust Banner */}
      <section className="w-full bg-[#28328C] py-24 px-4 text-white relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16 relative">
          <div className="max-w-2xl text-left">
            <h2 className="text-3xl md:text-5xl font-black leading-tight mb-8">
              SwiftMD is now KMLTTB & MOH Compliant
            </h2>
            <p className="text-blue-100 text-lg mb-12 font-medium opacity-90">
              Your health is protected by verified professional standards and real-time medical auditing.
            </p>
            <div className="flex gap-16 border-t border-white/20 pt-10">
              <div>
                <div className="text-4xl font-black text-white">10k+</div>
                <div className="text-[10px] uppercase tracking-widest text-blue-300 font-black mt-2">Verified Doctors</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* 3. Doctors List */}
      <div className="py-20">
         <Doctors />
      </div>
    </main>
  );
}