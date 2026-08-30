"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Star, Calendar, ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-0 md:p-6 font-sans">
      <div className="w-full max-w-5xl bg-slate-50 md:rounded-3xl shadow-2xl p-8 space-y-6 border border-slate-200 min-h-[90vh] flex flex-col">
        
        {/* Header & Back Button */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push("/")} 
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Doctor Directory</h1>
        </div>

        {/* Live Search Input & Filter Indicator */}
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
                className="hover:text-blue-900 ml-2 font-black"
                title="Clear category filter"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Results Grid / Status */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-20 text-slate-400 font-bold text-sm">Querying Neon Database...</div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-bold text-sm">No verified doctors found matching your criteria.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doc) => (
                <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-blue-300 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xl overflow-hidden shadow-inner">
                      {doc.avatar_url ? (
                        <img src={doc.avatar_url} alt={doc.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>👨‍⚕️</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base">{doc.name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{doc.department || "General Practice"}</p>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>4.9</span>
                        <span className="text-slate-400 font-medium ml-1">({doc.experience_years || 5} yrs exp)</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/appointments?doctorId=${doc.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl shadow-md shadow-blue-500/20 transition-all"
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
    </div>
  );
}

export default function DoctorsDirectoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center font-bold text-slate-400">Loading directory...</div>}>
      <DoctorsContent />
    </Suspense>
  );
}
