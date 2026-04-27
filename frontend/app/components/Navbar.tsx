"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // Hide Navbar on dashboard/portal
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/patient-portal") || pathname.startsWith("/doctor/dashboard")) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[9999] bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        
        {/* Left Side: Logo and Navigation */}
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight shrink-0">
            Swift MD
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/doctors" className="text-[15px] font-medium text-gray-500 hover:text-blue-600 transition-colors">
              Find Doctors
            </Link>
            <Link href="/video-consult" className="text-[15px] font-medium text-gray-500 hover:text-blue-600 transition-colors">
              Video Consult
            </Link>
            <Link href="/medicines" className="text-[15px] font-medium text-gray-500 hover:text-blue-600 transition-colors">
              Medicines
            </Link>
          </nav>
        </div>

        {/* Right Side: Authentication Buttons */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link 
            href="/login" 
            className="text-[15px] font-semibold text-gray-600 hover:text-blue-600 transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/signup" 
            className="bg-blue-600 text-white text-[15px] font-bold px-6 py-2.5 rounded-lg shadow-md shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
          >
            Sign Up
          </Link>
        </div>

      </div>
    </header>
  );
}