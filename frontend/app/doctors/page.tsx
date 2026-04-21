"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";

// Interface updated to match backend alias names
interface Doctor {
  id: string;
  full_name: string; // Matches 'name AS full_name' in model
  specialty: string; // Matches 'specialization AS specialty' in model
  city: string;
  rating: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || ""; // Matches Hero.tsx param
  const city = searchParams.get("city") || "";

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        // Construct the URL using 'query' to match backend routes.js
        const searchUrl = `${API_BASE}/api/doctors?query=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`;
        
        const res = await fetch(searchUrl, {
          cache: "no-store", // Ensure fresh data on every search
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setDoctors(data);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, city]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Search Results for: <span className="text-blue-600">{query || "All Doctors"}</span> 
        {city && <span> in <span className="text-blue-600">{city}</span></span>}
      </h1>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Searching for doctors...</p>
        </div>
      ) : doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div key={doc.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                  {doc.full_name?.charAt(0) || "D"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{doc.full_name}</h2>
                  <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide">
                    {doc.specialty}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <p className="text-gray-500 text-sm flex items-center gap-2">
                  📍 {doc.city}
                </p>
                <div className="flex items-center text-yellow-500 font-bold">
                  ⭐ {doc.rating || "4.8"} <span className="text-gray-400 text-xs ml-1 font-normal">(New)</span>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-sm">
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-lg">No doctors found matching your criteria.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-4 text-blue-600 font-semibold hover:underline"
          >
            Try a different search
          </button>
        </div>
      )}
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <Suspense fallback={
        <div className="max-w-7xl mx-auto p-6 text-center py-20">
          Loading MedicareAI Registry...
        </div>
      }>
        <SearchResults />
      </Suspense>
    </main>
  );
}