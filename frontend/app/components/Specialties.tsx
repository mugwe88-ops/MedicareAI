"use client";

import {
  Stethoscope,
  Baby,
  Tooth,
  HeartPulse,
  User,
  Bone,
} from "lucide-react";

export default function Speciality() {
  const specs = [
    { name: "General Physician", icon: Stethoscope },
    { name: "Dermatologist", icon: User },
    { name: "Pediatrician", icon: Baby },
    { name: "Gynecologist", icon: HeartPulse },
    { name: "Dentist", icon: Tooth },
    { name: "Orthopedic Surgeon", icon: Bone },
  ];

  return (
    <section className="py-12 bg-slate-900 text-white">
      <h2 className="text-xl md:text-2xl font-bold text-center mb-8">
        Book by Speciality
      </h2>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {specs.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.name}
                className="bg-slate-800 p-4 rounded-xl flex flex-col items-center text-center 
                           hover:bg-slate-700 cursor-pointer transition min-h-[110px]"
              >
                {/* Circle Icon */}
                <div className="bg-blue-600 p-3 rounded-full mb-2">
                  <Icon size={24} className="text-white" />
                </div>

                {/* Name */}
                <p className="text-xs sm:text-sm font-medium leading-tight break-words">
                  {s.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
