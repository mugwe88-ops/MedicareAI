"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Stethoscope, Sparkles, Baby, Heart, Smile, Bone, Video, Pill, FlaskConical, Activity, LogOut } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Nairobi, Kenya");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>(""); // Added to track role

  // Synchronously evaluate local session status on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    setIsLoggedIn(!!token);
    
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserName(parsed.name || "Account");
        setUserRole(parsed.role?.toLowerCase() || "patient"); // Normalize role to lowercase
      } catch (e) {
        console.error("Hydration profile parsing error:", e);
      }
    }
  }, []);

  const handleProtectedAction = (patientRoute: string) => {
    if (isLoggedIn === null) return;

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    // Dynamic Role Routing Engine
    if (userRole === "doctor") {
      // If a doctor clicks any capability, redirect them straight to their control panel workspace
      router.push("/doctors/dashboard");
    } else {
      // If a patient clicks, take them to the requested sub-route
      router.push(patientRoute);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserName("");
    setUserRole("");
    window.location.reload();
  };

  const specialties = [
    { name: "General Physician", icon: Stethoscope, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Dermatologist", icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50" },
    { name: "Pediatrician", icon: Baby, color: "text-orange-600", bg: "bg-orange-50" },
    { name: "Gynecologist", icon: Heart, color: "text-pink-600", bg: "bg-pink-50" },
    { name: "Dentist", icon: Smile, color: "text-cyan-600", bg: "bg-cyan-50" },
    { name: "Orthopedic", icon: Bone, color: "text-green-600", bg: "bg-green-50" },
  ];

  const coreServices = [
    {
      title: "Video Consultation",
      desc: "Connect with doctors within 5 minutes",
      icon: Video,
      color: "text-orange-500",
      bg: "bg-orange-50",
      route: "/dashboard/telehealth"
    },
    {
      title: "Order Medicines",
      desc: "Essentials delivered to your doorstep",
      icon: Pill,
      color: "text-pink-500",
      bg: "bg-pink-50",
      route: "/dashboard/pharmacy"
    },
    {
      title: "Lab Tests",
      desc: "Sample pickup from your home",
      icon: FlaskConical,
      color: "text-blue-500",
      bg: "bg-blue-50",
      route: "/dashboard/records"
    },
    {
      title: "Surgeries",
      desc: "Safe and trusted surgical care",
      icon: Activity,
      color: "text-green-500",
      bg: "bg-green-50",
      route: "/dashboard/appointments"
    }
  ];

  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-sm font-bold tracking-wide uppercase">Loading SwiftMD Setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* SYNCHRONIZED APP NAVBAR */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="text-slate-900 font-black text-lg tracking-tighter">SWIFT MD</span>
          </div>

          <div className="flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <Link 
                  href="/login" 
                  className="text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {/* Dynamically update the header button to point to the correct workspace dashboard based on role */}
                <Link 
                  href={userRole === "doctor" ? "/doctors/dashboard" : "/dashboard"} 
                  className="text-slate-700 hover:text-blue-600 font-bold text-sm bg-slate-100 px-4 py-2 rounded-xl transition-all"
                >
                  {userName.toUpperCase()}&apos;S ({userRole.toUpperCase()}) DASHBOARD
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-500 p-2 rounded-xl transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-white py-16 px-6 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Your Health, <span className="text-blue-600">Swiftly</span> Managed.
          </h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto font-medium">
            Find checked clinical specialists, order medications directly, or review medical data summaries from one secure panel.
          </p>

          {/* SEARCH COMPONENT */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-2 flex flex-col md:flex-row items-center gap-2 mt-8">
            <div className="flex items-center gap-2 w-full px-3 py-2 border-b md:border-b-0 md:border-r border-slate-100">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
              <input 
                type="text" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-sm font-semibold text-slate-800 bg-transparent outline-none" 
              />
            </div>
            <div className="flex items-center gap-2 w-full px-3 py-2">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Search doctors, clinical clinics or specialities..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm font-medium text-slate-800 bg-transparent outline-none placeholder:text-slate-400" 
              />
            </div>
            <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-500/10 shrink-0">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* CORE SERVICES GRID */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full">
        <h2 className="text-xl font-extrabold text-slate-900 mb-8 tracking-tight">Our Virtual Care Capabilities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreServices.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div 
                key={index} 
                onClick={() => handleProtectedAction(service.route)}
                className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-blue-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 ${service.bg} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                    <IconComponent className={`w-6 h-6 ${service.color}`} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">{service.desc}</p>
                </div>
                <div className="text-blue-600 font-bold text-xs mt-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Access Platform &rarr;
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SPECIALTIES ROW */}
      <section className="bg-slate-100/60 py-16 px-6 w-full mt-auto border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-extrabold text-slate-900 mb-8 tracking-tight">Consult Across Specialties</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {specialties.map((spec, index) => {
              const IconComp = spec.icon;
              return (
                <div 
                  key={index}
                  onClick={() => handleProtectedAction("/dashboard/appointments")}
                  className="bg-white p-4 rounded-xl border border-slate-200/40 flex flex-col items-center text-center shadow-2xl shadow-slate-100/20 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className={`w-10 h-10 ${spec.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <IconComp className={`w-5 h-5 ${spec.color}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                    {spec.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}