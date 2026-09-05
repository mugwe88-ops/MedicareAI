"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import HealthCalculators from "./health-calculators";
import { client, urlFor } from "@/lib/sanity";
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
  Download,
  Stethoscope,
  Building2,
  Clock
} from "lucide-react";

const slides = [
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1920&q=80"
];

// Fallback data so UI renders immediately even if backend is asleep on Render
const FALLBACK_SPECIALTIES = [
  { specialty: "General Physician", count: "120+ Doctors" },
  { specialty: "Cardiology", count: "45+ Doctors" },
  { specialty: "Neurology", count: "30+ Doctors" },
  { specialty: "Pediatrics", count: "80+ Doctors" }
];

const FALLBACK_DOCTORS = [
  {
    id: "doc-1",
    name: "Dr. Sarah Jenkins",
    specialty: "Cardiologist",
    experience: "14 yrs exp",
    hospital: "Central Heart Institute",
    rating: "4.9",
    nextAvailable: "Today at 03:00 PM"
  },
  {
    id: "doc-2",
    name: "Dr. Marcus Vance",
    specialty: "General Physician",
    experience: "9 yrs exp",
    hospital: "SwiftMD Care Center",
    rating: "4.8",
    nextAvailable: "Today at 04:30 PM"
  }
];

interface SanityPost {
  _id: string;
  title: string;
  slug?: { current: string };
  category?: string;
  summary?: string;
  readTime?: string;
  author?: string;
  publishedAt?: string;
  mainImage?: any;
}

