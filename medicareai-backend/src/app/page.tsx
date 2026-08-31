import Hero from "./components/Hero";
import Specialties from "./components/Specialties";
import DoctorsList from "./components/DoctorsList";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* 1. Hero Section with Search Bar */}
      <Hero />

      {/* 2. Browse Categories & Specialties */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Explore Medical Categories</h2>
        <Specialties />
      </section>

      {/* 3. Featured Doctors Directory for Pre-Signup Search */}
      <section className="max-w-7xl mx-auto px-4 py-12 bg-white rounded-2xl shadow-sm my-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Find & Book Available Specialists</h2>
        <DoctorsList />
      </section>
    </main>
  );
}
