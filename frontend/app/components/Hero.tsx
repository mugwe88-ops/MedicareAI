"use client";
import { useEffect, useState } from "react";

export default function Hero() {
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<string[]>([]);
  const handleSearch = async () => {
  const res = await fetch(`/api/doctors?specialty=${specialty}&city=${city}`);
  const data = await res.json();
  console.log("Doctors:", data);
  setFiltered(data);
};


  useEffect(() => {
    fetch("/api/specialties")
      .then(res => res.json())
      .then(data => setSpecialties(data.map((s:any) => s.name)));
  }, []);

  useEffect(() => {
    if (query === "") {
      setFiltered([]);
    } else {
      setFiltered(
        specialties.filter(s =>
          s.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  }, [query, specialties]);

  return (
    <section className="bg-gradient-to-r from-cyan-500 to-blue-600 py-20 text-white">
      <div className="max-w-5xl mx-auto text-center">

        <h1 className="text-4xl font-bold">Find the Best Doctors Near You</h1>
        <p className="mt-2 text-lg">Book appointments instantly</p>

        <div className="mt-8 bg-white p-4 rounded-lg flex gap-2 relative">

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

          {/* Location */}
          <input
            type="text"
            placeholder="City (Nairobi, Lagos...)"
            className="p-3 border rounded text-black w-full"
          />

          <button 
            type="button"
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 rounded"
          >
            const [specialty, setSpecialty] = useState("");
            const [city, setCity] = useState("");
            Search
          </button>

        </div>
      </div>
    </section>
  );
}
