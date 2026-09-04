"use client";
import { useState, useEffect } from "react";
import Link from "next/link"; // Use next/link for internal navigation if using Next.js App Router

const slides = [
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1920&q=80"
];

export default function HeroWithActions() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full py-24 px-6 md:px-12 rounded-2xl overflow-hidden shadow-xl">
      {/* Slideshow Background Images */}
      {slides.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out z-0 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('${image}')` }}
        />
      ))}

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-slate-900/80 z-0" />

      {/* Content Container */}
      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
        <span className="px-3.5 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold rounded-full uppercase tracking-wider">
          AI-Powered Telehealth & Remote Clinical Support
        </span>
        
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
          Next-Generation Virtual Medical Care
        </h1>

        <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          Swift MD seamlessly connects virtual consultations with live patient vitals, medical research, health calculators, and clinical evidence.
        </p>

        {/* Action Buttons Section */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {/* Primary Action: Book Appointment */}
          <Link
            href="/appointments"
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Appointment
          </Link>

          {/* Secondary Action: View Vitals */}
          <Link
            href="/vitals"
            className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-100 border border-slate-600 font-semibold rounded-xl backdrop-blur-md shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Vitals
          </Link>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 pt-6">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex ? "w-8 bg-blue-500" : "w-2 bg-white/40"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}