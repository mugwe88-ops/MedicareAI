"use client";

import { useState } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  MapPin, 
  Video, 
  Calendar, 
  FlaskConical, 
  Pill, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  Activity, 
  BrainCircuit, 
  Calculator, 
  Download, 
  CheckCircle2,
  Stethoscope,
  Building2,
  Clock,
  FileText,
  HeartPulse,
  Droplets,
  Scale
} from "lucide-react";

// ==========================================
// INTERACTIVE CALCULATORS COMPONENT
// ==========================================
function HealthCalculators() {
  const [activeTab, setActiveTab] = useState<"bmi" | "ldl" | "water">("bmi");

  // BMI State
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [bmiResult, setBmiResult] = useState<{ score: string; status: string } | null>(null);

  // LDL State (Friedewald Formula: LDL = Total - HDL - (Triglycerides / 5))
  const [totalChol, setTotalChol] = useState<string>("");
  const [hdl, setHdl] = useState<string>("");
  const [triglycerides, setTriglycerides] = useState<string>("");
  const [ldlResult, setLdlResult] = useState<{ score: string; status: string } | null>(null);

  // Hydration State
  const [waterWeight, setWaterWeight] = useState<string>("");
  const [waterResult, setWaterResult] = useState<string | null>(null);

  // Handlers
  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // cm to m
    if (w > 0 && h > 0) {
      const score = (w / (h * h)).toFixed(1);
      const val = parseFloat(score);
      let status = "Normal weight";
      if (val < 18.5) status = "Underweight";
      else if (val >= 25 && val < 29.9) status = "Overweight";
      else if (val >= 30) status = "Obese";
      setBmiResult({ score, status });
    }
  };

  const calculateLDL = (e: React.FormEvent) => {
    e.preventDefault();
    const tc = parseFloat(totalChol);
    const h = parseFloat(hdl);
    const tg = parseFloat(triglycerides);
    if (tc > 0 && h > 0 && tg > 0) {
      const score = (tc - h - tg / 5).toFixed(1);
      const val = parseFloat(score);
      let status = "Optimal (<100 mg/dL)";
      if (val >= 100 && val <= 129) status = "Near Optimal";
      else if (val >= 130 && val <= 159) status = "Borderline High";
      else if (val >= 160 && val <= 189) status = "High";
      else if (val >= 190) status = "Very High";
      setLdlResult({ score, status });
    }
  };

  const calculateWater = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(waterWeight);
    if (w > 0) {
      // General formula: ~35ml per kg of body weight
      const liters = ((w * 35) / 1000).toFixed(1);
      setWaterResult(liters);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Interactive Health Calculators</h2>
          <p className="text-xs sm:text-sm text-slate-500">Calculate instant health metrics with validated clinical formulas</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab("bmi")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "bmi" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Scale className="w-3.5 h-3.5" /> BMI
          </button>
          <button
            onClick={() => setActiveTab("ldl")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "ldl" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" /> LDL Cholesterol
          </button>
          <button
            onClick={() => setActiveTab("water")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "water" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Droplets className="w-3.5 h-3.5" /> Hydration
          </button>
        </div>
      </div>

      {/* CALCULATOR 1: BMI */}
      {activeTab === "bmi" && (
        <form onSubmit={calculateBMI} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
            <input
              type="number"
              placeholder="e.g. 70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
            <input
              type="number"
              placeholder="e.g. 175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
          >
            Calculate BMI
          </button>

          {bmiResult && (
            <div className="md:col-span-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between text-xs mt-2">
              <span className="font-medium text-slate-700">Calculated BMI Score:</span>
              <div className="text-right">
                <span className="font-black text-blue-700 text-base">{bmiResult.score} kg/m²</span>
                <span className="ml-2 font-bold text-slate-600">({bmiResult.status})</span>
              </div>
            </div>
          )}
        </form>
      )}

      {/* CALCULATOR 2: LDL CHOLESTEROL */}
      {activeTab === "ldl" && (
        <form onSubmit={calculateLDL} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Total Cholesterol (mg/dL)</label>
            <input
              type="number"
              placeholder="e.g. 200"
              value={totalChol}
              onChange={(e) => setTotalChol(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">HDL Cholesterol (mg/dL)</label>
            <input
              type="number"
              placeholder="e.g. 50"
              value={hdl}
              onChange={(e) => setHdl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Triglycerides (mg/dL)</label>
            <input
              type="number"
              placeholder="e.g. 150"
              value={triglycerides}
              onChange={(e) => setTriglycerides(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
          >
            Calculate LDL
          </button>

          {ldlResult && (
            <div className="md:col-span-4 p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between text-xs mt-2">
              <span className="font-medium text-slate-700">Estimated LDL Level (Friedewald):</span>
              <div className="text-right">
                <span className="font-black text-purple-700 text-base">{ldlResult.score} mg/dL</span>
                <span className="ml-2 font-bold text-slate-600">({ldlResult.status})</span>
              </div>
            </div>
          )}
        </form>
      )}

      {/* CALCULATOR 3: HYDRATION */}
      {activeTab === "water" && (
        <form onSubmit={calculateWater} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Body Weight (kg)</label>
            <input
              type="number"
              placeholder="e.g. 68"
              value={waterWeight}
              onChange={(e) => setWaterWeight(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
          >
            Calculate Target
          </button>

          {waterResult && (
            <div className="md:col-span-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs mt-2">
              <span className="font-medium text-slate-700">Recommended Daily Intake:</span>
              <span className="font-black text-emerald-700 text-base">{waterResult} Liters / day</span>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
const SPECIALTIES = [
  { name: "General Physician", icon: Stethoscope, count: "120+ Doctors" },
  { name: "Cardiology", icon: Activity, count: "45+ Doctors" },
  { name: "Neurology", icon: BrainCircuit, count: "30+ Doctors" },
  { name: "Pediatrics", icon: ShieldCheck, count: "80+ Doctors" },
];

const FEATURED_DOCTORS = [
  {
    name: "Dr. Sarah Jenkins",
    specialty: "Cardiologist",
    experience: "14 yrs exp",
    rating: "4.9",
    reviews: "128 Reviews",
    hospital: "Central Heart Institute",
    nextAvailable: "Today at 03:00 PM",
  },
  {
    name: "Dr. Marcus Vance",
    specialty: "General Physician",
    experience: "9 yrs exp",
    rating: "4.8",
    reviews: "95 Reviews",
    hospital: "SwiftMD Care Center",
    nextAvailable: "Today at 04:30 PM",
  },
];

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: "Swift MD",
    url: "https://medicare-ai-two.vercel.app",
    logo: "https://medicare-ai-two.vercel.app/logo.png",
    description: "AI-assisted clinical decision support, medical education, and rapid telehealth platform.",
    medicalSpecialty: ["GeneralPractice", "Telehealth"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
        
        {/* Navigation Header */}
        <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-blue-500/20">
                  S
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Swift<span className="text-blue-600">MD</span>
                </span>
              </Link>

              <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
                <a href="#search" className="hover:text-blue-600 transition">Find Doctors</a>
                <a href="#consult" className="hover:text-blue-600 transition">Video Consult</a>
                <a href="#tools" className="hover:text-blue-600 transition">Health Tools</a>
                <a href="#blog" className="hover:text-blue-600 transition">Articles</a>
                <a href="#guides" className="hover:text-blue-600 transition">Free Guides</a>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-2 transition"
              >
                Sign In
              </Link>
              <Link
                href="/patient/dashboard"
                className="text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition shadow-sm"
              >
                Patient Portal
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-12 w-full">
          
          {/* Hero Search Section */}
          <section id="search" className="bg-slate-900 rounded-3xl p-6 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> Rapid Health Management &amp; Medical Evidence Architecture
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                AI-Powered Telehealth &amp; <br />
                <span className="text-blue-400">Remote Clinical Support.</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300">
                Swift MD seamlessly connects virtual consultations with live patient vitals, medical research, health calculators, and clinical evidence.
              </p>

              {/* Omni Search Bar */}
              <div className="pt-4">
                <div className="bg-white rounded-2xl p-2 flex flex-col md:flex-row items-center gap-2 shadow-2xl text-slate-900">
                  <div className="flex items-center gap-2 px-3 py-2 w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200">
                    <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Location" 
                      defaultValue="Washington, DC"
                      className="w-full text-xs sm:text-sm font-medium focus:outline-none bg-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 w-full md:w-2/3">
                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Search doctors, specialties, symptoms, or clinics..." 
                      className="w-full text-xs sm:text-sm font-medium focus:outline-none bg-transparent"
                    />
                  </div>
                  <button className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shrink-0">
                    Search
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Service Cards */}
          <section id="consult" className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <Link href="/patient/dashboard" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition group flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Instant Consult</h3>
                <p className="text-xs text-slate-500 mt-1">Connect in 2 mins</p>
              </div>
            </Link>

            <Link href="/patient/dashboard" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition group flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">In-Clinic Visit</h3>
                <p className="text-xs text-slate-500 mt-1">Book appointment</p>
              </div>
            </Link>

            <Link href="#tools" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-300 transition group flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Lab Tests</h3>
                <p className="text-xs text-slate-500 mt-1">Home sample pickup</p>
              </div>
            </Link>

            <Link href="#tools" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-300 transition group flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Medicines</h3>
                <p className="text-xs text-slate-500 mt-1">Order &amp; doorstep delivery</p>
              </div>
            </Link>
          </section>

          {/* Embedded Health Calculators */}
          <section id="tools">
            <HealthCalculators />
          </section>

          {/* Top Specialties */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Consult Top Specialties</h2>
                <p className="text-xs sm:text-sm text-slate-500">Private consultations with verified doctors</p>
              </div>
              <Link href="/patient/dashboard" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                See All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SPECIALTIES.map((spec, i) => {
                const Icon = spec.icon;
                return (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3 hover:border-blue-400 hover:shadow-sm cursor-pointer transition">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">{spec.name}</h3>
                      <p className="text-[11px] text-slate-400">{spec.count}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Featured Doctors */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Top Rated Doctors</h2>
                <p className="text-xs sm:text-sm text-slate-500">Book verified healthcare professionals</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FEATURED_DOCTORS.map((doc, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold inline-flex items-center gap-1">
                        <Star className="w-3 h-3 fill-emerald-600" /> {doc.rating}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-600">{doc.specialty} • {doc.experience}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> {doc.hospital}
                    </p>
                    <p className="text-xs text-blue-600 font-medium flex items-center gap-1 pt-1">
                      <Clock className="w-3.5 h-3.5" /> Next Available: {doc.nextAvailable}
                    </p>
                  </div>
                  <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                    <Link
                      href="/patient/dashboard"
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition text-center"
                    >
                      Book Visit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Health Blog Section */}
          <section id="blog" className="w-full space-y-8 text-left">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Health Blog &amp; Wellness Guides
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Evidence-based clinical updates, preventive care guidelines, and medical insights.
                </p>
              </div>
              <Link href="/blog" className="text-xs font-bold text-blue-600 hover:underline">
                View All Articles &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <article className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="p-6 space-y-3">
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">Preventive Care</span>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    Monitoring Cardiovascular Vitals: Key Metrics to Track
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3">
                    A clinical breakdown on systolic and diastolic target parameters for early detection of hypertensive events.
                  </p>
                </div>
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                  5 min read • Medical Board
                </div>
              </article>

              <article className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="p-6 space-y-3">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">Telemedicine</span>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    Maximizing Your Virtual Consultation Experience
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3">
                    How to prepare health history data, medication logs, and active symptom profiles before your remote appointment.
                  </p>
                </div>
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                  4 min read • Dr. A. Jenkins
                </div>
              </article>

              <article className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="p-6 space-y-3">
                  <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold">Clinical Evidence</span>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    AI Decision Support in Modern Primary Care
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3">
                    Examining recent PubMed literature on machine learning precision for rapid clinical diagnosis assistance.
                  </p>
                </div>
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                  6 min read • Research Team
                </div>
              </article>
            </div>
          </section>

          {/* Lead Magnet / Free Downloadable Guides Section */}
          <section id="guides" className="w-full bg-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="space-y-4 text-left max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-bold">
                <Download className="w-3.5 h-3.5" /> Free Medical Resources
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Download Free Clinical &amp; Patient Care Guides
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Get instant access to curated medical whitepapers, chronic disease prevention checklists, and diagnostic guides.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Chronic Vitals Monitoring Protocols (PDF)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Patient Telehealth Readiness Checklist (PDF)
                </li>
              </ul>
            </div>

            <form className="flex flex-col gap-3 w-full md:w-auto bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
              <h3 className="text-xs font-bold text-slate-200">Get Free Download Link</h3>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-72"
                required
              />
              <button 
                type="submit" 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-600/30"
              >
                Send Download Links
              </button>
            </form>
          </section>

          {/* Visual Showcase Section */}
          <section className="w-full space-y-6 pt-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Streamlined Clinical Workflow
            </h2>
            <div className="relative w-full h-64 sm:h-96 rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-200">
              <Image
                src="/og-image.png"
                alt="Doctor conducting remote telehealth consultation using Swift MD platform"
                fill
                className="object-cover"
                priority
              />
            </div>
          </section>

        </main>

        {/* Footer */}
        <footer className="w-full bg-white border-t border-slate-200/80 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Swift MD</span> • Healthcare Platform
            </div>
            <p>© {new Date().getFullYear()} Swift MD. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}