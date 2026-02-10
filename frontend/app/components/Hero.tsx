"use client";

import { useEffect, useState } from "react";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  city: string;
};

export default function Hero() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ======================
     LIVE SEARCH DOCTORS
  ====================== */
  useEffect(() => {
    if (query.length < 2) {
      setDoctors([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/doctors?q=${query}`);
        const data = await res.json();
        setDoctors(data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Doctor search failed", err);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [query]);

  /* ======================
     SEARCH BUTTON
  ====================== */
  const handleSearch = () => {
    window.location.href = `/doctors?query=${query}&city=${city}`;
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

        {/* SEARCH BOX */}
        <div className="mt-8 bg-white p-3 md:p-4 rounded-xl shadow-lg flex flex-col md:flex-row gap-3 relative">

          {/* Doctor Search Input */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search doctor or specialty..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              className="w-full p-3 border rounded-lg text-black focus:outline-none"
            />

            {/* Dropdown */}
            {showDropdown && (doctors.length > 0 || loading) && (
              <div className="absolute top-full left-0 bg-white text-black w-full border rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                {loading && (
                  <div className="p-2 text-gray-500">Searching...</div>
                )}

                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setQuery(doc.name);
                      setCity(doc.city);
                      setShowDropdown(false);
                    }}
                    className="p-2 hover:bg-blue-100 cursor-pointer text-sm"
                  >
                    <b>{doc.name}</b> — {doc.specialty} ({doc.city})
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
            className="p-3 border rounded-lg text-black w-full"
          />

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition w-full md:w-auto"
          >
            Search
          </button>

        </div>
      </div>
    </section>
  );
}
