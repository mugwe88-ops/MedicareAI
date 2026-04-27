"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, MapPin, Stethoscope, User, Baby, 
  HeartPulse, Activity, Bone, Video, Pill, Microscope 
} from "lucide-react";

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
    const params = new URLSearchParams();
    if (finalQuery) params.append("query", finalQuery);
    if (city) params.append("city", city);
    router.push(`/doctors?${params.toString()}`);
  };

  return (
    <div className="w-full bg-slate-50">
      {/* Main Banner Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 pt-16 pb-24 px-4 text-white text-center">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
            Find the Best Doctors Near You
          </h1>
          <p className="mt-2 text-lg font-medium opacity-90">
            Book appointments instantly
          </p>

          {/* Search Bar */}
          <div className="mt-10 bg-white p-2 md:p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-4xl mx-auto border border-white/20">
            <div className="flex items-center flex-1 px-4 border-b md:border-b-0 md:border-r border-slate-100">
              <Search className="text-slate-400 mr-2" size={20} />
              <input
                type="text"
                placeholder="Search doctor or specialty..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full py-4 text-slate-900 outline-none placeholder:text-slate-400 font-bold"
              />
            </div>
            <div className="flex items-center flex-1 px-4">
              <MapPin className="text-slate-400 mr-2" size={20} />
              <input
                type="text"
                placeholder="City (Nairobi, Lagos...)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full py-4 text-slate-900 outline-none placeholder:text-slate-400 font-bold"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              className="bg-blue-600 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95"
            >
              Search
            </button>
          </div>

          {/* Book by Speciality Grid */}
          <div className="mt-16">
            <p className="text-white/80 font-black text-[10px] uppercase tracking-[0.4em] mb-8">
              Book by Speciality
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
              {specialties.map((spec) => {
                const Icon = spec.icon;
                return (
                  <button
                    key={spec.name}
                    onClick={() => handleSearch(spec.name)}
                    className="flex flex-col items-center justify-center p-6 bg-white/10 hover:bg-white border border-white/10 hover:border-white rounded-2xl transition-all duration-300 group shadow-lg active:scale-95"
                  >
                    <div className="mb-3 p-3 bg-white/10 rounded-full group-hover:bg-blue-600 transition-colors">
                      <Icon size={22} className="text-white group-hover:text-white" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tighter text-white group-hover:text-blue-600 leading-tight">
                      {spec.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Overlapping Service Cards Section */}
      <section className="max-w-6xl mx-auto -mt-12 px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {[
          { 
            title: "Find Doctors", 
            icon: Stethoscope, 
            color: "text-blue-600", 
            bg: "bg-blue-50",
            path: "/doctors" 
          },
          { 
            title: "Video Consult", 
            icon: Video, 
            color: "text-emerald-500", 
            bg: "bg-emerald-50",
            path: "/video-consult"
          },
          { 
            title: "Order Medicines", 
            icon: Pill, 
            color: "text-red-500", 
            bg: "bg-red-50",
            path: "/medicines"
          },
          { 
            title: "Lab Tests", 
            icon: Microscope, 
            color: "text-orange-500", 
            bg: "bg-orange-50",
            path: "/lab-tests"
          }
        ].map((item) => (
          <div 
            key={item.title} 
            onClick={() => router.push(item.path)}
            className="bg-white p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all border border-slate-100 flex flex-col items-center text-center group cursor-pointer"
          >
            <div className={`w-16 h-16 ${item.bg} rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <item.icon size={32} className={item.color} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">{item.title}</h3>
            <p className="text-sm text-slate-400 font-bold leading-relaxed">
              Safe and fast healthcare services
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}