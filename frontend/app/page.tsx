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

  // Synchronously evaluate local session status on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    setIsLoggedIn(!!token);
    
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserName(parsed.name || "Account");
      } catch (e) {
        console.error("Hydration profile parsing error:", e);
      }
    }
  }, []);

  const handleProtectedAction = (targetRoute: string) => {
    if (isLoggedIn === null) return;

    if (!isLoggedIn) {
      router.push("/login");
    } else {
      router.push(targetRoute);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserName("");
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
      
      {/* SYNCHRONIZED