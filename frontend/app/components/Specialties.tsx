"use client";
import { 
  Stethoscope, UserRound, Baby, 
  HeartPulse, Activity, Bone 
} from "lucide-react";

const specialties = [
  { name: "General Physician", icon: <Stethoscope size={24} />, color: "text-blue-600", bg: "bg-blue-50" },
  { name: "Dermatologist", icon: <UserRound size={24} />, color: "text-rose-600", bg: "bg-rose-50" },
  { name: "Pediatrician", icon: <Baby size={24} />, color: "text-amber-600", bg: "bg-amber-50" },
  { name: "Gynecologist", icon: <HeartPulse size={24} />, color: "text-purple-600", bg: "bg-purple-50" },
  { name: "Dentist", icon: <Activity size={24} />, color: "text-emerald-600", bg: "bg-emerald-50" },
  { name: "Orthopedic", icon: <Bone size={24} />, color: "text-indigo-600", bg: "bg-indigo-50" },
];

export default function Specialties() {
  return (
    <section className="relative z-30 -mt-24 px-6">
      <div className="max-w-7xl mx-auto bg-white rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-slate-100 p-12">
        <div className="text-center mb-12">
          <span className="text-[10px] font-black tracking-[0.3em] text-blue-600 uppercase">
            Categories
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-2">
            Book by Speciality
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {specialties.map((item, index) => (
            <button
              key={index}
              className="group flex flex-col items-center p-6 rounded-3xl hover:bg-slate-50 transition-all duration-300 border border-transparent hover:border-slate-100"
            >
              <div className={`mb-4 p-5 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider text-center leading-tight">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}