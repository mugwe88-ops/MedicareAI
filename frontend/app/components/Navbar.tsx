"use client";
import { useState } from "react";
import { Menu, X, ChevronRight, Download } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "For Doctors", href: "/doctors" },
    { name: "For Clinics", href: "/clinics" },
    { name: "For Hospitals", href: "/hospitals" },
    { name: "Visit SwiftMD.com", href: "/" },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-slate-100 px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-12 md:h-16">
          
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsOpen(true)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
            >
              <Menu size={24} className="text-slate-600" />
            </button>

            <Link href="/" className="flex items-center whitespace-nowrap">
              <span className="text-xl md:text-2xl font-[900] tracking-tighter text-[#06162F]">
                Swift<span className="text-[#237BFF]">MD</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {["Find Doctors", "Video Consult", "Medicines"].map((link) => (
              <Link 
                key={link} 
                href={`/${link.toLowerCase().replace(" ", "-")}`}
                className="text-sm font-bold text-slate-600 hover:text-[#237BFF]"
              >
                {link}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-600">Login</Link>
            <Link href="/signup" className="px-4 md:px-6 py-2 bg-[#237BFF] text-white text-xs md:text-sm font-bold rounded-lg whitespace-nowrap">Sign Up</Link>
          </div>
        </div>
      </nav>
      {/* Drawer Code remains the same... */}
    </>
  );
}