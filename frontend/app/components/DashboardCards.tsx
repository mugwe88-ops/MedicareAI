"use client";

import { Star, ShieldCheck, Clock, Calendar } from "lucide-react";

export default function DoctorCards() {
  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Jenkins, MD",
      specialty: "Cardiologist",
      experience: "14 yrs experience",
      rating: "4.9",
      reviews: "128",
      languages: "English • Swahili",
      fee: "KSh 800",
      nextAvailable: "3:00 PM Today",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Dr. Marcus Vance, MD",
      specialty: "General Physician",
      experience: "9 yrs experience",
      rating: "4.8",
      reviews: "94",
      languages: "English",
      fee: "KSh 500",
      nextAvailable: "In 15 Mins",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 3,
      name: "Dr. Amina Patel, MD",
      specialty: "Dermatologist",
      experience: "11 yrs experience",
      rating: "5.0",
      reviews: "210",
      languages: "English • Gujarati",
      fee: "KSh 1,000",
      nextAvailable: "Tomorrow, 10:00 AM",
      image: "https://images.unsplash.com/photo-1594824813566-88855ce78341?q=80&w=800&auto=format&fit=crop",
    },
  ];

  return (
    <section className="py-16 max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Consult Top Specialists
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Verified physicians available for immediate online or clinic appointments.
          </p>
        </div>
        <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
          View All Doctors →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="relative rounded-2xl overflow-hidden mb-4 h-48 bg-slate-100">
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 flex items-center gap-1 shadow-sm">
                  <Star size={12} className="text-amber-500 fill-amber-500" />
                  {doc.rating} ({doc.reviews})
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold mb-1">
                <ShieldCheck size={14} /> Verified Specialist
              </div>

              <h3 className="text-lg font-bold text-slate-900">{doc.name}</h3>
              <p className="text-xs font-medium text-slate-500">
                {doc.specialty} • {doc.experience}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold">LANGUAGES</span>
                  <span className="font-semibold text-slate-700">{doc.languages}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold">CONSULT FEE</span>
                  <span className="font-bold text-slate-900">{doc.fee}</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 mb-3 bg-emerald-50 px-3 py-1.5 rounded-xl">
                <Clock size={13} /> Next Available: {doc.nextAvailable}
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all text-sm active:scale-95">
                Book Consultation
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}