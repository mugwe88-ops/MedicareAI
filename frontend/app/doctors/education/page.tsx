// frontend/app/doctors/continue-education/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Search,
  Award,
  Flame,
  Clock,
  CheckCircle2,
  PlayCircle,
  Bookmark,
  Share2,
  Download,
  Calendar,
  User,
  Star,
  ArrowRight,
  Sparkles,
  Check,
  AlertCircle,
  FileText,
  Video,
  X,
} from "lucide-react";

// --- TYPES ---
interface Course {
  id: string;
  title: string;
  specialty: string;
  thumbnail: string;
  progress: number;
  timeRemaining: string;
  lastOpened: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  credits: number;
  duration: string;
  rating: number;
  instructor: {
    name: string;
    title: string;
    avatar: string;
  };
  overview: string;
  modulesCount: number;
  isCompleted?: boolean;
}

interface Webinar {
  id: string;
  title: string;
  date: string;
  time: string;
  speaker: string;
  seatsRemaining: number;
  specialty: string;
  registered: boolean;
}

interface Certificate {
  id: string;
  title: string;
  issueDate: string;
  credits: number;
  verificationCode: string;
  expiryDate: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  progress?: number;
}

const SPECIALTIES = [
  "All Specialties",
  "Cardiology",
  "Pediatrics",
  "Obstetrics & Gynecology",
  "Internal Medicine",
  "Surgery",
  "Psychiatry",
  "Dermatology",
  "Emergency Medicine"
];

