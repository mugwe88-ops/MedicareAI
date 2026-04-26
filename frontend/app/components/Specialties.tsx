"use client";

import { useRouter } from "next/navigation";
import {
  Stethoscope,
  Baby,
  Activity,
  HeartPulse,
  User,
  Bone,
} from "lucide-react";

export default function Speciality() {
  const router = useRouter();

  const specs = [
    { name: "General Physician", icon: Stethoscope },
    { name: "Dermatologist", icon: User },
    { name: "Pediatrician", icon: Baby },
    { name: "Gynecologist", icon: HeartPulse },
    { name: "Dentist", icon: Activity }, 
    { name: "Orthopedic Surgeon", icon: Bone },
  ];

  const handleSpecialtyClick = (specialtyName: string) => {
    // Navigates to doctors page with the specialty as a query parameter
    router.push(`/doctors?query=${encodeURIComponent(specialtyName)}`);
  };

  return (
    <section className="py-12 bg-slate-900 text-white">
      <h2 className="text-xl md:text-2xl font-bold text-center mb-8 tracking-tight">
        Book by Speciality
      </h2>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {specs.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.name}
                onClick={() => handleSpecialtyClick(s.name)}
                className="bg-slate-800 p-4 rounded-xl flex flex-col items-center text-center 
                           hover:bg-blue-600 cursor-pointer transition-all duration-200 
                           min-h-[130px] border border-slate-700 group shadow-lg"
              >
                {/* Circle Icon */}
                <div className="bg-blue-600 p-3 rounded-full mb-3 group-hover:bg-white/20 transition-colors">
                  <Icon size={24} className="text-white" />
                </div>

                {/* Name */}
                <p className="text-xs sm:text-sm font-bold leading-tight break-words tracking-tighter uppercase">
                  {s.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}