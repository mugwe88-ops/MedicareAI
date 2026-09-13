// frontend/app/doctors/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Video,
  Folder,
  MessageCircle,
  FileText,
  Activity,
  Wallet,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  AlertTriangle,
  ArrowRight,
  LogOut,
  Wifi,
  CheckCircle2,
  Plus,
  Menu,
  X,
} from "lucide-react";

interface DoctorProfile {
  id: number;
  name: string;
  email: string;
  specialization?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  badgeVariant?: "blue" | "red";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (!token) return;

        const res = await fetch("/api/doctors/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setDoctor(data);
        }
      } catch (error) {
        console.error("Failed to fetch doctor profile", error);
      }
    };

    fetchDoctorProfile();
  }, []);

  // Categorized Navigation Sections
  const menuSections: NavSection[] = [
    {
      title: "Workspace",
      items: [
        { name: "Dashboard", href: "/doctors/dashboard", icon: LayoutDashboard },
        { name: "Appointments", href: "/doctors/appointments", icon: Calendar, badge: 3, badgeVariant: "blue" },
        { name: "Schedule", href: "/doctors/schedule", icon: Clock },
        { name: "Telehealth", href: "/doctors/telehealth", icon: Video, badge: 1, badgeVariant: "red" },
      ],
    },
    {
      title: "Patient Care",
      items: [
        { name: "Patient Records", href: "/doctors/patients", icon: Folder },
        { name: "Messages", href: "/doctors/messages", icon: MessageCircle, badge: 12, badgeVariant: "blue" },
        { name: "Prescriptions", href: "/doctors/prescriptions", icon: FileText },
        { name: "Lab Results", href: "/doctors/labs", icon: Activity, badge: 2, badgeVariant: "blue" },
      ],
    },
    {
      title: "Account",
      items: [
        { name: "Earnings", href: "/doctors/earnings", icon: Wallet },
        { name: "Continuing Education", href: "/doctors/education", icon: BookOpen },
        { name: "Settings", href: "/doctors/settings", icon: Settings },
      ],
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* MOBILE HEADER BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-slate-950 text-white flex items-center justify-between px-4 z-50 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <Stethoscope size={18} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">SWIFT MD</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* LEFT SIDEBAR PANEL */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 flex flex-col h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-300 border-r border-slate-800/80 shadow-2xl transition-all duration-300 ease-in-out select-none z-40 ${
          isCollapsed ? "w-[72px]" : "w-[260px]"
        } ${
          isMobileMenuOpen
            ? "translate-x-0 w-[260px]"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* COLLAPSE / EXPAND TOGGLE BUTTON (DESKTOP) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-7 w-6 h-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full items-center justify-center shadow-lg border border-slate-900 transition cursor-pointer z-50"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* 1. BRANDING & DOCTOR PROFILE HEADER */}
        <div className="p-3.5 border-b border-slate-800/80 mt-14 md:mt-0">
          {!isCollapsed ? (
            <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-900/30 text-white flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"
                  alt={doctor?.name || "Dr. Pressy Phides"}
                  className="w-11 h-11 rounded-xl object-cover ring-2 ring-white/30"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                    isOnline ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-extrabold text-sm text-white tracking-tight leading-snug truncate">
                  {doctor?.name || "Dr. Pressy Phides"}
                </h1>
                <p className="text-[11px] font-medium text-blue-100/90 truncate">
                  {doctor?.specialization || "General Practitioner"}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-semibold text-emerald-200">
                    {isOnline ? "Online" : "Away"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-1">
              <div className="relative">
                <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-md text-white">
                  <Stethoscope size={20} />
                </div>
                <span
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    isOnline ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* QUICK NEW CONSULTATION ACTION */}
        {!isCollapsed ? (
          <div className="px-3.5 pt-3">
            <button
              onClick={() => router.push("/doctors/telehealth")}
              className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
            >
              <Plus size={16} />
              <span>New Consultation</span>
            </button>
          </div>
        ) : (
          <div className="px-2 pt-3 flex justify-center">
            <button
              onClick={() => router.push("/doctors/telehealth")}
              className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/30 transition cursor-pointer"
              title="New Consultation"
            >
              <Plus size={18} />
            </button>
          </div>
        )}

        {/* SYNC & SYSTEM STATUS */}
        {!isCollapsed && (
          <div className="px-4 pt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-semibold border-b border-slate-800/40 pb-2">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 size={12} /> All records synced
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Wifi size={12} className="text-emerald-400" /> High Speed
            </span>
          </div>
        )}

        {/* NAVIGATION SECTION LIST */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <h2 className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  {section.title}
                </h2>
              )}

              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 border-l-4 border-blue-400"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    } ${isCollapsed ? "justify-center px-0 py-3" : ""}`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon
                      size={18}
                      className={`flex-shrink-0 transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-blue-400"
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="flex-1 truncate tracking-tight">
                        {item.name}
                      </span>
                    )}

                    {/* BADGES */}
                    {item.badge && (
                      <span
                        className={`flex items-center justify-center font-bold text-[10px] px-2 py-0.5 rounded-full ${
                          item.badgeVariant === "red"
                            ? "bg-rose-500 text-white animate-pulse"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        } ${
                          isCollapsed
                            ? "absolute top-1 right-1 px-1.5 py-0 text-[9px]"
                            : ""
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* TODAY'S STATUS BOTTOM CARD */}
        {!isCollapsed && (
          <div className="p-3 mx-2.5 mb-2 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-inner space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Today's Status
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Live Triage</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
                <span className="block text-[10px] font-medium text-slate-400">Waiting</span>
                <strong className="text-sm font-black text-amber-400">4 Patients</strong>
              </div>

              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
                <span className="block text-[10px] font-medium text-slate-400">Emergency</span>
                <strong className="text-sm font-black text-rose-500 flex items-center justify-center gap-1">
                  <AlertTriangle size={12} /> 1 Case
                </strong>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-medium">
              <span>Avg wait time:</span>
              <span className="font-bold text-slate-200">~6 mins</span>
            </div>

            <button
              onClick={() => router.push("/doctors/telehealth")}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Go to Queue</span>
              <ArrowRight size={12} />
            </button>
          </div>
        )}

        {/* FOOTER PROFILE & DUTY TOGGLE */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between gap-2">
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                    isOnline ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                  title="Toggle Online Availability"
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                      isOnline ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-[11px] font-bold text-slate-400">
                  {isOnline ? "Available" : "Offline"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition cursor-pointer"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-xl transition cursor-pointer"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* BACKDROP FOR MOBILE MENU */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto mt-14 md:mt-0">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}