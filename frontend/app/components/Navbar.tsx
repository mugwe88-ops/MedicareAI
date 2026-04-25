"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // Hide Navbar on dashboard routes to keep the UI clean
  if (pathname.startsWith("/dashboard")) return null;

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Brand Logo */}
      <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight">
        Swift MD
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex space-x-8 font-semibold text-gray-600">
        <Link href="/doctors" className="hover:text-blue-600 transition">Find Doctors</Link>
        <Link href="/consult" className="hover:text-blue-600 transition">Video Consult</Link>
        <Link href="/medicines" className="hover:text-blue-600 transition">Medicines</Link>
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center space-x-4">
        <Link 
          href="/login" 
          className="px-4 py-2 font-bold text-gray-700 hover:text-blue-600 transition"
        >
          Login
        </Link>
        <Link 
          href="/signup" 
          className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-100 hover:bg-blue-700 hover:shadow-lg transition transform active:scale-95"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}