"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Added for navigation
import {
  Stethoscope,
  User,
  Baby,
  Heart,
  Activity,
  Bone,
  Search,
  MapPin,
} from "lucide-react";

export default function Hero() {
  const [active, setActive] = useState("Gynecologist");
  const router = useRouter(); // Initialize router

  const specialties = [
    { name: "General Physician", icon: Stethoscope, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Dermatologist", icon: User, color: "text-purple-600", bg: "bg-purple-100" },
    { name: "Pediatrician", icon: Baby, color: "text-orange-600", bg: "bg-orange-100" },
    { name: "Gynecologist", icon: Heart, color: "text-rose-600", bg: "bg-rose-100" },
    { name: "Dentist", icon: Activity, color: "text-cyan-600", bg: "bg-cyan-100" },
    { name: "Orthopedic", icon: Bone, color: "text-emerald-600", bg: "bg-emerald-100" },
  ];

  const handleSpecialtyClick = (name: string) => {
    setActive(name);
    // Navigates to the appointments area for that specific specialty
    router.push(`/appointments?specialty=${encodeURIComponent(name)}`);
  };

  return (
    <div className="w-full bg-slate-50 pt-20">
      <section className="bg-[#237BFF] pt-16 pb-28 px-4 text-white">
        <div className="max-w-6xl mx-auto text-center flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            Find the Best Doctors Near You
          </h1>
          <p className="text-base md:text-lg text-white/80 mb-8">
            Verified specialists available for instant booking.
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-3xl bg-white rounded-xl p-2 flex flex-col md:flex-row gap-2 shadow-lg">
            <div className="flex-1 flex items-center px-4 border-r border-slate-100">
              <MapPin className="text-slate-400 mr-2" size={20} />
              <select className="bg-transparent text-slate-900 w-full outline-none">
                <option>Nairobi, Kenya</option>
              </select>
            </div>
            <div className="flex-[1.5] flex items-center px-4">
              <Search className="text-slate-400 mr-2" size={20} />
              <input 
                type="text" 
                placeholder="dermatology" 
                className="bg-transparent text-slate-900 w-full outline-none"
              />
            </div>
            <button className="bg-[#237BFF] text-white px-8 py-3 rounded-lg font-bold">
              Find
            </button>
          </div>
        </div>
      </section>

      {/* Specialties Selection */}
      <div className="max-w-6xl mx-auto -mt-16 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-slate-800">
            Book by <span className="border-b-4 border-blue-600 pb-1">Speciality</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {specialties.map((item) => (
              <button
                key={item.name}
                onClick={() => handleSpecialtyClick(item.name)}
                className={`flex flex-col items-center p-6 rounded-xl transition-all duration-300 ${
                  active === item.name 
                  ? "ring-2 ring-blue-600 bg-blue-50 shadow-md" 
                  : "bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className={`p-3 rounded-lg mb-3 ${item.bg} ${item.color}`}>
                  <item.icon size={24} />
                </div>
                <span className="text-xs font-bold text-slate-700 text-center">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}