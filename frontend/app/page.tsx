"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Heart, Eye, Activity, Wind, Stethoscope, Star, ArrowRight, UserCheck, Calendar } from "lucide-react";

export default function ModernPublicLandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { name: "Heart", icon: Heart, color: "bg-red-50 text-red-500" },
    { name: "Ear", icon: Eye, color: "bg-blue-50 text-blue-500" },
    { name: "Kidney", icon: Activity, color: "bg-amber-50 text-amber-500" },
    { name: "Lungs", icon: Wind, color: "bg-emerald-50 text-emerald-500" },
  ];

  const topDoctors = [
    { id: "doc-1", name: "Dr. M. Wagner", specialty: "Neurosurgery", rating: 4.8, image: "👨‍⚕️" },
    { id: "doc-2", name: "Dr. R. Green", specialty: "Pulmonology", rating: 4.9, image: "👩‍⚕️" }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/doctors?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-0 md:p-6 font-sans">
      {/* Main Card Container resembling your modern dashboard screenshots */}
      <div className="w-full max-w-6xl bg-slate-50 md:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col min-h-[90vh]">
        
        {/* TOP HEADER BAR */}
        <header className="bg-white px-8 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <span className="text-slate-900 font-black text-xl tracking-tight">SWIFT MD</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-slate-600 hover:text-blue-600 font-bold text-sm transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-2xl shadow-md shadow-blue-500/20 transition-all"
            >
              Get Started
            </Link>
          </div>
        </header>

        {/* HERO / WELCOME SECTION */}
        <div className="p-8 md:p-12 space-y-8 flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Keep Healthy!</h1>
              <p className="text-slate-500 font-medium text-sm mt-1">Find top specialists, review symptoms, and book virtual appointments instantly.</p>
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-3 self-start md:self-auto">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                👋
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Welcome Guest</p>
                <p className="text-sm font-extrabold text-slate-800">Explore Care Options</p>
              </div>
            </div>
          </div>

          {/* SEARCH BAR INPUT */}
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Doctor, specialty, or health issue..."
              className="w-full bg-white border border-slate-200 shadow-sm rounded-2xl py-4 pl-12 pr-12 text-sm font-medium text-slate-800 outline-none focus:border-blue-600 transition-all"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-50 text-blue-600 p-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors">
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* CATEGORIES SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Categories</h2>
              <button onClick={() => router.push("/doctors")} className="text-xs font-extrabold text-blue-600 hover:underline">
                View all
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <div
                    key={cat.name}
                    onClick={() => router.push(`/doctors?category=${cat.name}`)}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-700 tracking-wide">{cat.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TOP DOCTORS CARDS SECTION */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Top Doctors</h2>
              <button onClick={() => router.push("/doctors")} className="text-xs font-extrabold text-blue-600 hover:underline">
                View all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {topDoctors.map((doc) => (
                <div key={doc.id} className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm flex items-center justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 group-hover:scale-125 transition-transform"></div>
                  
                  <div className="flex items-center gap-4 z-10">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl shadow-inner">
                      {doc.image}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">{doc.name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{doc.specialty}</p>
                      <div className="flex items-center gap-1 mt-2 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{doc.rating}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push(`/appointments?doctorId=${doc.id}`)}
                    className="z-10 w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
                    title="Book Appointment"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
