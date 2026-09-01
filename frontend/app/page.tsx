import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Stethoscope, 
  FileText, 
  BookOpen, 
  Search, 
  BrainCircuit, 
  Calculator,
  Download,
  CheckCircle2
} from "lucide-react";

export const metadata: Metadata = {
  title: "Swift MD | Telehealth & AI Clinical Decision Support Platform",
  description:
    "Empowering patients and healthcare providers with AI-driven clinical decision support, rapid virtual consultations, and verified PubMed medical guidelines.",
  keywords: [
    "Swift MD",
    "SwiftMD Telehealth",
    "Clinical Decision Support",
    "Virtual Doctor Consultation",
    "AI Healthcare Portal",
    "Remote Patient Care",
    "Health Blog",
    "PubMed Research",
    "Health Calculators",
  ],
  alternates: {
    canonical: "https://medicare-ai-two.vercel.app",
  },
  openGraph: {
    title: "Swift MD — Next-Gen Telehealth & Health Information Hub",
    description:
      "Explore verified biomedical research, track vitals, calculate health metrics, and access AI-driven clinical tools.",
    url: "https://medicare-ai-two.vercel.app",
    siteName: "Swift MD",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Swift MD Platform Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swift MD | Telehealth & Clinical Support",
    description: "AI-powered clinical decision support & virtual patient consultation platform.",
    images: ["/og-image.png"],
  },
};

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
      {/* Schema Markup for Google SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
        {/* Semantic Header */}
        <header className="w-full bg-white border-b border-slate-200/80 py-4 px-6 sm:px-12 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-xl">
              S
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">Swift MD</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#blog" className="hover:text-blue-600 transition">Health Blog</a>
            <a href="#tools" className="hover:text-blue-600 transition">Calculators &amp; Tools</a>
            <a href="#research" className="hover:text-blue-600 transition">PubMed Explorer</a>
            <a href="#guides" className="hover:text-blue-600 transition">Free Guides</a>
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-2 transition"
            >
              Sign In
            </Link>
            <Link
              href="/patient/dashboard"
              className="text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition shadow-md shadow-blue-500/20"
            >
              Patient Portal
            </Link>
          </div>
        </header>

        {/* Semantic Main Content */}
        <main className="flex-1 max-w-6xl mx-auto px-6 py-12 sm:py-16 flex flex-col items-center space-y-20">
          
          {/* Hero Section */}
          <section className="flex flex-col items-center text-center space-y-6 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" /> Rapid Health Management &amp; Medical Evidence Architecture
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
              AI-Powered Telehealth &amp; Remote Clinical Support
            </h1>

            <p className="text-base sm:text-lg font-medium text-slate-600 max-w-2xl">
              Swift MD seamlessly connects virtual consultations with live patient vitals, medical research, health calculators, and clinical evidence.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link
                href="/patient/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition shadow-lg shadow-blue-500/25"
              >
                Access Patient Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/doctors/dashboard/resources"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-2xl transition"
              >
                Doctor Workspace
              </Link>
            </div>
          </section>

          {/* Core Platform Services */}
          <section className="w-full space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Key Platform Features
              </h2>
              <p className="text-sm text-slate-500">
                Comprehensive digital care workflows built for modern healthcare delivery.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <article className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Health Telemetry &amp; Vitals</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Track heart rate, blood pressure, and glucose trends with continuous performance scoring.
                </p>
              </article>

              <article className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Rapid Consultations</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Connect directly with medical specialists through a streamlined appointment system.
                </p>
              </article>

              <article className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Verified Medical Resources</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Access up-to-date lab reports, prescriptions, active regimens, and diagnostic notes instantly.
                </p>
              </article>
            </div>
          </section>

          {/* Interactive Tools & AI Symptom Triage Banner */}
          <section id="tools" className="w-full bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-8 text-left">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Interactive Health Tools</h2>
                <p className="text-xs text-slate-500 mt-1">Self-service assessment and clinical tools accessible online.</p>
              </div>
              <Link
                href="/patient/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-100 transition"
              >
                <BrainCircuit className="w-4 h-4" /> Open Symptom Checker on Dashboard &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-2xl space-y-3 border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Health Calculators &amp; Assessment Tools</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Calculate target cardiovascular heart rates, Body Mass Index (BMI), daily calorie target, and daily hydration requirements.
                </p>
              </div>

              <div id="research" className="p-6 bg-slate-50 rounded-2xl space-y-3 border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">PubMed / Clinical Evidence Explorer</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Direct search indexing to verify medical guidelines, peer-reviewed study conclusions, and clinical research data in real time.
                </p>
              </div>
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

        {/* Semantic Footer */}
        <footer className="w-full bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} Swift MD. All rights reserved.
        </footer>
      </div>
    </>
  );
}