export default function ContinueEducationPage() {
  // --- STATE ---
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All Specialties");
  const [activeTab, setActiveTab] = useState<"courses" | "webinars" | "certificates" | "achievements">("courses");
  
  // Interactive Modal States
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState<boolean>(false);
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);

  // Data States
  const [activeCourses, setActiveCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // --- MOCK SUPABASE & SANITY DATA HYDRATION ---
  useEffect(() => {
    const fetchEducationData = async () => {
      setLoading(true);
      try {
        // Simulating Supabase / Sanity API latency
        await new Promise((r) => setTimeout(r, 700));

        setActiveCourses([
          {
            id: "c-1",
            title: "Advanced Hemodynamic Management in Critical Care",
            specialty: "Emergency Medicine",
            thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
            progress: 68,
            timeRemaining: "1h 45m remaining",
            lastOpened: "2 hours ago",
            difficulty: "Advanced",
            credits: 5.0,
            duration: "4.5 hours",
            rating: 4.9,
            instructor: {
              name: "Dr. Elizabeth Koech, MMed",
              title: "Senior Consultant Cardiologist",
              avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"
            },
            overview: "Comprehensive module covering advanced fluid resuscitation, vasopressor titration, and bedside echocardiography in unstable emergency presentations.",
            modulesCount: 6
          },
          {
            id: "c-2",
            title: "Paediatric Asthma Guidelines & Acute Exacerbations",
            specialty: "Pediatrics",
            thumbnail: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600",
            progress: 30,
            timeRemaining: "3h 10m remaining",
            lastOpened: "Yesterday",
            difficulty: "Intermediate",
            credits: 3.5,
            duration: "3.0 hours",
            rating: 4.8,
            instructor: {
              name: "Dr. James Omondi",
              title: "Paediatric Pulmonologist",
              avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150"
            },
            overview: "Review modern stepwise therapy, metered-dose inhaler spacer techniques, and emergency management protocols for pediatric status asthmaticus.",
            modulesCount: 4
          }
        ]);

        setRecommendedCourses([
          {
            id: "c-3",
            title: "Hypertension & Cardiovascular Risk Stratification",
            specialty: "Cardiology",
            thumbnail: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600",
            progress: 0,
            timeRemaining: "4.0 hours",
            lastOpened: "Never",
            difficulty: "Intermediate",
            credits: 4.0,
            duration: "4.0 hours",
            rating: 4.9,
            instructor: {
              name: "Dr. William Mugwe",
              title: "Interventional Cardiologist",
              avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150"
            },
            overview: "Up-to-date guidelines on ambulatory blood pressure monitoring, resistant hypertension workup, and renal denervation therapies.",
            modulesCount: 5
          },
          {
            id: "c-4",
            title: "Mental Health First Aid in Primary Care Practice",
            specialty: "Psychiatry",
            thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
            progress: 0,
            timeRemaining: "2.5 hours",
            lastOpened: "Never",
            difficulty: "Beginner",
            credits: 3.0,
            duration: "2.5 hours",
            rating: 4.7,
            instructor: {
              name: "Dr. Sarah Njoroge",
              title: "Consultant Psychiatrist",
              avatar: "https://images.unsplash.com/photo-1594824813567-46387034b7f8?auto=format&fit=crop&q=80&w=150"
            },
            overview: "Equipping clinicians with rapid screening tools for major depressive disorders, anxiety triggers, and crisis de-escalation.",
            modulesCount: 4
          }
        ]);

        setWebinars([
          {
            id: "w-1",
            title: "Emerging Antibiotic Resistance Patterns in East Africa",
            date: "Thursday, 24 Sept 2026",
            time: "2:00 PM - 4:00 PM EAT",
            speaker: "Prof. David Kariuki (KEMRI)",
            seatsRemaining: 14,
            specialty: "Internal Medicine",
            registered: false
          },
          {
            id: "w-2",
            title: "Maternal Fetal Medicine: Managing Gestational Diabetes",
            date: "Tuesday, 29 Sept 2026",
            time: "10:00 AM - 12:00 PM EAT",
            speaker: "Dr. Brenda Cheptoo",
            seatsRemaining: 28,
            specialty: "Obstetrics & Gynecology",
            registered: true
          }
        ]);

        setCertificates([
          {
            id: "cert-1",
            title: "Advanced Trauma Life Support (ATLS) Refresher",
            issueDate: "12 August 2026",
            credits: 10.0,
            verificationCode: "SWIFT-CPD-2026-8891",
            expiryDate: "12 August 2028"
          },
          {
            id: "cert-2",
            title: "Paediatric Emergency Assessment & Stabilization",
            issueDate: "04 July 2026",
            credits: 6.5,
            verificationCode: "SWIFT-CPD-2026-4412",
            expiryDate: "04 July 2028"
          }
        ]);

        setAchievements([
          { id: "a-1", title: "7-Day Streak", description: "Learned consistently for 7 days in a row.", icon: Flame, unlocked: true },
          { id: "a-2", title: "First Certificate", description: "Completed your first accredited CME course.", icon: Award, unlocked: true },
          { id: "a-3", title: "100 CPD Credits", description: "Accumulated 100 verified professional credits.", icon: Sparkles, unlocked: false, progress: 78 },
          { id: "a-4", title: "Top Learner", description: "Ranked in the top 5% of active clinicians this month.", icon: Star, unlocked: false, progress: 85 }
        ]);

        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchEducationData();
  }, []);

  // Filtered courses based on search & specialty
  const filteredCourses = useMemo(() => {
    return recommendedCourses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            course.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialty = selectedSpecialty === "All Specialties" || course.specialty === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [recommendedCourses, searchQuery, selectedSpecialty]);

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-8 font-sans pb-28">
      
      {/* ================= STICKY HEADER ================= */}
      <div className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md pb-4 pt-2 -mt-2 mb-6 border-b border-slate-200/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-600/30">
                <BookOpen size={20} />
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Continue Education</h1>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Earn CPD/CME credits, master new clinical protocols, and download verified certificates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses, specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/25 focus:border-blue-600 shadow-sm transition"
              />
            </div>

            <button
              onClick={() => setActiveTab("certificates")}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm transition cursor-pointer"
            >
              <Award size={15} className="text-blue-600" />
              <span>My Certificates</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
          {[
            { id: "courses", label: "Active & Recommended", icon: BookOpen },
            { id: "webinars", label: "Live Webinars", icon: Video },
            { id: "certificates", label: "Verified Certificates", icon: Award },
            { id: "achievements", label: "Learning Achievements", icon: Sparkles }
].map((tab) => {
  const Icon = tab.icon;
  return (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id as any)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
        activeTab === tab.id
          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
      }`}
    >
      <Icon size={14} />
      <span>{tab.label}</span>
    </button>
  );
})}
        </div>
      </div>

      {activeTab === "courses" && (
        <>
          {/* ================= HERO SECTION ================= */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-800 mb-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-extrabold text-blue-300">
                  <Flame size={14} className="text-amber-400 fill-amber-400" /> 7-Day Learning Streak
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white">
                  Welcome back, Dr. Mugwe.
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You have earned <strong className="text-white">32.5 CPD Credits</strong> this year. You're just <strong className="text-blue-400">7.5 credits away</strong> from completing your annual KMLTTB / Medical Council requirements.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => activeCourses.length > 0 && setSelectedCourse(activeCourses[0])}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-blue-600/30 transition cursor-pointer active:scale-95 flex items-center gap-2"
                  >
                    <PlayCircle size={16} />
                    <span>Resume Learning</span>
                  </button>
                  <span className="text-xs text-slate-400">Next milestone: Advanced Trauma Certificate</span>
                </div>
              </div>

              {/* Quick Stat Pill Grid Inside Hero */}
              <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Credits Earned</span>
                  <strong className="text-2xl font-black text-white mt-0.5 block">32.5</strong>
                  <span className="text-[10px] text-emerald-400 font-bold">+12% vs last year</span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Courses Active</span>
                  <strong className="text-2xl font-black text-blue-400 mt-0.5 block">{activeCourses.length}</strong>
                  <span className="text-[10px] text-slate-400 font-bold">In progress</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= LEARNING STATS DASHBOARD CARDS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CPD Credits Earned</span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">32.5</h3>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                  ↑ +5.0 this month
                </span>
              </div>
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl shadow-inner">
                <Award size={24} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Courses Completed</span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">14</h3>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                  All-time total
                </span>
              </div>
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner">
                <CheckCircle2 size={24} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Learning Hours</span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">48.5 hrs</h3>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                  ↑ 6.2 hrs this week
                </span>
              </div>
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl shadow-inner">
                <Clock size={24} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Certificates Earned</span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">12</h3>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                  Verified & active
                </span>
              </div>
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner">
                <FileText size={24} />
              </div>
            </div>
          </div>

          {/* ================= CONTINUE LEARNING (HORIZONTAL SECTION) ================= */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Continue Learning</h3>
                <p className="text-xs text-slate-500">Pick up right where you left off.</p>
              </div>
            </div>

            {activeCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeCourses.map((course) => (
                  <div key={course.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-extrabold">
                          {course.specialty}
                        </span>
                        <span className="absolute bottom-3 right-3 bg-blue-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-extrabold shadow">
                          {course.credits} CPD Credits
                        </span>
                      </div>

                      <div className="p-5 space-y-3">
                        <h4 className="font-black text-base text-slate-900 line-clamp-1">{course.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{course.overview}</p>

                        {/* Progress Bar */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-700">{course.timeRemaining}</span>
                            <span className="text-blue-600">{course.progress}% completed</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div style={{ width: `${course.progress}%` }} className="h-full bg-blue-600 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-4">
                      <span className="text-[11px] text-slate-400 font-medium">Last opened: {course.lastOpened}</span>
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <PlayCircle size={14} />
                        <span>Resume</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-500">
                No active courses right now. Select a recommended course below to start learning.
              </div>
            )}
          </div>

          {/* ================= MEDICAL SPECIALTIES QUICK-ACCESS CHIPS ================= */}
          <div className="mb-6 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Filter by Medical Specialty</h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {SPECIALTIES.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedSpecialty === spec
                      ? "bg-slate-900 text-white shadow"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* ================= RECOMMENDED COURSES ================= */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Recommended Courses (AI-Curated)</h3>
                <p className="text-xs text-slate-500">Tailored to your specialty and professional background.</p>
              </div>
            </div>

            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCourses.map((course) => (
                  <div key={course.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-extrabold">
                          {course.specialty}
                        </span>
                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 px-2.5 py-1 rounded-lg text-[10px] font-extrabold shadow flex items-center gap-1">
                          <Star size={12} className="text-amber-500 fill-amber-500" /> {course.rating}
                        </span>
                        <span className="absolute bottom-3 right-3 bg-blue-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-extrabold shadow">
                          {course.credits} CPD Credits
                        </span>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                          <span>{course.duration}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            course.difficulty === "Beginner" ? "bg-emerald-50 text-emerald-700" :
                            course.difficulty === "Intermediate" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                          }`}>
                            {course.difficulty}
                          </span>
                        </div>

                        <h4 className="font-black text-base text-slate-900">{course.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{course.overview}</p>

                        <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
                          <img src={course.instructor.avatar} alt={course.instructor.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                          <div>
                            <strong className="text-xs font-bold text-slate-900 block">{course.instructor.name}</strong>
                            <span className="text-[10px] text-slate-400 block">{course.instructor.title}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-4">
                      <button
                        onClick={() => alert(`Saved "${course.title}" to your bookmarks.`)}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                        title="Save for Later"
                      >
                        <Bookmark size={16} />
                      </button>
                      
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Start Course</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <AlertCircle size={32} className="mx-auto text-slate-400" />
                <h4 className="font-bold text-base text-slate-900">No matching courses found</h4>
                <p className="text-xs text-slate-500">Try adjusting your search filter or selecting another medical specialty.</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "webinars" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Upcoming Live Clinical Webinars</h3>
              <p className="text-xs text-slate-500">Attend live sessions with leading specialists and earn verifiable CPD credits.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {webinars.map((webinar) => (
              <div key={webinar.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-extrabold">
                      {webinar.specialty}
                    </span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                      {webinar.seatsRemaining} seats remaining
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-900">{webinar.title}</h4>

                  <div className="space-y-1.5 text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-blue-600" />
                      <span>{webinar.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-blue-600" />
                      <span>{webinar.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-blue-600" />
                      <span>Speaker: <strong className="text-slate-900">{webinar.speaker}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => alert("Calendar reminder added successfully!")}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar size={14} />
                    <span>Add Reminder</span>
                  </button>

                  <button
                    onClick={() => alert(webinar.registered ? "You are already registered." : "Successfully registered for webinar!")}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black transition shadow cursor-pointer ${
                      webinar.registered
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                    }`}
                  >
                    {webinar.registered ? "Registered" : "Register Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "certificates" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Verified Certificates & Credentials</h3>
            <p className="text-xs text-slate-500">Download tax-ready or board-verifiable PDF certificates for completed training.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Award size={28} />
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] rounded-full border border-emerald-200">
                    Verified Credential
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900">{cert.title}</h4>
                  <p className="text-xs text-slate-500">Issued on {cert.issueDate} • <strong className="text-slate-900">{cert.credits} CPD Credits</strong></p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono font-bold text-slate-700 flex items-center justify-between">
                  <span>Code: {cert.verificationCode}</span>
                  <span className="text-slate-400">Expires: {cert.expiryDate}</span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setActiveCertificate(cert);
                      setIsCertificateModalOpen(true);
                    }}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download size={14} />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => alert("Certificate verification link copied to clipboard.")}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Share2 size={14} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "achievements" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Learning Achievements & Badges</h3>
            <p className="text-xs text-slate-500">Gamified medical milestones to keep your clinical education engaging.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((ach) => {
              const Icon = ach.icon;
              return (
                <div key={ach.id} className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 ${
                  ach.unlocked ? "bg-white border-slate-200 shadow-sm" : "bg-slate-100/70 border-slate-200/60 opacity-75"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl ${ach.unlocked ? "bg-blue-50 text-blue-600 shadow-inner" : "bg-slate-200 text-slate-500"}`}>
                      <Icon size={24} />
                    </div>
                    {ach.unlocked ? (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">
                        In Progress
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-black text-sm text-slate-900">{ach.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{ach.description}</p>
                  </div>

                  {ach.progress !== undefined && (
                    <div className="space-y-1 pt-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span>Progress</span>
                        <span>{ach.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div style={{ width: `${ach.progress}%` }} className="h-full bg-blue-600 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= COURSE DETAILS & LEARNING MODAL ================= */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-extrabold">
                  {selectedCourse.specialty}
                </span>
                <span className="text-xs font-bold text-slate-500">{selectedCourse.credits} CPD Credits</span>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-1.5 bg-slate-200/70 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-2">{selectedCourse.title}</h2>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedCourse.overview}</p>
              </div>

              {/* Instructor Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                <img src={selectedCourse.instructor.avatar} alt={selectedCourse.instructor.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Instructor</span>
                  <h4 className="font-extrabold text-sm text-slate-900">{selectedCourse.instructor.name}</h4>
                  <p className="text-xs text-slate-500">{selectedCourse.instructor.title}</p>
                </div>
              </div>

              {/* Modules List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Course Modules ({selectedCourse.modulesCount})</h4>
                <div className="space-y-2">
                  {[
                    { title: "Module 1: Pathophysiology & Clinical Assessment", duration: "45 mins", completed: true },
                    { title: "Module 2: Evidence-Based Protocols & Interventions", duration: "55 mins", completed: selectedCourse.progress > 50 },
                    { title: "Module 3: Complex Case Studies & Risk Mitigations", duration: "50 mins", completed: false },
                    { title: "Module 4: Final Assessment & CME Quiz", duration: "30 mins", completed: false }
                  ].map((mod, idx) => (
                    <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                          mod.completed ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                        }`}>
                          {mod.completed ? <Check size={14} /> : idx + 1}
                        </div>
                        <div>
                          <strong className="text-xs font-bold text-slate-900 block">{mod.title}</strong>
                          <span className="text-[10px] text-slate-400">{mod.duration}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (idx === 3) {
                            setIsQuizOpen(true);
                          } else {
                            alert(`Opening ${mod.title}`);
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        {idx === 3 ? "Take Quiz" : "Open"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Estimated completion time: {selectedCourse.duration}</span>
              <button
                onClick={() => {
                  setIsQuizOpen(true);
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/30 transition cursor-pointer flex items-center gap-2"
              >
                <span>Launch Course & Quiz</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= INTERACTIVE QUIZ EXPERIENCE MODAL ================= */}
      {isQuizOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 uppercase">CME Assessment Quiz</span>
                <h3 className="font-black text-base text-slate-900">Final Knowledge Check</h3>
              </div>
              <button
                onClick={() => setIsQuizOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
              >
                <X size={16} />
              </button>
            </div>

            {quizScore !== null ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="font-extrabold text-xl text-slate-900">Quiz Passed Successfully!</h4>
                <p className="text-xs text-slate-500">
                  You scored <strong className="text-slate-900">{quizScore}%</strong> (Passing score: 80%). Your certificate and 5.0 CPD Credits have been unlocked!
                </p>
                <button
                  onClick={() => {
                    setIsQuizOpen(false);
                    setQuizScore(null);
                    setSelectedCourse(null);
                    setActiveTab("certificates");
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow transition cursor-pointer"
                >
                  View My Certificate
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400">Question 1 of 3</span>
                  <h4 className="text-sm font-black text-slate-900">
                    What is the primary recommended initial fluid resuscitation volume for unstable adult patients presenting with septic shock according to standard protocols?
                  </h4>
                </div>

                <div className="space-y-2">
                  {[
                    "A) 10 mL/kg within the first 6 hours",
                    "B) 30 mL/kg crystalloids within the first 3 hours",
                    "C) 500 mL colloids every 1 hour",
                    "D) Restrictive fluids until vasopressors fail"
                  ].map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setQuizScore(92)}
                      className="w-full text-left p-3.5 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <p className="text-[10px] text-slate-400 text-center">Clicking an option instantly grades and records your score.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= CERTIFICATE DOWNLOAD MODAL ================= */}
      {isCertificateModalOpen && activeCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Award size={32} />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-black text-lg text-slate-900">{activeCertificate.title}</h3>
              <p className="text-xs text-slate-500">Official Swift MD Medical Education Certificate</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Verification Code</span>
              <p className="font-mono font-bold text-xs text-slate-900">{activeCertificate.verificationCode}</p>
              <span className="text-[10px] font-bold text-slate-400 uppercase block pt-2">Credits Value</span>
              <p className="font-black text-xs text-emerald-600">{activeCertificate.credits} CPD Credits</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsCertificateModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert("PDF Certificate downloaded successfully.");
                  setIsCertificateModalOpen(false);
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}