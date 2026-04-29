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
    { name: "General Physician", icon: Stethoscope, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Dermatologist", icon: User, color: "text-rose-600", bg: "bg-rose-50" },
    { name: "Pediatrician", icon: Baby, color: "text-amber-600", bg: "bg-amber-50" },
    { name: "Gynecologist", icon: HeartPulse, color: "text-purple-600", bg: "bg-purple-50" },
    { name: "Dentist", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "Orthopedic Surgeon", icon: Bone, color: "text-indigo-600", bg: "bg-indigo-50" },
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
      {/* Main Blue Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 pt-20 pb-40 px-4 text-white text-center">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            Find the Best Doctors Near You
          </h1>
          <p className="text-lg font-medium text-blue-50 opacity-90 mb-12">
            Book appointments instantly
          </p>

          {/* Floating Search Bar */}
          <div className="bg-white p-2 md:p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-4xl mx-auto border border-white/20">
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
              className="bg-blue-600 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Overlapping Specialties Card Container */}
      <div className="max-w-6xl mx-auto px-4 -mt-24 relative z-10">
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="text-center mb-8">
            <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-2">
              Categories
            </p>
            <h2 className="text-2xl font-black text-slate-900">Book by Speciality</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {specialties.map((spec) => {
              const Icon = spec.icon;
              return (
                <button
                  key={spec.name}
                  onClick={() => handleSearch(spec.name)}
                  className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-50 shadow-sm hover:shadow-md hover:-translate-y-2 transition-all duration-300 group"
                >
                  <div className={`mb-4 p-4 ${spec.bg} rounded-2xl group-hover:scale-110 transition-transform`}>
                    <Icon size={28} className={spec.color} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 group-hover:text-blue-600">
                    {spec.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Services Section */}
      <section className="max-w-6xl mx-auto px-4 mt-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Find Doctors", icon: Stethoscope, color: "text-blue-600", bg: "bg-blue-50", path: "/doctors" },
            { title: "Video Consult", icon: Video, color: "text-emerald-500", bg: "bg-emerald-50", path: "/video-consult" },
            { title: "Order Medicines", icon: Pill, color: "text-red-500", bg: "bg-red-50", path: "/medicines" },
            { title: "Lab Tests", icon: Microscope, color: "text-orange-500", bg: "bg-orange-50", path: "/lab-tests" }
          ].map((item) => (
            <div 
              key={item.title} 
              onClick={() => router.push(item.path)}
              className="bg-white p-8 rounded-[2rem] shadow-lg hover:shadow-xl transition-all border border-slate-100 flex flex-col items-center text-center group cursor-pointer"
            >
              <div className={`w-16 h-16 ${item.bg} rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                <item.icon size={32} className={item.color} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 font-bold">Safe and fast healthcare</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}