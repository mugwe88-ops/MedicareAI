"use client";

import { useState } from "react";
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

  const specialties = [
    { name: "General Physician", icon: Stethoscope, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Dermatologist", icon: User, color: "text-purple-600", bg: "bg-purple-100" },
    { name: "Pediatrician", icon: Baby, color: "text-orange-600", bg: "bg-orange-100" },
    { name: "Gynecologist", icon: Heart, color: "text-rose-600", bg: "bg-rose-100" },
    { name: "Dentist", icon: Activity, color: "text-cyan-600", bg: "bg-cyan-100" },
    { name: "Orthopedic", icon: Bone, color: "text-emerald-600", bg: "bg-emerald-100" },
  ];

  return (
    <div className="w-full bg-slate-50 pt-20">
      {/* HERO */}
      <section className="bg-[#237BFF] pt-16 pb-28 px-4 text-white">
        <div className="max-w-6xl mx-auto text-center flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            Find the Best Doctors Near You
          </h1>

          <p className="text-base md:text-lg text-white/80 mb-8">
            Verified specialists available for instant booking.
          </p>

          {/* SEARCH (NO OVERLAP) */}
          <div className="w-full max-w-4xl bg-white rounded-2xl flex flex-col md:flex-row items-center p-2 shadow-xl">
            <div className="flex-1 flex items-center px-4 w-full border-b md:border-b-0 md:border-r border-slate-200">
              <MapPin className="text-blue-500 mr-2" size={18} />
              <select className="w-full py-3 text-slate-900 bg-transparent outline-none text-sm font-semibold">
                <option>Nairobi, Kenya</option>
              </select>
            </div>

            <div className="flex-[2] flex items-center px-4 w-full">
              <Search className="text-slate-400 mr-2" size={18} />
              <input
                type="text"
                placeholder="Search doctors, symptoms..."
                className="w-full py-3 text-slate-800 outline-none text-sm"
              />
            </div>

            <button className="w-full md:w-auto bg-[#237BFF] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 text-sm">
              Find
            </button>
          </div>
        </div>
      </section>

      {/* SPECIALTIES */}
      <section className="pt-12 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              Book by Speciality
            </h2>
            <div className="h-1 w-16 bg-blue-600 mx-auto mt-2 rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {specialties.map((spec) => {
              const Icon = spec.icon;
              const isActive = active === spec.name;

              return (
                <button
                  key={spec.name}
                  onClick={() => {
                    console.log(spec.name);
                    setActive(spec.name);
                  }}
                  className="group"
                >
                  <div
                    className={`p-5 rounded-2xl border-2 transition-all
                    ${
                      isActive
                        ? "bg-white border-blue-600 shadow-lg scale-105"
                        : "bg-slate-200 border-slate-300 hover:bg-white hover:border-blue-400"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 mx-auto flex items-center justify-center rounded-xl mb-3
                      ${
                        isActive
                          ? "bg-blue-600"
                          : spec.bg
                      }`}
                    >
                      <Icon
                        size={22}
                        className={isActive ? "text-white" : spec.color}
                      />
                    </div>

                    <p
                      className={`text-[11px] font-bold text-center
                      ${
                        isActive ? "text-blue-700" : "text-slate-700"
                      }`}
                    >
                      {spec.name}
                    </p>
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