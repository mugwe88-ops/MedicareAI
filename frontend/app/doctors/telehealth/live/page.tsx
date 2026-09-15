// frontend/app/doctors/telehealth/live/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  ShieldCheck,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Pill,
  FileText,
  Activity,
  Sparkles,
  Send,
  ChevronRight,
  CheckCircle2,
  Stethoscope,
  Heart,
  Thermometer,
  ArrowLeft,
  Share2,
  Download,
  Check
} from "lucide-react";

export default function LiveTelehealthRoom() {
  const [loading, setLoading] = useState<boolean>(true);
  const [callStatus, setCallStatus] = useState<"Connecting" | "Live" | "Ended">("Live");
  const [timerSeconds, setTimerSeconds] = useState<number>(345); // 05:45
  
  // Media Controls State
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);

  // Clinical Workspace Form State
  const [chiefComplaint, setChiefComplaint] = useState("Persistent dry cough, mild shortness of breath, and low-grade fever for 3 days.");
  const [hpi, setHpi] = useState("Patient reports symptoms started after exposure to cold weather. No known contact with TB or COVID-19 positive individuals.");
  const [examNotes, setExamNotes] = useState("Clear vesicular breath sounds bilaterally, mild wheezing on forced expiration. Throat slightly erythematous.");
  const [assessment, setAssessment] = useState("Acute bronchitis / Upper Respiratory Tract Infection (URTI).");
  const [plan, setPlan] = useState("Prescribed bronchodilator inhaler and expectorant. Ordered CBC and chest auscultation follow-up in 48 hours.");
  
  const [savingDraft, setSavingDraft] = useState(false);
  const [consultationCompleted, setConsultationCompleted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Call timer increment
  useEffect(() => {
    if (callStatus === "Live") {
      const interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callStatus]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCompleteConsultation = () => {
    setConsultationCompleted(true);
    setCallStatus("Ended");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400">Initializing Swift MD Secure Telehealth Room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* ================= HEADER ================= */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3.5 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link
            href="/doctors"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft size={16} /> Exit Room
          </Link>
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
              alt="Sarah Wanjiku"
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-white">Sarah Wanjiku</h1>
                <span className="text-xs text-slate-400 font-medium">(Female, 32)</span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar size={12} /> Appointment: Today, 02:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge & Timer */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-emerald-400">LIVE</span>
            <span className="text-xs font-mono text-slate-300 ml-2 font-bold">{formatTime(timerSeconds)}</span>
          </div>

          <span className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-extrabold rounded-xl flex items-center gap-1.5">
            <ShieldEndorseIcon /> Encrypted HIPAA Room
          </span>
        </div>
      </header>

      {/* ================= HIGH-PRIORITY ALERT BANNER ================= */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-300 shrink-0">
        <div className="flex items-center gap-2 mx-auto">
          <AlertTriangle size={15} className="text-amber-400 shrink-0" />
          <span><strong>Critical Notice:</strong> Patient reported mild shortness of breath. Monitor O2 saturation closely.</span>
        </div>
      </div>

      {/* ================= MAIN GRID CONTAINER ================= */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 overflow-hidden">
        
        {/* LEFT & CENTER: VIDEO & WORKSPACE (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto">
          
          {/* VIDEO STREAM CONTAINER */}
          <div className="relative w-full h-[380px] md:h-[440px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
            {/* Patient Video Placeholder */}
            {isVideoOff ? (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                  <User size={36} />
                </div>
                <p className="text-xs font-bold">Patient Camera Off</p>
              </div>
            ) : (
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200"
                  alt="Patient Video Feed"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute bottom-4 left-4 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Sarah Wanjiku (Patient)
                </div>
              </div>
            )}

            {/* Draggable Doctor Self-View PiP */}
            <div className="absolute top-4 right-4 w-36 h-24 md:w-48 md:h-32 bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400"
                  alt="Dr. William Mugwe"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] font-bold text-slate-300">
                  Dr. William Mugwe (You)
                </span>
              </div>
            </div>

            {/* Connection Quality Indicator */}
            <div className="absolute top-4 left-4 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
              <Activity size={13} /> HD 1080p • 24ms (Excellent)
            </div>

            {/* Floating Video Control Bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 shadow-2xl flex items-center gap-3">
              <button
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`p-3 rounded-xl transition cursor-pointer ${isMicMuted ? "bg-red-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"}`}
                title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3 rounded-xl transition cursor-pointer ${isVideoOff ? "bg-red-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"}`}
                title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
              >
                {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
              </button>

              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-3 rounded-xl transition cursor-pointer ${isScreenSharing ? "bg-blue-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"}`}
                title="Share Screen"
              >
                <Monitor size={18} />
              </button>

              <div className="w-px h-6 bg-slate-700 mx-1" />

              <button
                onClick={handleCompleteConsultation}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <PhoneOff size={16} /> End Consultation
              </button>
            </div>
          </div>

          {/* QUICK ACTION CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Write Prescription", icon: Pill, href: "/doctors/prescriptions", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
              { label: "Order Lab Tests", icon: FileText, href: "/doctors/labs", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
              { label: "Medical Record", icon: Stethoscope, href: "/doctors/patients", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
              { label: "Follow-up", icon: Calendar, href: "#", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
              { label: "Export Summary", icon: Download, href: "#", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" }
            ].map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link
                  key={idx}
                  href={action.href}
                  className={`p-3.5 rounded-2xl border transition flex flex-col items-center text-center gap-2 hover:scale-[1.02] cursor-pointer ${action.color}`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-bold text-slate-200">{action.label}</span>
                </Link>
              );
            })}
          </div>

          {/* CLINICAL CONSULTATION WORKSPACE (SOAP Notes) */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Clinical Consultation Workspace</h3>
                <p className="text-xs text-slate-400">Structured electronic health record entry for this session.</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold rounded-full">
                Auto-saved 1m ago
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Chief Complaint</label>
                <textarea
                  rows={2}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-600/40 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">History of Present Illness (HPI)</label>
                <textarea
                  rows={2}
                  value={hpi}
                  onChange={(e) => setHpi(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-600/40 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Examination Notes</label>
                <textarea
                  rows={2}
                  value={examNotes}
                  onChange={(e) => setExamNotes(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-600/40 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Assessment / Diagnosis</label>
                <textarea
                  rows={2}
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-600/40 resize-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Treatment Plan & Prescription Instructions</label>
              <textarea
                rows={3}
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-600/40 resize-none"
              />
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR: PATIENT SUMMARY & AI ASSISTANT (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* PATIENT VITAL SIGNS & SUMMARY CARD */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Patient Clinical Summary
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-red-400 uppercase">Allergies</span>
                <p className="text-xs font-bold text-white">Penicillin, Sulfa</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-blue-400 uppercase">Current Rx</span>
                <p className="text-xs font-bold text-white">Salbutamol Inhaler</p>
              </div>
            </div>

            {/* Vital Signs Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-0.5">
                <Heart size={14} className="mx-auto text-rose-500" />
                <span className="text-[10px] text-slate-400 font-bold">HR</span>
                <p className="text-xs font-black text-white">78 bpm</p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-0.5">
                <Activity size={14} className="mx-auto text-blue-500" />
                <span className="text-[10px] text-slate-400 font-bold">BP</span>
                <p className="text-xs font-black text-white">120/80</p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-0.5">
                <Thermometer size={14} className="mx-auto text-amber-500" />
                <span className="text-[10px] text-slate-400 font-bold">Temp</span>
                <p className="text-xs font-black text-white">37.2°C</p>
              </div>
            </div>
          </div>

          {/* AI CLINICAL ASSISTANT PANEL */}
          <div className="bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 rounded-3xl border border-blue-500/30 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="p-2 bg-blue-600 text-white rounded-xl">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Swift MD Clinical AI</h3>
                <p className="text-[10px] text-blue-400 font-bold">Real-time Decision Support</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-amber-400 uppercase">Differential Diagnosis</span>
                <p className="text-slate-200 font-medium">1. Acute Bronchitis (88%)<br />2. Upper Respiratory Tract Infection (72%)</p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-emerald-400 uppercase">Medication Safety</span>
                <p className="text-slate-200 font-medium">No drug-drug interactions detected with current Salbutamol prescription.</p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-blue-400 uppercase">Recommended Investigation</span>
                <p className="text-slate-200 font-medium">Consider Complete Blood Count (CBC) to rule out bacterial infection.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ================= FOOTER ACTIONS ================= */}
      <footer className="bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-4 md:px-8 py-4 shrink-0 z-20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          Session ID: <code className="text-blue-400 font-mono">SWIFT-LIVE-8849-KE</code> • Secure 256-bit AES
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => alert("Consultation draft saved successfully.")}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Save Draft
          </button>
          <button
            onClick={() => alert("Follow-up appointment reminder scheduled for 48 hours.")}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Schedule Follow-up
          </button>
          <button
            onClick={handleCompleteConsultation}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 transition cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 size={16} /> Complete Consultation & Generate Summary
          </button>
        </div>
      </footer>

    </div>
  );
}

function ShieldEndorseIcon() {
  return <ShieldCheck size={13} />;
}