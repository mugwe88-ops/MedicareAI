"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Star, Calendar, ArrowLeft } from "lucide-react";

export default function DoctorsDirectory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://your-render-backend-url.onrender.com";

  useEffect(() => {
    async function fetchDoctors() {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/doctors?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(initialCategory)}`);
        const data = await res.json();
        setDoctors(data);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, [searchQuery, initialCategory]);

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans flex justify-center">
      <div className="w-full max-w-5xl bg-slate-50 rounded-3xl shadow-xl p-8 space-y-6 border border-slate-200">
        
        {/* Header & Back */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <h1 className="text-xl font-black text-slate-900">Doctor Directory</h1>
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or specialty..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-slate-800 outline-none focus:border-blue-600 shadow-sm"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 font-bold">Loading doctors from database...</div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-bold">No doctors found matching your search.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doc: any) => (
              <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl">
                    {doc.name ? doc.name.charAt(0) : "D"}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">{doc.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase">{doc.specialty}</p>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{doc.rating || "4.8"}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/appointments?doctorId=${doc.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-md transition-colors"
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
  );
}
