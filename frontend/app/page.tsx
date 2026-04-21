"use client";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Specialties from "./components/Specialties";
import Doctors from "./components/Doctors";

/**
 * Home Page Component
 * Note: Added "use client" at the top to ensure hydration 
 * for any click events within sub-components.
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero contains the search inputs and main search button */}
      <Hero />
      
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto space-y-16">
          <Services />
          
          {/* Specialties contains the 'Book by Speciality' buttons */}
          <Specialties />
          
          <Doctors />
        </div>
      </section>
    </main>
  );
}