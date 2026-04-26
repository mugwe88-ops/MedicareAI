"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, User, Baby, HeartPulse, Activity, Bone } from "lucide-react";

export default function Hero() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const router = useRouter();

  const specialties = [
    { name: "General Physician", icon: Stethoscope },
    { name: "Dermatologist", icon: User },
    { name: "Pediatrician", icon: Baby },
    { name: "Gynecologist", icon: HeartPulse },
    { name: "Dentist", icon: Activity },
    { name: "Orthopedic Surgeon", icon: Bone },
  ];

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    // We use encodeURIComponent to handle spaces like "Orthopedic Surgeon"
    const params = new URLSearchParams();
    if (finalQuery) params.append("query", finalQuery);
    if (city) params.append("city", city);
    
    router.push(`/doctors?${params.toString()}`);
  };

  return (
    <section className="bg-gradient-to-r from-cyan-500 to-blue-600 py-14 px-4 text-white text-center">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black tracking-tighter">Find the Best Doctors Near You</h1>
        <p className="mt-2 text-lg font-medium opacity-90">Book appointments instantly</p>

        {/* Search Bar */}
        <div className="mt-8 bg-white p-3 md:p-4 rounded-xl shadow-2xl flex flex-col md:flex-row gap-3 max-w-4xl mx-auto border border-white/20">
          <input
            type="text"
            placeholder="Search doctor or specialty..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-4 border-none rounded-lg text-slate-900 outline-none focus:ring-0 placeholder:text-slate-400 font-bold"
          />
          <div className="hidden md:block w-px h-10 bg-slate-100 self-center"></div>
          <input
            type="text"
            placeholder="City (Nairobi, Lagos...)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full md:w-64 p-4 border-none rounded-lg text-slate-900 outline-none focus:ring-0 placeholder:text-slate-400 font-bold"
          />
          <button
            onClick={() => handleSearch()}
            className="bg-blue-600 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            Search
          </button>
        </div>

        {/* Navy Specialist Buttons */}
        <div className="mt-14">
          <p className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">Book by Speciality</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {specialties.map((spec) => {
              const Icon = spec.icon;
              return (
                <button
                  key={spec.name}
                  onClick={() => handleSearch(spec.name)}
                  className="flex flex-col items-center justify-center p-6 bg-[#0f172a] hover:bg-white border border-slate-800 hover:border-white rounded-2xl transition-all duration-300 group shadow-xl active:scale-95"
                >
                  <div className="mb-3 p-3 bg-blue-600/20 rounded-full group-hover:bg-blue-600 transition-colors">
                    <Icon size={24} className="text-blue-400 group-hover:text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-300 group-hover:text-blue-600">
                    {spec.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}