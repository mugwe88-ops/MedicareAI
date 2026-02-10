"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  // State
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [filtered, setFiltered] = useState<string[]>([]);

  /* ======================
     FETCH SPECIALTIES
  ====================== */
  useEffect(() => {
    async function loadSpecialties() {
      try {
        const res = await fetch("/api/specialties");
        const data = await res.json();
        setSpecialties(data.map((s: any) => s.name));
      } catch (err) {
        console.error("Failed to load specialties", err);
      }
    }
    loadSpecialties();
  }, []);

  /* ======================
     FILTER DROPDOWN
  ====================== */
  useEffect(() => {
    if (!query) {
      setFiltered([]);
      return;
    }

    const results = specialties.filter((s) =>
      s.toLowerCase().includes(query.toLowerCase())
    );
    setFiltered(results);
  }, [query, specialties]);

  /* ======================
     SEARCH BUTTON
  ====================== */
  const handleSearch = async () => {
    try {
      const res = await fetch(
        `/api/doctors?specialty=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`
      );
      const data = await res.json();
      console.log("Doctors:", data);
      alert(`Found ${data.length || 0} doctors`);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  return (
    <section className="bg-gradient-to-r from-cyan-500 to-blue-600 py-20 text-white">
      <div className="max-w-5xl mx-auto text-center">

        <h1 className="text-4xl font-bold">
          Find the Best Doctors Near You
        </h1>
        <p className="mt-2 text-lg">
          Book appointments instantly
        </p>

        {/* SEARCH BOX */}
        <div className="mt-8 bg-white p-4 rounded-lg flex gap-2 relative shadow-lg">

          {/* Specialty Input */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search specialty..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-3 border rounded text-black"
            />

            {/* Dropdown */}
            {filtered.length > 0 && (
              <div className="absolute bg-white text-black w-full border rounded shadow-lg max-h-40 overflow-y-auto z-50">
                {filtered.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setQuery(s);
                      setFiltered([]);
                    }}
                    className="p-2 hover:bg-blue-100 cursor-pointer"
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* City Input */}
          <input
            type="text"
            placeholder="City (Nairobi, Lagos...)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="p-3 border rounded text-black w-full"
          />

          {/* Search Button */}
          <button
            type="button"
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 rounded font-semibold hover:bg-blue-700 transition"
          >
            Search
          </button>

        </div>
      </div>
    </section>
  );
}
