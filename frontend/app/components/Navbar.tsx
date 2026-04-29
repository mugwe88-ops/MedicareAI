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
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left Section: Menu Button + Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsOpen(true)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
            >
              <Menu size={24} className="text-slate-600" />
            </button>

            <Link href="/" className="flex items-center gap-1 group">
              <span className="text-2xl font-[900] tracking-tighter text-[#06162F]">
                Swift<span className="text-[#237BFF]">MD</span>
              </span>
            </Link>
          </div>

          {/* Desktop Links (Hidden on Mobile) */}
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

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-600">Login</Link>
            <Link href="/signup" className="px-6 py-2 bg-[#237BFF] text-white text-sm font-bold rounded-lg">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* --- SIDE DRAWER COMPONENT --- */}
      {/* Dark Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[60] md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <div className={`fixed top-0 left-0 h-full w-[280px] bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-50">
          <button onClick={() => setIsOpen(false)} className="text-slate-400">
            <X size={24} />
          </button>
          <div className="flex items-center gap-1">
            <span className="text-xl font-black text-[#06162F]">Swift<span className="text-[#237BFF]">MD</span></span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="py-4">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-6 py-4 text-[15px] font-medium text-slate-700 hover:bg-slate-50 border-b border-slate-50/50"
            >
              {link.name}
              <ChevronRight size={16} className="text-slate-300" />
            </Link>
          ))}
        </div>

        {/* Mobile-Only CTA Button */}
        <div className="px-6 py-6 mt-4">
          <button className="w-full py-3 border-2 border-orange-400 text-orange-500 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
            <Download size={14} />
            Download the Swift MD App
          </button>
        </div>

        {/* Bottom Small Links */}
        <div className="absolute bottom-10 left-6 flex flex-col gap-3">
          {["Help", "Contact Us", "Terms Of Service"].map(sub => (
            <Link key={sub} href="#" className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
              {sub}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}