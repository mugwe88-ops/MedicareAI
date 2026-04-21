"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  city: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Hero() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setDoctors([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/doctors?q=${query}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setDoctors(data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Doctor search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = () => {
    const params = new URLSearchParams({ query, city });
    router.push(`/doctors?${params.toString()}`);
  };

  return (
    <section className="bg-gradient-to-r from-cyan-500 to-blue-600 py-14 px-4 text-white">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold">
          Find the Best Doctors Near You
        </h1>
        <p className="mt-2 text-base md:text-lg">
          Book appointments instantly
        </p>

        <div className="mt-8 bg-white p-3 md:p-4 rounded-xl shadow-lg flex flex-col md:flex-row gap-3 relative">
          
          <div className="relative w-full" ref={dropdownRef}>
            <input
              type="text"
              placeholder="Search doctor or specialty..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setShowDropdown(true)}
              className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none"
            />

            {showDropdown && (doctors.length > 0 || loading) && (
              <div className="absolute top-full left-0 mt-2 bg-white text-black w-full border rounded-lg shadow-2xl max-h-60 overflow-y-auto z-50">
                {loading && (
                  <div className="p-3 text-gray-500">Searching...</div>
                )}

                {!loading && doctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setQuery(doc.name);
                      setCity(doc.city);
                      setShowDropdown(false);
                    }}
                    className="p-3 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-b-0 flex justify-between items-center"
                  >
                    <div className="text-left">
                      <div className="font-bold text-blue-900">{doc.name}</div>
                      <div className="text-gray-600 text-xs">{doc.specialty}</div>
                    </div>
                    <span className="text-gray-400 text-xs">{doc.city}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="City (Nairobi, Lagos...)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="p-3 border rounded-lg text-black w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all w-full md:w-auto"
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
}