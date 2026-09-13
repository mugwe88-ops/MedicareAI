"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Clock, Video, UserPlus, FileText, Activity,
  Search, Bell, MessageSquare, ShieldCheck, ChevronLeft, ChevronRight,
  TrendingUp, AlertTriangle, Stethoscope, Mic, CheckCircle2,
  DollarSign, Sparkles, AlertCircle, Award, Settings, LogOut,
  RefreshCw, PlusCircle, ArrowUpRight, Check, X, Filter
} from "lucide-react";

// Types
interface PatientSchedule {
  id: string;
  time: string;
  patientName: string;
  avatar: string;
  type: "Video" | "Follow-up" | "Physical";
  status: "In Progress" | "Upcoming" | "Completed" | "Delayed";
  shaStatus: "Verified" | "Pending";
  condition: string;
}

interface WaitingPatient {
  id: string;
  name: string;
  waitTime: string;
  symptom: string;
  urgency: "Emergency" | "High" | "Normal";
  paymentType: "M-Pesa" | "SHA / Insurance" | "Cash";
}

interface ActivityItem {
  id: string;
  title: string;
  time: string;
  type: "prescription" | "lab" | "consultation" | "registration";
  detail: string;
}

export default function DoctorDashboardRedesign() {
  const router = useRouter();

  // Sidebar & Layout State
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("Dashboard");

  // Duty Toggle (iPhone-style smooth switch)
  const [isOnDuty, setIsOnDuty] = useState<boolean>(true);

  // Doctor Info State
  const [doctor] = useState({
    name: "Dr. Pressy",
    fullName: "Dr. Pressy Mutero, MD",
    specialty: "Consultant General Practitioner",
    licenseNo: "KMPDC/LIC/2026/8942",
    licenseStatus: "Verified MD",
    email: "doctor@example.com",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
    lastSync: "Just now",
  });

  // Metrics State
  const [metrics] = useState({
    totalPatientsToday: 12,
    waitingNow: 4,
    nextVisitTime: "2:30 PM",
    todayEarningsMpesa: "KSh 18,000",
    consultationsCompleted: "8/15",
    avgConsultTime: "18 min",
    missedAppointments: 2,
  });

  // Today's Schedule State
  const [schedule] = useState<PatientSchedule[]>([
    {
      id: "P-101",
      time: "09:00 AM",
      patientName: "John Mwangi",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      type: "Video",
      status: "In Progress",
      shaStatus: "Verified",
      condition: "Hypertension Routine Review",
    },
    {
      id: "P-102",
      time: "09:30 AM",
      patientName: "Mary Wanjiku",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      type: "Follow-up",
      status: "Upcoming",
      shaStatus: "Verified",
      condition: "Acute Febrile Illness & Lab Review",
    },
    {
      id: "P-103",
      time: "10:00 AM",
      patientName: "James Otieno",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
      type: "Physical",
      status: "Upcoming",
      shaStatus: "Pending",
      condition: "Post-op Wound Inspection",
    },
    {
      id: "P-104",
      time: "11:15 AM",
      patientName: "Faith Njoroge",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      type: "Video",
      status: "Upcoming",
      shaStatus: "Verified",
      condition: "Type 2 Diabetes Glycemia Consultation",
    },
  ]);

  // Waiting Room Queue State
  const [waitingQueue] = useState<WaitingPatient[]>([
    {
      id: "W-01",
      name: "David Korir",
      waitTime: "14 min",
      symptom: "Chest tightness & shortness of breath",
      urgency: "Emergency",
      paymentType: "SHA / Insurance",
    },
    {
      id: "W-02",
      name: "Mary Wanjiku",
      waitTime: "6 min",
      symptom: "High Grade Fever (38.9°C)",
      urgency: "High",
      paymentType: "M-Pesa",
    },
    {
      id: "W-03",
      name: "Lucy Nyambura",
      waitTime: "3 min",
      symptom: "Refill Prescriptions for Amlodipine",
      urgency: "Normal",
      paymentType: "M-Pesa",
    },
  ]);

  // Recent Activity Feed State
  const [activities] = useState<ActivityItem[]>([
    { id: "a1", title: "Prescription Sent", time: "5 mins ago", type: "prescription", detail: "Amoxiclav 625mg sent to Pharmally Juja for Mary Wanjiku" },
    { id: "a2", title: "Lab Result Uploaded", time: "18 mins ago", type: "lab", detail: "Lipid Profile & CBC verified by AI for John Mwangi" },
    { id: "a3", title: "Consultation Completed", time: "42 mins ago", type: "consultation", detail: "Telehealth video session concluded with Peter Ochieng" },
    { id: "a4", title: "New Patient Registered", time: "1 hour ago", type: "registration", detail: "Faith Njoroge onboarded via SHA eCitizen Portal" },
  ]);

  // Modals / AI Note Trigger
  const [aiNoteActive, setAiNoteActive] = useState<boolean>(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [aiNotesText, setAiNotesText] = useState<string>("");

  const handleVoiceToRx = () => {
    setIsRecordingVoice(!isRecordingVoice);
    if (!isRecordingVoice) {
      setTimeout(() => {
        setAiNotesText("Patient presents with 3-day history of acute fever and fatigue. Advise Paracetamol 1g TDS for 5 days, CBC, and Malaria RDT test. Drink plenty of fluid.");
        setIsRecordingVoice(false);
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 font-sans flex antialiased selection:bg-blue-500 selection:text-white">

      {/* ========================================================================= */}
      {/* 9. UPGRADED SIDEBAR WITH COLLAPSE & GLOWING ACTIVE INDICATORS */}
      {/* ========================================================================= */}
      <aside className={`bg-slate-900 text-slate-300 flex flex-col justify-between transition-all duration-300 z-30 sticky top-0 h-screen shadow-2xl ${sidebarCollapsed ? "w-20" : "w-64"}`}>
        <div>
          {/* Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/30 flex-shrink-0">
                <Stethoscope size={22} />
              </div>
              {!sidebarCollapsed && (
                <div className="truncate">
                  <h1 className="font-black text-white text-base tracking-tight leading-none">SwiftMD</h1>
                  <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider">Doctor Suite</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
              title="Toggle Sidebar"
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5 mt-2">
            {[
              { name: "Dashboard", icon: Activity, badge: null },
              { name: "Appointments", icon: Calendar, badge: "3" },
              { name: "Waiting Room", icon: Clock, badge: "4", alert: true },
              { name: "Messages", icon: MessageSquare, badge: "12" },
              { name: "Patient Records", icon: FileText, badge: null },
              { name: "Telehealth Live", icon: Video, badge: "2", activePulse: true },
              { name: "M-Pesa Revenue", icon: DollarSign, badge: null },
            ].map((item) => {
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer relative group ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <item.icon size={18} className={isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400 transition"} />
                    {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                  </div>

                  {!sidebarCollapsed && item.badge && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        item.alert
                          ? "bg-rose-500 text-white animate-pulse"
                          : isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Active Glowing Left Pill */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full shadow-glow" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          {!sidebarCollapsed && (
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/20 text-xs">
              <div className="flex items-center justify-between text-indigo-300 font-extrabold text-[11px] mb-1">
                <span className="flex items-center gap-1"><Award size={13} /> CME Progress</span>
                <span>80%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full w-[80%]" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium">12/15 CPD Points earned for 2026</p>
            </div>
          )}

          <button
            onClick={() => router.push("/login")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 text-xs font-bold transition cursor-pointer"
          >
            <LogOut size={18} />
            {!sidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* TOP BAR / HEADER */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient name, SHA ID, diagnosis or drug..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-blue-400 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Assistant Button */}
            <button
              onClick={() => setAiNoteActive(true)}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Sparkles size={15} className="text-indigo-600 animate-spin-slow" />
              <span className="hidden sm:inline">AI Consultation Assistant</span>
            </button>

            {/* Notification Bell */}
            <button className="relative p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>

            {/* Doctor Avatar Quick Access */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-9 h-9 rounded-2xl object-cover ring-2 ring-blue-500/30"
              />
              <div className="hidden md:block text-left">
                <h4 className="text-xs font-black text-slate-900 leading-tight">{doctor.name}</h4>
                <p className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {doctor.licenseStatus}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD BODY CONTAINER (8px spacing system, 24px between main sections) */}
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">

          {/* EMERGENCY RED ALERT BAR (Kenyan Telehealth Priority) */}
          <div className="bg-rose-50 border border-rose-200/80 p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse-border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-600 text-white rounded-2xl shadow-md shadow-rose-600/30">
                <AlertCircle size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase bg-rose-600 text-white px-2 py-0.5 rounded-md tracking-wider">
                    Emergency Triage Alert
                  </span>
                  <span className="text-xs font-bold text-rose-800">1 Patient in critical waiting list</span>
                </div>
                <p className="text-xs text-rose-900 font-semibold mt-0.5">
                  <strong>David Korir:</strong> Severe chest tightness & dyspnea (Waiting 14 min)
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/doctor/telehealth/emergency")}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-2xl transition cursor-pointer shadow-md shadow-rose-600/20 whitespace-nowrap"
            >
              Take Emergency Visit Now
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 1. ACTIONABLE HERO OVERVIEW CARD + 4. PROFILE & AVAILABILITY CARD */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* 1. HERO SECTION: TODAY'S OVERVIEW CARD (7 Cols) */}
            <div className="lg:col-span-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-blue-500/10 relative overflow-hidden flex flex-col justify-between">
              {/* Background visual accents */}
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute right-1/3 -top-12 w-48 h-48 bg-indigo-400/20 rounded-full blur-xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-extrabold text-blue-100 bg-white/15 px-3 py-1 rounded-full backdrop-blur-md uppercase tracking-wider">
                      Sunday • 13 Sept • You're Online
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 leading-tight">
                      Good morning, {doctor.name} 👋
                    </h2>
                    <p className="text-xs text-blue-100 font-medium mt-1">
                      You have <span className="text-amber-300 font-black">4 patients waiting</span> in the live room queue.
                    </p>
                  </div>

                  <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hidden sm:block">
                    <Stethoscope size={28} className="text-blue-100" />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl text-center space-y-0.5">
                    <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">Patients Today</span>
                    <strong className="text-xl sm:text-2xl font-black text-white">{metrics.totalPatientsToday}</strong>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl text-center space-y-0.5 relative">
                    <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">Waiting Now</span>
                    <strong className="text-xl sm:text-2xl font-black text-amber-300">{metrics.waitingNow}</strong>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl text-center space-y-0.5">
                    <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">Next Visit</span>
                    <strong className="text-lg sm:text-xl font-black text-white">{metrics.nextVisitTime}</strong>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl text-center space-y-0.5">
                    <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">M-Pesa Today</span>
                    <strong className="text-lg sm:text-xl font-black text-emerald-300">{metrics.todayEarningsMpesa}</strong>
                  </div>
                </div>

                {/* Immediate Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => router.push("/doctor/telehealth/live")}
                    className="px-6 py-3 bg-white hover:bg-slate-100 text-blue-700 font-black text-xs rounded-2xl transition shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    <Video size={16} />
                    <span>Start Consultation</span>
                  </button>

                  <button
                    onClick={() => router.push("/doctor/schedule")}
                    className="px-5 py-3 bg-white/15 hover:bg-white/25 border border-white/25 text-white font-black text-xs rounded-2xl transition cursor-pointer flex items-center gap-2 backdrop-blur-md"
                  >
                    <Calendar size={16} />
                    <span>View Full Schedule</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4. REPLACED PROFILE CARD (4 Cols) */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Profile & Availability</span>
                  <span className="text-[10px] text-slate-400 font-bold">Sync: {doctor.lastSync}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={doctor.avatar}
                      alt={doctor.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-50 shadow-md"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                        isOnDuty ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                      title={isOnDuty ? "Online & Ready" : "On Leave"}
                    >
                      <span className="w-2 h-2 bg-white rounded-full" />
                    </span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <h3 className="font-black text-slate-900 text-base leading-tight truncate">{doctor.fullName}</h3>
                    <p className="text-xs font-bold text-slate-500 truncate">{doctor.specialty}</p>
                    <div className="flex items-center gap-1 text-[11px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md w-max border border-blue-100">
                      <ShieldCheck size={13} /> {doctor.licenseStatus}
                    </div>
                  </div>
                </div>

                {/* iPhone-Style Smooth Availability Toggle */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <strong className="block text-xs font-black text-slate-800">Duty Status</strong>
                    <span className="text-[11px] font-bold text-slate-500">
                      {isOnDuty ? "Receiving Telehealth Calls" : "On Leave / Unavailable"}
                    </span>
                  </div>

                  <button
                    onClick={() => setIsOnDuty(!isOnDuty)}
                    className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out cursor-pointer ${
                      isOnDuty ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                        isOnDuty ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Bottom Quick Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => router.push("/doctor/profile/edit")}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Settings size={15} /> Edit Profile & Schedule
                </button>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 2. QUICK ACTIONS HUB */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => router.push("/doctor/telehealth/live")}
              className="p-4 bg-white hover:bg-blue-50/50 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition text-left group flex items-center gap-3.5 cursor-pointer"
            >
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition">
                <Video size={20} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition">Start Consultation</h4>
                <p className="text-[11px] font-semibold text-slate-400">Launch live call room</p>
              </div>
            </button>

            <button
              onClick={() => router.push("/doctor/patients/new")}
              className="p-4 bg-white hover:bg-indigo-50/50 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition text-left group flex items-center gap-3.5 cursor-pointer"
            >
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition">
                <UserPlus size={20} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600 transition">Add Patient</h4>
                <p className="text-[11px] font-semibold text-slate-400">Register SHA profile</p>
              </div>
            </button>

            <button
              onClick={() => router.push("/doctor/prescriptions/new")}
              className="p-4 bg-white hover:bg-purple-50/50 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-300 transition text-left group flex items-center gap-3.5 cursor-pointer"
            >
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-105 transition">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-xs sm:text-sm group-hover:text-purple-600 transition">Write Prescription</h4>
                <p className="text-[11px] font-semibold text-slate-400">Issue e-Rx with safety check</p>
              </div>
            </button>

            <button
              onClick={() => router.push("/doctor/labs")}
              className="p-4 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition text-left group flex items-center gap-3.5 cursor-pointer"
            >
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition">
                <Activity size={20} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-xs sm:text-sm group-hover:text-emerald-600 transition">Lab Results</h4>
                <p className="text-[11px] font-semibold text-slate-400">3 pending reviews</p>
              </div>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 3. PATIENT WORKLOAD CARD & 6. LIVE WAITING ROOM */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* 3. PATIENT WORKLOAD CARD (With Line Chart & Key Metrics) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">Patient Workload & Analytics</h3>
                  <p className="text-[11px] font-semibold text-slate-400">Consultation flow and daily pace</p>
                </div>
                <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                  Today's Rate
                </span>
              </div>

              {/* Workload Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Live Queue</span>
                  <strong className="text-base font-black text-amber-600">Waiting: 4</strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Completed</span>
                  <strong className="text-base font-black text-emerald-600">{metrics.consultationsCompleted}</strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Avg Visit Time</span>
                  <strong className="text-base font-black text-blue-600">{metrics.avgConsultTime}</strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Missed</span>
                  <strong className="text-base font-black text-rose-600">{metrics.missedAppointments} Visits</strong>
                </div>
              </div>

              {/* Line Chart Visual Representation */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Hourly Patient Traffic Curve</span>
                  <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                    <TrendingUp size={14} /> Peak at 11:00 AM
                  </span>
                </div>

                {/* SVG Smooth Line Chart */}
                <div className="h-32 w-full bg-gradient-to-b from-blue-50/50 to-transparent rounded-2xl p-2 border border-slate-100 flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Fill */}
                    <path
                      d="M0,80 Q70,20 140,60 T280,10 T420,50 T500,30 L500,100 L0,100 Z"
                      fill="url(#chartGrad)"
                    />
                    {/* Stroke */}
                    <path
                      d="M0,80 Q70,20 140,60 T280,10 T420,50 T500,30"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    {/* Data Points */}
                    <circle cx="140" cy="60" r="4" fill="#2563eb" />
                    <circle cx="280" cy="10" r="5" fill="#f59e0b" className="animate-pulse" />
                    <circle cx="420" cy="50" r="4" fill="#2563eb" />
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] font-extrabold text-slate-400 px-1">
                  <span>08:00 AM</span>
                  <span>10:00 AM</span>
                  <span>12:00 PM (Peak)</span>
                  <span>02:00 PM</span>
                  <span>04:00 PM</span>
                </div>
              </div>
            </div>

            {/* 6. TELEHEALTH WAITING ROOM CARD */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Clock size={16} />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">Live Telehealth Waiting Room</h3>
                    <p className="text-[11px] font-semibold text-slate-400">Patients checked in and waiting</p>
                  </div>
                </div>
                <span className="text-[10px] font-black bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                  4 Queued
                </span>
              </div>

              {/* Waiting Patients List */}
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {waitingQueue.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      patient.urgency === "Emergency"
                        ? "bg-rose-50/60 border-rose-200"
                        : "bg-slate-50/80 border-slate-100 hover:border-blue-200"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 text-xs truncate">{patient.name}</h4>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${
                            patient.urgency === "Emergency"
                              ? "bg-rose-600 text-white"
                              : patient.urgency === "High"
                              ? "bg-amber-500 text-white"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {patient.urgency}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 font-medium line-clamp-1">{patient.symptom}</p>

                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                        <span className="text-amber-600 font-extrabold flex items-center gap-1">
                          <Clock size={11} /> Waiting: {patient.waitTime}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-600 font-extrabold">{patient.paymentType} Verified</span>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/doctor/telehealth/room?patientId=${patient.id}`)}
                      className={`px-3 py-2 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1 whitespace-nowrap shadow-sm ${
                        patient.urgency === "Emergency"
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      <span>Join Now</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 5. TODAY'S SCHEDULE TABLE (Main Content Component) */}
          {/* ========================================================================= */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Today's Appointment Schedule</h3>
                <p className="text-xs font-semibold text-slate-400">Scheduled consultations and physical checkups for Sept 13, 2026</p>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5">
                  <Filter size={14} /> Filter
                </button>
                <button
                  onClick={() => router.push("/doctor/appointments/new")}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5"
                >
                  <PlusCircle size={14} /> Book Appointment
                </button>
              </div>
            </div>

            {/* Schedule Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-2">Time Slot</th>
                    <th className="pb-3 px-2">Patient Details</th>
                    <th className="pb-3 px-2">Consult Type</th>
                    <th className="pb-3 px-2">Reason / Clinical Condition</th>
                    <th className="pb-3 px-2">SHA Status</th>
                    <th className="pb-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {schedule.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      
                      {/* Time */}
                      <td className="py-4 px-2 whitespace-nowrap">
                        <div className="flex items-center gap-2 font-black text-slate-900">
                          <Clock size={14} className="text-blue-600" />
                          <span>{item.time}</span>
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="py-4 px-2 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img src={item.avatar} alt={item.patientName} className="w-9 h-9 rounded-xl object-cover" />
                          <div>
                            <strong className="block text-slate-900 font-black">{item.patientName}</strong>
                            <span className="text-[10px] text-slate-400 font-bold">{item.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Consult Type */}
                      <td className="py-4 px-2 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            item.type === "Video"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                              : item.type === "Follow-up"
                              ? "bg-purple-50 text-purple-700 border border-purple-100"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>

                      {/* Condition */}
                      <td className="py-4 px-2 max-w-xs truncate font-medium text-slate-800">
                        {item.condition}
                      </td>

                      {/* SHA Verification */}
                      <td className="py-4 px-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            item.shaStatus === "Verified"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <ShieldCheck size={12} /> {item.shaStatus}
                        </span>
                      </td>

                      {/* Row Actions */}
                      <td className="py-4 px-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/doctor/telehealth/room?patientId=${item.id}`)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition cursor-pointer"
                          >
                            Join
                          </button>
                          <button
                            onClick={() => router.push(`/doctor/patients/records?id=${item.id}`)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
                          >
                            View Record
                          </button>
                          <button
                            onClick={() => alert(`Rescheduling ${item.patientName}`)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Reschedule"
                          >
                            <RefreshCw size={15} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 8. RECENT ACTIVITY FEED & KENYAN VALUE-ADD PANELS */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* 8. RECENT ACTIVITY FEED (7 Cols) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Recent Medical Activity</h3>
                <span className="text-[10px] text-slate-400 font-bold">Real-time log</span>
              </div>

              <div className="space-y-3">
                {activities.map((act) => (
                  <div key={act.id} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-start gap-3 hover:border-blue-200 transition">
                    <div className="p-2 bg-white text-blue-600 rounded-xl shadow-xs mt-0.5">
                      {act.type === "prescription" && <FileText size={16} />}
                      {act.type === "lab" && <Activity size={16} />}
                      {act.type === "consultation" && <Video size={16} />}
                      {act.type === "registration" && <UserPlus size={16} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-900 text-xs">{act.title}</h4>
                        <span className="text-[10px] font-bold text-slate-400">{act.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">{act.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* KENYAN CLINICAL SAFETY & AI INSIGHTS (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">

              {/* Drug Safety Alert Widget */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 rounded-3xl border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-black text-xs uppercase tracking-wider">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <span>Drug Interaction Safety Guard</span>
                </div>
                <p className="text-xs text-amber-900 font-medium leading-relaxed">
                  Automatic warning triggers when co-prescribing <strong>Warfarin</strong> and NSAIDs. 1 potential alert flagged today.
                </p>
                <button className="text-xs font-black text-amber-800 hover:underline flex items-center gap-1">
                  View Drug Interaction Protocol →
                </button>
              </div>

              {/* Pending Lab Queue Summary */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Pending Lab Queue</h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md">3 Ready</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-bold">
                  <div>
                    <strong className="block text-slate-900">Mary Wanjiku - CBC & Malaria RDT</strong>
                    <span className="text-[10px] text-slate-400 font-medium">Uploaded 18 mins ago</span>
                  </div>
                  <button className="text-blue-600 font-black hover:underline">Review</button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* ========================================================================= */}
      {/* AI CONSULTATION ASSISTANT & VOICE-TO-RX MODAL */}
      {/* ========================================================================= */}
      {aiNoteActive && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-700 font-black text-sm">
                <Sparkles size={18} className="text-indigo-600" />
                <span>AI Clinical Assistant & Voice Prescriber</span>
              </div>
              <button onClick={() => setAiNoteActive(false)} className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-indigo-950 space-y-2">
                <strong className="block font-black text-sm">Voice Dictation Mode</strong>
                <p className="text-[11px] font-medium text-slate-600">
                  Click the microphone button to dictate consultation notes or prescriptions. AI will structure it into standard medical notes.
                </p>

                <div className="flex items-center justify-center py-4">
                  <button
                    onClick={handleVoiceToRx}
                    className={`p-5 rounded-full transition-all cursor-pointer ${
                      isRecordingVoice
                        ? "bg-rose-600 text-white animate-pulse ring-8 ring-rose-100"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30"
                    }`}
                  >
                    <Mic size={28} />
                  </button>
                </div>
                <p className="text-center font-bold text-[11px] text-indigo-700">
                  {isRecordingVoice ? "Listening to dictation... speak clearly" : "Click to start recording"}
                </p>
              </div>

              {/* Dictated Notes Output */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Generated Clinical Note & Prescription:</label>
                <textarea
                  value={aiNotesText}
                  onChange={(e) => setAiNotesText(e.target.value)}
                  placeholder="Dictation output will appear here..."
                  rows={4}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setAiNoteActive(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert("Notes saved to patient file.");
                    setAiNoteActive(false);
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl transition shadow-md shadow-indigo-600/20"
                >
                  Save to Patient Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}