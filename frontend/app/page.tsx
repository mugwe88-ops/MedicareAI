"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Stethoscope, Sparkles, Baby, Heart, Smile, Bone, Video, Pill, FlaskConical, Activity } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Nairobi, Kenya");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Synchronously fetch authentication state immediately upon mounting
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Central access gatekeeper function
  const handleProtectedAction = (targetRoute: string) => {
    // If state isn't determined yet, do nothing to prevent broken loops
    if (isLoggedIn === null) return;

    if (!isLoggedIn) {
      // Send unauthenticated traffic straight to login
      router.push("/login");
    } else {
      // Route verified traffic to the destination surface
      router.push(targetRoute);
    }
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
      route: "/telehealth"
    },
    {
      title: "Order Medicines",
      desc: "Essentials delivered to your doorstep",
      icon: Pill,
      color: "text-pink-500",
      bg: "bg-pink-50",
      route: "/medicines"
    },
    {
      title: "Lab Tests",
      desc: "Sample pickup from your home",
      icon: FlaskConical,
      color: "text-blue-500",
      bg: "bg-blue-50",
      route: "/data"
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

  // Prevent UI flashing or early gate evaluations while reading localStorage
  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-sm font-bold tracking-wide uppercase">Verifying SwiftMD Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* HERO SECTION WITH CAPTURE CHANNEL */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pt-20 pb-36 px-4 text-center relative">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Find the Best Doctors Near You
          </h1>
          <p className="text-blue-100 text-lg font-medium">
            Verified specialists available for instant booking.
          </p>
        </div>

        {/* Global Hub Filter Form */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-full max-w-3xl px-4">
          <div className="bg-white p-3 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2 border border-slate-100">
            <div className="flex items-center gap-2 px-3 py-2 flex-1 border-b md:border-b-0 md:border-r border-slate-100">
              <MapPin className="text-slate-400 shrink-0" size={20} />
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full font-bold text-slate-700 bg-transparent focus:outline-none text-sm appearance-none cursor-pointer"
              >
                <option value="Nairobi, Kenya">Nairobi, Kenya</option>
                <option value="Juja, Kenya">Juja, Kenya</option>
                <option value="Mombasa, Kenya">Mombasa, Kenya</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 flex-[1.5]">
              <Search className="text-slate-400 shrink-0" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search specialty, doctor, or medical issue..."
                className="w-full text-slate-600 font-semibold placeholder-slate-400 bg-transparent focus:outline-none text-sm"
              />
            </div>

            <button 
              onClick={() => handleProtectedAction(`/dashboard?search=${encodeURIComponent(searchQuery)}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md shadow-blue-600/10 text-sm tracking-wide uppercase"
            >
              Find
            </button>
          </div>
        </div>
      </section>

      {/* SPECIALTY SELECTOR TRACK */}
      <section className="max-w-6xl mx-auto w-full px-4 pt-24 pb-12">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100/80">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Book by <span className="border-b-4 border-blue-600 pb-1">Speciality</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {specialties.map((spec) => {
              const IconComponent = spec.icon;
              return (
                <button
                  key={spec.name}
                  onClick={() => handleProtectedAction(`/dashboard?specialty=${encodeURIComponent(spec.name.toLowerCase())}`)}
                  className="flex flex-col items-center gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:shadow-lg hover:shadow-blue-600/5 transition-all group duration-200 text-center"
                >
                  <div className={`w-12 h-12 ${spec.bg} ${spec.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-inner`}>
                    <IconComponent size={22} />
                  </div>
                  <span className="font-bold text-slate-700 text-xs tracking-wide group-hover:text-blue-600">
                    {spec.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CLINICAL SERVICE DECK PANELS */}
      <section className="max-w-6xl mx-auto w-full px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coreServices.map((service) => {
            const ServiceIcon = service.icon;
            return (
              <div
                key={service.title}
                onClick={() => handleProtectedAction(service.route)}
                className="bg-white border border-slate-100/80 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex items-start gap-4 group"
              >
                <div className={`p-3.5 rounded-xl ${service.bg} ${service.color} group-hover:scale-105 transition-transform shrink-0`}>
                  <ServiceIcon size={24} />
                </div>
                <div className="space-y-1 pt-0.5">
                  <h3 className="font-black text-slate-800 text-sm tracking-tight group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}