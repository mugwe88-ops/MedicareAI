"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // Ensure navbar shows on home page, but hides on specific portals
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/patient-portal")) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 w-full bg-white border-b border-gray-100 z-[9999] h-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Left Side: Logo */}
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-extrabold text-blue-600 tracking-tighter">
            Swift MD
          </Link>
        </div>

        {/* Right Side: Auth Buttons */}
        <div className="flex items-center gap-8">
          <Link 
            href="/login" 
            className="text-[15px] font-bold text-gray-700 hover:text-blue-600 transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/signup" 
            className="px-6 py-2.5 bg-blue-600 text-white text-[15px] font-extrabold rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-100"
          >
            Sign Up
          </Link>
        </div>

      </div>
    </nav>
  );
}