"use client";
import { useState } from "react";
import { Stethoscope, User, Baby, HeartPulse, Activity, Bone, Search, MapPin, ChevronDown } from "lucide-react";

export default function Hero() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Nairobi");

  const specialties = [
    { name: "General Physician", icon: Stethoscope },
    { name: "Dermatologist", icon: User },
    { name: "Pediatrician", icon: Baby },
    { name: "Gynecologist", icon: HeartPulse, active: true },
    { name: "Dentist", icon: Activity },
    { name: "Orthopedic", icon: Bone },
  ];

  const cities = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Juja"];

  return (
    <div className="w-full pt-20">
      {/* 1. Flat Blue Banner Section */}
      <section className="bg-[#237BFF] py-16 px-4 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Find the Best Doctors Near You</h1>
          <p className="text-lg font-medium text-white/80 mb-10">Book appointments instantly with top-rated specialists</p>
          
          {/* Dual-Input Search Bar (Practo Style) */}
          <div className="max-w-4xl mx-auto bg-white rounded-xl flex flex-col md:flex-row items-center p-1.5 shadow-xl">
            <div className="flex-1 flex items-center px-4 w-full border-b md:border-b-0 md:border-r border-slate-100">
              <MapPin className="text-slate-400 mr-2" size={18} />
              <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full py-4 text-slate-700 bg-transparent outline-none cursor-pointer"
              >
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-[1.5] flex items-center px-4 w-full">
              <Search className="text-slate-400 mr-2" size={18} />
              <input 
                type="text" 
                placeholder="Search doctors, clinics, hospitals, etc." 
                className="w-full py-4 text-slate-700 outline-none placeholder-slate-400"
              />
            </div>
            <button className="w-full md:w-auto bg-[#237BFF] text-white font-bold px-10 py-4 rounded-lg hover:bg-blue-700 transition-all">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* 2. Flat Specialty Grid (White Background) */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-800">Book by Speciality</h2>
            <p className="text-slate-500 mt-2 text-sm">Find verified specialists across all categories</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {specialties.map((spec) => {
              const Icon = spec.icon;
              return (
                <button key={spec.name} className="flex flex-col items-center group">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-all 
                    ${spec.active ? "bg-blue-50 border-2 border-blue-400" : "bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-md"}`}>
                    <Icon size={32} className={spec.active ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"} />
                  </div>
                  <span className="text-[12px] font-bold text-slate-600 uppercase tracking-tight">{spec.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}