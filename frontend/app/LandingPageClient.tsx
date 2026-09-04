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
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

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
        setPosts(res);
      } catch (error) {
        console.error("Error fetching Sanity posts:", error);
      }
    }
    fetchPosts();
  }, []);

  // Fetch dynamic Specialties and Doctors from your Backend API
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://medicareai-backend.onrender.com/api";

    async function fetchData() {
      try {
        const specRes = await fetch(`${backendUrl}/specialties`);
        const specData = await specRes.json();
        if (specData.success) {
          setSpecialties(specData.data);
        }

        const docRes = await fetch(`${backendUrl}/doctors`);
        const docData = await docRes.json();
        if (docData.success) {
          setDoctors(docData.data.slice(0, 2)); // Limit to top 2 for the homepage feature section
        }
      } catch (error) {
        console.error("Error fetching backend data:", error);
      }
    }
    fetchData();
  }, []);

  // Icon mapping helper fallback for dynamic specialties
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
      },
      {
        "@type": "WebSite",
        "@id": "https://medicare-ai-two.vercel.app/#website",
        "url": "https://medicare-ai-two.vercel.app",
        "name": "Swift MD",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://medicare-ai-two.vercel.app/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
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
          {/* BACKGROUND SLIDESHOW HERO SECTION */}
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
                  href="/patient/dashboard"
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2 text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  Book Appointment
                </Link>

                <Link
                  href="/patient/dashboard"
                  className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-100 border border-slate-600 font-semibold rounded-xl backdrop-blur-md shadow-lg transition-all flex items-center gap-2 text-sm"
                >
                  <Activity className="w-4 h-4 text-blue-400" />
                  View Vitals
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

          <section id="consult" aria-label="Services" className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <Link href="/patient/dashboard" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition group flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Instant Consult</h2>
                <p className="text-xs text-slate-500 mt-1">Connect in 2 mins</p>
              </div>
            </Link>

            <Link href="/patient/dashboard" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition group flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">In-Clinic Visit</h2>
                <p className="text-xs text-slate-500 mt-1">Book appointment</p>
              </div>
            </Link>

            <Link href="#tools" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-300 transition group flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Lab Tests</h2>
                <p className="text-xs text-slate-500 mt-1">Home sample pickup</p>
              </div>
            </Link>

            <Link href="#tools" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-300 transition group flex flex-col justify-between space-y-4">
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

          {/* DYNAMIC SPECIALTIES SECTION */}
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
              {specialties.length > 0 ? (
                specialties.map((spec, i) => {
                  const Icon = getSpecialtyIcon(spec.specialty);
                  return (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3 hover:border-blue-400 hover:shadow-sm cursor-pointer transition">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">{spec.specialty}</h3>
                        <p className="text-[11px] text-slate-400">Available Doctors</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 col-span-4">Loading specialties from database...</p>
              )}
            </div>
          </section>

          {/* DYNAMIC TOP RATED DOCTORS SECTION */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Top Rated Doctors</h2>
                <p className="text-xs sm:text-sm text-slate-500">Book verified healthcare professionals</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctors.length > 0 ? (
                doctors.map((doc, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{doc.name || doc.full_name}</h3>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold inline-flex items-center gap-1">
                          <Star className="w-3 h-3 fill-emerald-600" /> {doc.rating || "4.8"}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-600">{doc.specialty} • {doc.experience || "5+ yrs exp"}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" /> {doc.hospital || "SwiftMD Care Center"}
                      </p>
                      <p className="text-xs text-blue-600 font-medium flex items-center gap-1 pt-1">
                        <Clock className="w-3.5 h-3.5" /> Next Available: {doc.nextAvailable || "Today at 03:00 PM"}
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
                ))
              ) : (
                <p className="text-xs text-slate-400 col-span-2">Loading doctors from database...</p>
              )}
            </div>
          </section>

          {/* DYNAMIC SANITY CMS BLOG SECTION */}
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
                  <article key={post._id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-300 transition">
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
                      <Link href={`/blog/${post.slug?.current || ""}`} className="text-blue-600 font-bold hover:underline" aria-label={`Read ${post.title}`}>
                        Read Guide &rarr;
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <>
                  <article className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-300 transition">
                    <div className="p-6 space-y-3">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">Preventive Care</span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        Monitoring Cardiovascular Vitals: Key Metrics to Track
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-3">
                        A clinical breakdown on systolic and diastolic target parameters for early detection of hypertensive events.
                      </p>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>5 min read • Medical Board</span>
                      <Link href="/blog/cardiovascular-vitals" className="text-blue-600 font-bold hover:underline">
                        Read Guide &rarr;
                      </Link>
                    </div>
                  </article>

                  <article className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-emerald-300 transition">
                    <div className="p-6 space-y-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">Telemedicine</span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        Maximizing Your Virtual Consultation Experience
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-3">
                        How to prepare health history data, medication logs, and active symptom profiles before your remote appointment.
                      </p>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>4 min read • Dr. A. Jenkins</span>
                      <Link href="/blog/virtual-consultation-guide" className="text-blue-600 font-bold hover:underline">
                        Read Guide &rarr;
                      </Link>
                    </div>
                  </article>

                  <article className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-purple-300 transition">
                    <div className="p-6 space-y-3">
                      <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold">Clinical Evidence</span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        AI Decision Support in Modern Primary Care
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-3">
                        Examining recent PubMed literature on machine learning precision for rapid clinical diagnosis assistance.
                      </p>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>6 min read • Research Team</span>
                      <Link href="/blog/ai-decision-support" className="text-blue-600 font-bold hover:underline">
                        Read Guide &rarr;
                      </Link>
                    </div>
                  </article>
                </>
              )}
            </div>
          </section>

          <section id="guides" className="w-full bg-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="space-y-4 text-left max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-bold">
                <Download className="w-3.5 h-3.5" /> Direct Access Resources
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Download Free Clinical & Patient Care Guides
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Instant, sign-up-free access to curated medical whitepapers, clinical checklists, and patient care resources.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
              <a
                href="/downloads/chronic-vitals-monitoring-protocol.pdf"
                download
                className="p-5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-2xl flex flex-col justify-between space-y-3 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Download className="w-5 h-5 group-hover:scale-110 transition" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Vitals Protocol Guide</h3>
                    <p className="text-[10px] text-slate-400">PDF • 2.4 MB</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                  Direct Download <ArrowRight className="w-3 h-3" />
                </span>
              </a>

              <a
                href="/downloads/patient-telehealth-readiness-checklist.pdf"
                download
                className="p-5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-2xl flex flex-col justify-between space-y-3 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Download className="w-5 h-5 group-hover:scale-110 transition" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Telehealth Checklist</h3>
                    <p className="text-[10px] text-slate-400">PDF • 1.8 MB</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  Direct Download <ArrowRight className="w-3 h-3" />
                </span>
              </a>
            </div>
          </section>

          <section className="w-full space-y-6 pt-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Streamlined Clinical Workflow
            </h2>
            <div className="relative w-full h-64 sm:h-96 rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-200">
              <Image
                src="/og-image.png"
                alt="Doctor conducting remote telehealth consultation using Swift MD platform"
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
                priority
              />
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