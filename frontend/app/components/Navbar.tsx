"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-black tracking-tighter text-[#0F172A]">
            Swift<span className="text-[#237BFF]">MD</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {["Find Doctors", "Video Consult", "Medicines"].map((link) => (
            <Link key={link} href="/" className="text-[13px] font-black uppercase tracking-widest text-slate-500 hover:text-[#237BFF] transition-colors">
              {link}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-black text-slate-700">Login</Link>
          <Link href="/signup" className="px-7 py-3 bg-[#0F172A] text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-[#237BFF] transition-all shadow-xl shadow-slate-200">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}