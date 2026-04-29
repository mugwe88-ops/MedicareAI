"use client";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Doctors from "./components/Doctors";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]"> {/* Clean light grey background */}
      <Navbar />
      
      {/* 1. Header & Specialties */}
      <Hero />
      
      {/* 2. Services Grid - Refactored for Horizontal Tiles */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <Services />
        </div>
      </section>

      {/* 3. Mission Statement "What we do" - Practo Style */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-slate-800 mb-6">What we do</h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
            We are on a mission to make quality healthcare affordable and accessible for everyone. 
            We empower people with the information and care that they can trust to make 
            <span className="text-[#237BFF]"> better healthcare decisions every day.</span>
          </p>
          
          {/* Trust Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-14 pt-12 border-t border-slate-50">
            <div>
              <div className="text-2xl font-bold text-slate-800">10k+</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Patients</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">500+</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Verified Doctors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">50+</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Clinics</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">24/7</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Top Rated Doctors Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-800">Top Rated Doctors</h2>
            <p className="text-slate-500 mt-2">Verified specialists available for instant booking</p>
          </div>
          <Doctors />
        </div>
      </section>

      {/* 5. Footer Placeholder */}
      <footer className="py-12 bg-slate-900 text-slate-400 text-center text-sm">
        <p>© 2026 Swift MD. All rights reserved.</p>
      </footer>
    </main>
  );
}