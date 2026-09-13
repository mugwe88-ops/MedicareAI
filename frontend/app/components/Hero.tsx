"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ShieldCheck,
  Clock,
  Video,
  Award,
  ChevronRight,
} from "lucide-react";

export default function Hero() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/appointments?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <section className="relative pt-32 pb-16 bg-gradient-to-b from-blue-50/60 via-white to-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Text Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-700 font-semibold text-xs tracking-wide">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              AI-POWERED TELEHEALTH PLATFORM
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.12] tracking-tight">
              Healthcare in <span className="text-blue-600">Minutes</span>, Not Hours.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Connect instantly with licensed doctors, receive digital prescriptions, schedule lab sample pickups, and keep medical records secure—all in one place.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => router.push("/appointments")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 hover:-translate-y-0.5 transition-all"
              >
                Consult Now
              </button>
              <button
                onClick={() => router.push("/clinic-visit")}
                className="bg-white hover:bg-slate-100 text-slate-800 font-bold px-7 py-3.5 rounded-2xl border border-slate-200 shadow-sm transition-all"
              >
                Book Clinic Visit
              </button>
            </div>

            {/* Metrics Ribbon */}
            <div className="pt-8 grid grid-cols-3 gap-6 border-t border-slate-200/80">
              <div>
                <p className="text-2xl font-black text-slate-900">24/7</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Doctor Availability</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">100%</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Verified Care</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">&lt; 2 mins</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Average Response</p>
              </div>
            </div>
          </div>

          {/* Right Hero Image Column with Floating Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-4xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1000&auto=format&fit=crop"
                alt="Doctor Consultation"
                className="w-full h-[480px] object-cover"
              />
            </div>

            {/* Floating Badge 1: Verified Doctor */}
            <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-3.5 animate-float-slow">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Licensed Doctors</p>
                <p className="text-[11px] text-slate-500">Board-certified clinical team</p>
              </div>
            </div>

            {/* Floating Badge 2: Wait Time */}
            <div className="absolute top-8 -right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float-delayed">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">2-Min Wait Time</p>
                <p className="text-[10px] text-slate-500 font-medium">Instant Consultation</p>
              </div>
            </div>
          </div>

        </div>

        {/* Embedded Universal Search Bar */}
        <div className="mt-14">
          <form
            onSubmit={handleSearch}
            className="bg-white p-3 rounded-3xl shadow-soft border border-slate-100 flex flex-col md:flex-row items-center gap-3 max-w-4xl mx-auto"
          >
            <div className="flex-1 flex items-center gap-3 px-4 w-full">
              <Search className="text-slate-400 shrink-0" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search doctors, specialties, symptoms, or medications..."
                className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm focus:outline-none py-2"
              />
            </div>
            <div className="flex items-center gap-2 px-4 border-t md:border-t-0 md:border-l border-slate-100 w-full md:w-auto py-2 md:py-0">
              <MapPin className="text-slate-400 shrink-0" size={18} />
              <select className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer">
                <option>Nairobi, Kenya</option>
                <option>Mombasa, Kenya</option>
                <option>Nakuru, Kenya</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-2xl transition-all text-sm shrink-0"
            >
              Search
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}