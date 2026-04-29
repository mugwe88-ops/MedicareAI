"use client";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Doctors from "./components/Doctors";

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <Hero />
      
      {/* 1. Services Row */}
      <section className="py-20 bg-white px-4 border-t border-slate-50">
        <div className="max-w-7xl mx-auto">
          <Services />
        </div>
      </section>

      {/* 2. Professional Trust Banner */}
      <section className="w-full bg-[#28328C] py-24 px-4 text-white relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full -mr-64 border border-white/10" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
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
                <div className="text-[10px] uppercase tracking-widest text-blue-300 font-black mt-2">Verified Patients</div>
              </div>
              <div>
                <div className="text-4xl font-black text-white">500+</div>
                <div className="text-[10px] uppercase tracking-widest text-blue-300 font-black mt-2">Top Specialists</div>
              </div>
            </div>
          </div>
          
          <button className="px-10 py-5 bg-white text-[#28328C] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-50 transition-all shadow-2xl">
            Learn More
          </button>
        </div>
      </section>

      {/* 3. Doctors List */}
      <section className="py-28 px-4 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Top Rated Doctors</h2>
            <p className="text-slate-500 mt-2 font-bold text-sm uppercase tracking-wider">Book in 60 seconds</p>
          </div>
          <Doctors />
        </div>
      </section>

      <footer className="py-20 bg-[#0F172A] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="text-2xl font-black text-white">Swift<span className="text-[#237BFF]">MD</span></span>
          <p className="text-sm font-bold opacity-60">© 2026 Swift MD. Built for better healthcare.</p>
        </div>
      </footer>
    </main>
  );
}