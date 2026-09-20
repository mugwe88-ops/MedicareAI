"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Calendar, Clock, Video, UserPlus, FileText, Activity, 
  Search, Bell, ShieldCheck, TrendingUp, AlertTriangle, Stethoscope, Mic, 
  DollarSign, Sparkles, AlertCircle, Settings, RefreshCw, PlusCircle, ArrowUpRight, X, Filter, Star, Building2, ArrowLeft
} from "lucide-react";

export default function DoctorsDirectoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-600">Loading Doctors Directory...</div>}>
      <DoctorsDirectoryContent />
    </Suspense>
  );
}

function DoctorsDirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");

  // Fetch doctors from Render/Neon backend API
  useEffect(() => {
    async function fetchDoctors() {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const headers = {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        };

        const res = await fetch("https://medicareai-1.onrender.com/api/doctors", { headers });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setDoctors(data);
          } else {
            setDoctors([]);
          }
        } else {
          setDoctors([]);
        }
      } catch (err) {
        console.error("Error fetching doctors from backend:", err);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    const name = doc.display_name || doc.name || "";
    const specialty = doc.specialization || doc.department || "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "All" || specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full p-4 sm:p-6 text-slate-800 antialiased font-sans min-h-screen bg-slate-50">
      
      {/* SEARCH & HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <button onClick={() => router.push("/patient/dashboard")} className="hover:underline flex items-center gap-1 cursor-pointer">
              <ArrowLeft size={14} /> Dashboard
            </button>
            <span>/</span>
            <span>Physician Directory</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Book Top Verified Physicians</h1>
          <p className="text-xs text-slate-500 mt-0.5">Select a specialist for instant telehealth or in-clinic consultations.</p>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctor name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-blue-400 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition"
          />
        </div>
      </div>

      {/* FILTER CATEGORIES */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["All", "General Practice", "Cardiology", "Pediatrics", "Neurology", "Dermatology", "Women's Health"].map((spec) => (
          <button
            key={spec}
            onClick={() => setSelectedSpecialty(spec)}
            className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
              selectedSpecialty === spec
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* DOCTORS GRID */}
      {loading ? (
        <div className="text-center py-20 font-bold text-slate-400 text-sm">Loading doctors from backend database...</div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3 shadow-xs">
          <Stethoscope size={40} className="mx-auto text-slate-300" />
          <h3 className="font-black text-slate-800 text-base">No doctors available</h3>
          <p className="text-xs text-slate-500">No doctors match your filter criteria or the database is currently empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => {
            const docName = doc.display_name || doc.name || "Dr. Specialist";
            const docSpecialty = doc.specialization || doc.department || "General Practice";
            const docRating = doc.rating || "4.9";
            const docFee = doc.consultation_fee || doc.fee || "KES 3500";
            const docAvatar = doc.avatar || doc.profile_picture || "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300";

            return (
              <div key={doc.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <img src={docAvatar} alt={docName} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-50 shadow-sm" />
                    <span className="flex items-center gap-1 text-[11px] font-black bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                      <ShieldCheck size={13} /> Verified
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 text-base">{docName}</h3>
                    <p className="text-xs font-bold text-blue-600">{docSpecialty}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-semibold">
                      <span className="flex items-center gap-1 text-amber-500 font-black"><Star size={13} fill="currentColor" /> {docRating}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Building2 size={13} /> Swift MD Central Clinic</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Consultation Fee</span>
                    <strong className="text-xs font-black text-slate-900">{docFee}</strong>
                  </div>

                  <button
                    onClick={() => router.push(`/patient/dashboard/appointments/book?doctorId=${doc.id}`)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl transition cursor-pointer shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                  >
                    <Calendar size={14} /> Book Visit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}