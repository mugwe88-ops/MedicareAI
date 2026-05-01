"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  user?: any; 
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  // FIX: Hide the global navbar if the user is in the dashboard to prevent 
  // the overlapping UI seen in the mobile recording.
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <span className="text-xl font-black text-slate-900 tracking-tight">
            Swift<span className="text-blue-600">MD</span>
          </span>
        </Link>

        {/* Navigation Links - Hidden on small screens to keep it clean */}
        <div className="hidden md:flex gap-8 text-sm font-bold text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">Find Doctors</Link>
          <Link href="/" className="hover:text-blue-600 transition-colors">Video Consult</Link>
          <Link href="/" className="hover:text-blue-600 transition-colors">Medicines</Link>
        </div>

        <div className="flex items-center gap-5">
          {user ? (
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-black border-2 border-transparent group-hover:border-blue-600 transition-all">
                {user.name?.charAt(0) || "U"}
              </div>
              <span className="hidden sm:inline text-sm font-bold text-slate-700 group-hover:text-blue-600">
                {user.name || "My Account"}
              </span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                Login
              </Link>
              <Link href="/signup" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all active:scale-95">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}