"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams({ query, city });
    router.push(`/doctors?${params.toString()}`);
  };

  return (
    <section className="bg-gradient-to-r from-cyan-500 to-blue-600 py-14 px-4 text-white text-center">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold">Find the Best Doctors Near You</h1>
        <p className="mt-2 text-base md:text-lg">Book appointments instantly</p>

        <div className="mt-8 bg-white p-3 md:p-4 rounded-xl shadow-lg flex flex-col md:flex-row gap-3 relative">
          <input
            type="text"
            placeholder="Search doctor or specialty..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 border rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="City..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full md:w-64 p-3 border rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
}