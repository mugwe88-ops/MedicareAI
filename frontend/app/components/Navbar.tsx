"use client";

import Link from "next/link";

// Define the interface to fix the TypeScript 'IntrinsicAttributes' error
interface NavbarProps {
  user?: any; 
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        
        <Link href="/">
          <span className="text-xl font-black text-slate-900">
            Swift<span className="text-blue-600">MD</span>
          </span>
        </Link>

        <div className="hidden md:flex gap-6 text-sm font-bold text-slate-600">
          <Link href="/">Find Doctors</Link>
          <Link href="/">Video Consult</Link>
          <Link href="/">Medicines</Link>
        </div>

        <div className="flex items-center gap-4">
          {/* If a user is logged in, show their identifier, otherwise show Login/Signup */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                {user.name?.charAt(0) || "U"}
              </div>
              <span className="text-sm font-bold text-slate-700">{user.name || "User"}</span>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600">
                Login
              </Link>
              <Link href="/signup" className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}