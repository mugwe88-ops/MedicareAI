"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";

interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
  city: string;
  rating: number;
}

// Ensure this is exactly your Render URL
const API_BASE = "https://medicareai-1.onrender.com";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const city = searchParams.get("city") || "";

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const searchUrl = `${API_BASE}/api/doctors?query=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`;
        
        const res = await fetch(searchUrl, {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          mode: 'cors', // Explicitly ask for CORS
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Registry connection failed");

        const data = await res.json();
        setDoctors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Unable to connect to the medical registry. This is usually a CORS or server-side issue.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, city]);

  return (
    <div className="max-w-7xl mx-auto p-6">
       {/* UI Code... */}
       {error ? (
         <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-200">
           <p className="text-red-600 font-bold">{error}</p>
           <p className="text-xs text-red-400 mt-2">Check if Backend is awake on Render.</p>
         </div>
       ) : (
         /* Render Doctors logic here */
         doctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {doctors.map(doc => (
                <div key={doc.id} className="p-6 bg-white rounded-xl shadow-sm border">
                  <h2 className="font-bold text-lg">{doc.full_name}</h2>
                  <p className="text-blue-600 text-sm font-bold uppercase">{doc.specialty}</p>
                  <p className="text-slate-400 text-xs mt-1">📍 {doc.city}</p>
                </div>
              ))}
            </div>
         ) : !loading && <p className="text-center text-slate-400">No doctors found matching "{query}"</p>
       )}
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <Suspense fallback={<div className="p-20 text-center">Loading registry...</div>}>
        <SearchResults />
      </Suspense>
    </main>
  );
}