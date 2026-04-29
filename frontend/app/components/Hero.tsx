"use client";

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
  const specialties = [
    {
      name: "General Physician",
      icon: Stethoscope,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      name: "Dermatologist",
      icon: User,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      name: "Pediatrician",
      icon: Baby,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      name: "Gynecologist",
      icon: Heart, // safer than HeartPulse
      color: "text-rose-600",
      bg: "bg-rose-100",
      active: true,
    },
    {
      name: "Dentist",
      icon: Activity,
      color: "text-cyan-600",
      bg: "bg-cyan-100",
    },
    {
      name: "Orthopedic",
      icon: Bone,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  ];

  return (
    <div className="w-full bg-[#F8FAFC]">
      {/* HERO */}
      <section className="bg-[#237BFF] pt-20 pb-32 px-4 text-white relative overflow-visible">
        <div className="max-w-6xl mx-auto text-center relative z-10 flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter">
            Find the Best Doctors Near You
          </h1>

          <p className="text-base md:text-lg font-medium text-white/80 mb-10 max-w-2xl">
            Verified specialists available for instant booking and video consultations.
          </p>

          {/* SEARCH BAR */}
          <div className="max-w-4xl w-full bg-white rounded-3xl flex flex-col md:flex-row items-center p-2 shadow-2xl absolute left-1/2 -translate-x-1/2 -bottom-8 z-50">
            
            {/* LOCATION */}
            <div className="flex-1 flex items-center px-6 w-full border-b md:border-b-0 md:border-r border-slate-200">
              <MapPin className="text-blue-500 mr-3" size={20} />
              <select className="w-full py-4 text-slate-900 bg-transparent outline-none font-bold text-sm cursor-pointer">
                <option>Nairobi, Kenya</option>
              </select>
            </div>

            {/* SEARCH */}
            <div className="flex-[2] flex items-center px-6 w-full">
              <Search className="text-slate-400 mr-3" size={20} />
              <input
                type="text"
                placeholder="Search doctors, symptoms, clinics..."
                className="w-full py-4 text-slate-800 outline-none font-bold text-sm placeholder-slate-400"
              />
            </div>

            {/* BUTTON */}
            <button className="w-full md:w-auto bg-[#237BFF] text-white font-black px-10 py-4 rounded-2xl hover:bg-blue-700 transition-all text-xs uppercase tracking-widest">
              Find Now
            </button>
          </div>
        </div>
      </section>

      {/* SPECIALTIES */}
      <section className="bg-gradient-to-b from-slate-100 to-slate-50 pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* TITLE */}
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-3">
              Book by Speciality
            </h2>
            <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full" />
          </div>

          {/* GRID */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
            {specialties.map((spec) => {
              const Icon = spec.icon;

              return (
                <button key={spec.name} className="group relative">
                  <div
                    className={`h-full p-6 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 border-2
                    ${
                      spec.active
                        ? "bg-gradient-to-br from-white to-blue-50 border-blue-600 shadow-2xl scale-105 ring-2 ring-blue-200"
                        : "bg-slate-200 border-slate-300 hover:bg-white hover:border-blue-400 hover:shadow-lg hover:-translate-y-1"
                    }`}
                  >
                    {/* ICON */}
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all
                      ${
                        spec.active
                          ? "bg-blue-600 text-white shadow-md"
                          : `${spec.bg} group-hover:scale-110`
                      }`}
                    >
                      {Icon && (
                        <Icon
                          size={28}
                          className={
                            spec.active ? "text-white" : spec.color
                          }
                        />
                      )}
                    </div>

                    {/* TEXT */}
                    <span
                      className={`text-xs font-extrabold uppercase tracking-wider text-center leading-tight transition-colors
                      ${
                        spec.active
                          ? "text-blue-700"
                          : "text-slate-700 group-hover:text-slate-900"
                      }`}
                    >
                      {spec.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}