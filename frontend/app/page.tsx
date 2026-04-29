"use client";
// Add this import line at the top:
import Hero from "./components/Hero"; 
import Services from "./components/Services";
import Doctors from "./components/Doctors";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Spacer for the fixed Navbar */}
      <div className="h-20 w-full"></div> 
      
      {/* Now this will be recognized */}
      <Hero /> 
      
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto space-y-16">
          <Services />
          <Doctors />
        </div>
      </section>
    </main>
  );
}