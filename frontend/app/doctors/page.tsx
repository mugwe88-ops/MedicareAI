"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Star, Calendar, LayoutDashboard, Video, Clock, Settings, User } from "lucide-react";

interface Doctor {
  id: number | string;
  name: string;
  email?: string;
  department?: string;
  experience_years?: number;
  avatar_url?: string;
  phone?: string;
}

function DoctorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://medicareai-backend.onrender.com";

  useEffect(() => {
    async function fetchFilteredDoctors() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (selectedCategory && selectedCategory !== "All") {
          params.append("category", selectedCategory);
        }

        const res = await fetch(`${BACKEND_URL}/api/doctors?${params.toString()}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setDoctors(data);
        }
      } catch (err) {
        console.error("Failed to fetch filtered doctors from DB:", err);
      } finally {
        setLoading(false);
      }
    }

    const delayDebounce = setTimeout(() => {
      fetchFilteredDoctors();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedCategory, BACKEND_URL]);

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-100">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col justify-between p-6">
        <div className="space-y-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">SWIFT MD PORTAL</p>
            <h2 className="text-xl font-black text-white tracking-tight mt-1">Doctor Workspace</h2>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => router.push("/doctors/dashboard")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-bold text-sm transition-all"
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button 
              onClick={() => router.push("/telehealth")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-bold text-sm transition-all"
            >
              <Video className="w-4 h-4" /> Telehealth Room
            </button>
            <button 
              onClick={() => router.push("/doctors/schedule")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-bold text-sm transition-all"
            >
              <Clock className="w-4 h-4" /> Schedule Manager
            </button>
            <button 
              onClick={() => router.push("/settings")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-bold text-sm transition-all"
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="pt-6 border-t border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
            DP
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-black text-white truncate">Dr. PRESSY PHIDES</p>
            <p className="text-[10px] font-bold text-slate-400 truncate">Specialist Physician</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col min-h-screen bg-slate-100 text-slate-900 md:rounded-tl-3xl overflow-hidden shadow-2xl border-l border-slate-200">
        
        {/* TOP HEADER */}
        <header className="bg-white px-8 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Practice Environment</p>
            <h1 className="text-lg font-black text-slate-900">Verified Doctor Directory</h1>
          </div>
          <button 
            onClick={() => router.push("/")}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-4 py-2 rounded-xl transition-colors"
          >
            Back to Home
          </button>
        </header>

        {/* CONTENT BODY */}
        <div className="p-8 space-y-6 flex-1 flex flex-col">
          
          {/* SEARCH & FILTER CONTROLS */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or specialization..."
                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-800 outline-none focus:border-blue-600 shadow-sm transition-all"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            {selectedCategory && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-2xl text-blue-700 text-xs font-extrabold">
                <span>Category: {selectedCategory}</span>
                <button 
                  onClick={() => setSelectedCategory("")} 
                  className="hover:text-blue-900 ml-2 font-black text-sm"
                  title="Clear category filter"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* DOCTOR LISTINGS GRID */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-24 text-slate-400 font-extrabold text-sm">Querying Neon Database...</div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-24 text-slate-400 font-extrabold text-sm">No verified doctors found matching your criteria.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {doctors.map((doc) => (
                  <div key={doc.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xl overflow-hidden shadow-inner">
                        {doc.avatar_url ? (
                          <img src={doc.avatar_url} alt={doc.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>👨‍⚕️</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-base">{doc.name}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{doc.department || "General Practice"}</p>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-1.5">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>4.9</span>
                          <span className="text-slate-400 font-medium ml-1">({doc.experience_years || 5} yrs exp)</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/appointments?doctorId=${doc.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-2xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center"
                      title="Book Appointment"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default function DoctorsDirectoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center font-bold text-slate-400">Loading directory...</div>}>
      <DoctorsContent />
    </Suspense>
  );
}
