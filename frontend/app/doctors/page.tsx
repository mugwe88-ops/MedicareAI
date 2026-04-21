"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  city: string;
  rating: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const city = searchParams.get("city") || "";

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        // Calling your actual backend
        const res = await fetch(`${API_BASE}/api/doctors?q=${query}&city=${city}`);
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
      <h1 className="text-2xl font-bold mb-6 text-gray-400">
        Search Results for: <span className="text-blue-600">{query || "All Doctors"}</span> {city && `in ${city}`}
      </h1>

      {loading ? (
        <div className="text-center py-10">Searching for doctors...</div>
      ) : doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div key={doc.id} className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
              <h2 className="text-xl font-bold text-blue-900">{doc.name}</h2>
              <p className="text-gray-600 font-medium">{doc.specialty}</p>
              <p className="text-gray-400 text-sm mb-4">{doc.city}</p>
              <div className="flex items-center text-yellow-500 mb-4">
                ⭐ {doc.rating || "4.5"}
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
                Book Now
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          No doctors found matching your search.
        </div>
      )}
    </div>
  );
}

// Next.js requires Suspense for components using searchParams
export default function DoctorsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense fallback={<div>Loading search...</div>}>
        <SearchResults />
      </Suspense>
    </main>
  );
}