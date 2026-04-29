"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white z-[9999] border-b border-slate-100 h-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-black text-blue-600 tracking-tighter hover:opacity-80 transition-opacity">
          Swift MD
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex gap-8 text-sm font-bold text-slate-500">
          <Link href="/doctors" className="hover:text-blue-600 transition-colors">Find Doctors</Link>
          <Link href="#" className="hover:text-blue-600 transition-colors">Video Consult</Link>
          <Link href="#" className="hover:text-blue-600 transition-colors">Medicines</Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-6">
          <Link 
            href="/login" 
            className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors"
          >
            Login
          </Link>
          
          <Link 
            href="/signup" 
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}