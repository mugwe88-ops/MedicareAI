"use client";

import Hero from "./components/Hero";
import Services from "./components/Services";
import Doctors from "./components/Doctors";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Spacer to prevent Hero content from hiding under the fixed Navbar */}
      <div className="h-20"></div>

      {/* Hero now contains BOTH search and working specialty buttons */}
      <Hero />
      
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto space-y-16">
          <Services />
          
          {/* Note: Specialties component is REMOVED to prevent duplicates and fix the import crash */}
          
          <Doctors />
        </div>
      </section>
    </main>
  );
}