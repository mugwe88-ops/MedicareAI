"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        
        <Link href="/">
          <span className="text-xl font-black">
            Swift<span className="text-blue-600">MD</span>
          </span>
        </Link>

        <div className="hidden md:flex gap-6 text-sm font-bold text-slate-600">
          <Link href="/">Find Doctors</Link>
          <Link href="/">Video Consult</Link>
          <Link href="/">Medicines</Link>
        </div>

        <div className="flex gap-4">
          <Link href="/login" className="text-sm">Login</Link>
          <Link href="/signup" className="bg-black text-white px-4 py-2 rounded-lg text-sm">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}