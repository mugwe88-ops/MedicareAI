"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, User as UserIcon } from "lucide-react";

interface NavbarProps {
  user?: any;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  const randomSessionId = `session-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "py-3 bg-white/80 backdrop-blur-md shadow-soft border-b border-slate-100"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            Swift<span className="text-blue-600">MD</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 ml-1">
            <ShieldCheck size={12} /> Trusted Virtual Care
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Find Doctors
          </Link>
          <Link
            href={`/telehealth/${randomSessionId}`}
            className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Video Consult
          </Link>
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Health Tools
          </Link>
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Medicines
          </Link>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-all"
            >
              <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {user.name?.charAt(0) || "U"}
              </div>
              <span className="text-xs font-bold text-slate-700">
                {user.name || "Account"}
              </span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-bold text-slate-600 hover:text-blue-600 px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}