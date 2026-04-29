"use client";
import { Search, MapPin, Stethoscope, User, Baby, HeartPulse, Activity, Bone } from "lucide-react";

export default function Hero() {
  const specialties = [
    { name: "General Physician", icon: Stethoscope },
    { name: "Dermatologist", icon: User },
    { name: "Pediatrician", icon: Baby },
    { name: "Gynecologist", icon: HeartPulse },
    { name: "Dentist", icon: Activity },
    { name: "Orthopedic", icon: Bone },
  ];

  return (
    <div className="w-full">
      {/* Blue Header Section */}
      <section className="bg-blue-600 pt-16 pb-32 px-4 text-white text-center">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            Find the Best Doctors Near You
          </h1>
          
          {/* Search Bar */}
          <div className="mt-10 bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:row gap-2 max-w-4xl mx-auto border border-slate-200">
             {/* ... (Your existing Search Bar code) ... */}
          </div>
        </div>
      </section>

      {/* Single, High-Contrast Specialty Card */}
      <section className="max-w-6xl mx-auto -mt-20 px-4 relative z-10">
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 md:p-12 border border-slate-50">
          <div className="text-center mb-10">
            <span className="text-blue-600 font-black text-[11px] uppercase tracking-[0.3em]">
              Categories
            </span>
            <h2 className="text-2xl font-black text-slate-800 mt-2">Book by Speciality</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {specialties.map((spec) => {
              const Icon = spec.icon;
              return (
                <button
                  key={spec.name}
                  className="flex flex-col items-center justify-center group"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-blue-600 group-hover:shadow-lg group-hover:shadow-blue-200 group-hover:-translate-y-1">
                    <Icon size={24} className="text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-500 group-hover:text-blue-600 transition-colors">
                    {spec.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}