export default function LandingPageClient() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [posts, setPosts] = useState<SanityPost[]>([]);
  const [specialties, setSpecialties] = useState<any[]>(FALLBACK_SPECIALTIES);
  const [doctors, setDoctors] = useState<any[]>(FALLBACK_DOCTORS);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Sanity blog posts
  useEffect(() => {
    async function fetchPosts() {
      const query = `*[_type == "post"] | order(publishedAt desc)[0...3] {
        _id,
        title,
        slug,
        category,
        summary,
        readTime,
        author,
        publishedAt,
        mainImage
      }`;
      try {
        const res = await client.fetch(query);
        if (res && res.length > 0) setPosts(res);
      } catch (error) {
        console.error("Error fetching Sanity posts:", error);
      }
    }
    fetchPosts();
  }, []);

  // Fetch dynamic Specialties and Doctors from your Backend API with fallbacks
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://medicareai-backend.onrender.com/api";

    async function fetchData() {
      try {
        const specRes = await fetch(`${backendUrl}/specialties`);
        const specData = await specRes.json();
        if (specData.success && specData.data?.length > 0) {
          setSpecialties(specData.data);
        }

        const docRes = await fetch(`${backendUrl}/doctors`);
        const docData = await docRes.json();
        if (docData.success && docData.data?.length > 0) {
          setDoctors(docData.data.slice(0, 2));
        }
      } catch (error) {
        console.error("Backend fetch error (using fallback data):", error);
      }
    }
    fetchData();
  }, []);

  const getSpecialtyIcon = (name: string) => {
    const lower = name?.toLowerCase() || "";
    if (lower.includes('cardio')) return Activity;
    if (lower.includes('neuro')) return BrainCircuit;
    if (lower.includes('pediatric')) return ShieldCheck;
    return Stethoscope;
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalOrganization",
        "@id": "https://medicare-ai-two.vercel.app/#organization",
        "name": "Swift MD",
        "url": "https://medicare-ai-two.vercel.app",
        "logo": "https://medicare-ai-two.vercel.app/logo.png",
        "description": "AI-assisted clinical decision support, medical education, and rapid telehealth platform.",
        "medicalSpecialty": ["GeneralPractice", "Telehealth", "Cardiology", "Neurology"]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
        <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" aria-label="Swift MD Home" className="flex items-center gap-2.5">
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
          {/* HERO SECTION */}
          <section id="search" className="relative rounded-3xl p-6 sm:p-16 text-white shadow-xl overflow-hidden">
            {slides.map((image, index) => (
              <div
                key={image}
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out z-0 ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
                style={{ backgroundImage: `url('${image}')` }}
              />
            ))}
            <div className="absolute inset-0 bg-slate-900/80 z-0" />

            <div className="relative z-10 max-w-3xl space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> AI-Powered Telehealth & Remote Clinical Support
              </span>
              
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
                Next-Generation Virtual Medical Care
              </h1>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                Swift MD seamlessly connects virtual consultations with live patient vitals, medical research, health calculators, and clinical evidence.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/patient/dashboard?tab=book"
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  Book Appointment
                </Link>
              </div>

              <div className="flex gap-2 pt-4">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex ? "w-8 bg-blue-500" : "w-2 bg-white/40"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>

          <section id="consult" className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <Link href="/patient/dashboard?tab=book" className="bg-white p-5 rounded-2xl border border-slate-200/85 shadow-sm hover:shadow-md hover:border-blue-300 transition group flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Instant Consult</h2>
                <p className="text-xs text-slate-500 mt-1">Connect in 2 mins</p>
              </div>
            </Link>

            <Link href="/patient/dashboard?tab=book" className="bg-white p-5 rounded-2xl border border-slate-200/85 shadow-sm hover:shadow-md hover:border-emerald-300 transition group flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">In-Clinic Visit</h2>
                <p className="text-xs text-slate-500 mt-1">Book appointment</p>
              </div>
            </Link>

            <Link href="#tools" className="bg-white p-5 rounded-2xl border border-slate-200/85 shadow-sm hover:shadow-md hover:border-purple-300 transition group flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Lab Tests</h2>
                <p className="text-xs text-slate-500 mt-1">Home sample pickup</p>
              </div>
            </Link>

            <Link href="#tools" className="bg-white p-5 rounded-2xl border border-slate-200/85 shadow-sm hover:shadow-md hover:border-amber-300 transition group flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Medicines</h2>
                <p className="text-xs text-slate-500 mt-1">Order & doorstep delivery</p>
              </div>
            </Link>
          </section>

          <section id="tools">
            <HealthCalculators />
          </section>

          {/* DYNAMIC SPECIALTIES SECTION (Clickable to Filter/Book) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Consult Top Specialties</h2>
                <p className="text-xs sm:text-sm text-slate-500">Private consultations with verified doctors</p>
              </div>
              <Link href="/patient/dashboard?tab=book" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                See All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {specialties.map((spec, i) => {
                const Icon = getSpecialtyIcon(spec.specialty);
                const specialtyName = spec.specialty || spec.name;
                return (
                  <Link
                    key={i}
                    href={`/patient/dashboard?tab=book&specialty=${encodeURIComponent(specialtyName)}`}
                    className="bg-white p-4 rounded-2xl border border-slate-200/85 flex items-center gap-3 hover:border-blue-400 hover:shadow-sm cursor-pointer transition group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">{specialtyName}</h3>
                      <p className="text-[11px] text-slate-400">{spec.count || spec.doctors_count || "Available Doctors"}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* DYNAMIC TOP RATED DOCTORS SECTION (Dynamic Booking Links) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Top Rated Doctors</h2>
                <p className="text-xs sm:text-sm text-slate-500">Book verified healthcare professionals</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctors.map((doc, i) => {
                const docId = doc.id || doc._id || `doc-${i}`;
                const docName = doc.name || doc.full_name;
                const docSpecialty = doc.specialty;

                return (
                  <div key={docId} className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{docName}</h3>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold inline-flex items-center gap-1">
                          <Star className="w-3 h-3 fill-emerald-600" /> {doc.rating || "4.8"}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-600">{docSpecialty} • {doc.experience || "5+ yrs exp"}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" /> {doc.hospital || "SwiftMD Care Center"}
                      </p>
                      <p className="text-xs text-blue-600 font-medium flex items-center gap-1 pt-1">
                        <Clock className="w-3.5 h-3.5" /> Next Available: {doc.nextAvailable || "Today at 03:00 PM"}
                      </p>
                    </div>
                    <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                      <Link
                        href={`/patient/dashboard?tab=book&doctorId=${encodeURIComponent(docId)}&doctorName=${encodeURIComponent(docName)}&specialty=${encodeURIComponent(docSpecialty)}`}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition text-center shadow-sm"
                      >
                        Book Visit
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* BLOG SECTION */}
          <section id="blog" className="w-full space-y-8 text-left">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Health Blog & Wellness Guides
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
              {posts.length > 0 ? (
                posts.map((post) => (
                  <article key={post._id} className="bg-white rounded-2xl border border-slate-200/85 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-300 transition">
                    {post.mainImage && (
                      <div className="relative w-full h-48 bg-slate-100">
                        <Image 
                          src={urlFor(post.mainImage).url()} 
                          alt={post.title} 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                    )}
                    <div className="p-6 space-y-3">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                        {post.category || "Heart Health"}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-3">
                        {post.summary || "No summary available for this article."}
                      </p>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>{post.readTime || "5 min read"} • {post.author || "Swift MD Team"}</span>
                      <Link href={`/blog/${post.slug?.current || ""}`} className="text-blue-600 font-bold hover:underline">
                        Read Guide &rarr;
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-xs text-slate-400">Loading blog articles...</p>
              )}
            </div>
          </section>
        </main>

        <footer className="w-full bg-white border-t border-slate-200/80 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Swift MD</span> • Healthcare Platform
            </div>
            <p>&copy; {new Date().getFullYear()} Swift MD. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}