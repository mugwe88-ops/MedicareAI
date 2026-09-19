"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  Maximize2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Pill,
  FileText,
  Activity,
  Sparkles,
  ArrowLeft,
  Download,
  Heart,
  Thermometer,
  Stethoscope,
  CheckCircle2,
  RefreshCw
} from "lucide-react";

// Mock database for patients keyed by patientId
const mockPatientsDatabase: Record<string, {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  vitals: { hr: string; bp: string; temp: string; o2: string };
  lastConsultation: string;
  shaStatus: string;
  waitingTime: string;
  isEmergency: boolean;
}> = {
  "P-101": {
    id: "P-101",
    name: "Willy",
    age: 30,
    gender: "Male",
    bloodGroup: "O+",
    allergies: ["None known"],
    chronicConditions: ["None"],
    currentMedications: ["Amlodipine 5mg"],
    vitals: { hr: "78 bpm", bp: "120/80", temp: "37.2°C", o2: "98%" },
    lastConsultation: "First visit",
    shaStatus: "Verified",
    waitingTime: "02:15 mins",
    isEmergency: false
  }
};

function TelehealthRoomContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId") || "P-101";
  const patientNameParam = searchParams.get("name");

  let patient = mockPatientsDatabase[patientId];
  if (!patient) {
    patient = {
      id: patientId,
      name: patientNameParam || "Willy",
      age: 30,
      gender: "Male",
      bloodGroup: "O+",
      allergies: ["None known"],
      chronicConditions: ["Routine Review"],
      currentMedications: ["Amlodipine 5mg"],
      vitals: { hr: "76 bpm", bp: "120/80", temp: "37.0°C", o2: "99%" },
      lastConsultation: "Recent",
      shaStatus: "Verified",
      waitingTime: "01:00 min",
      isEmergency: false
    };
  } else if (patientNameParam) {
    patient.name = patientNameParam;
  }

  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState<"Connecting" | "Live" | "Ended">("Connecting");
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Media controls state
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Clinical workspace SOAP notes state
  const [chiefComplaint, setChiefComplaint] = useState("Routine consultation and medication review.");
  const [hpi, setHpi] = useState("Patient reports stable condition. Adherent to prescribed dosage.");
  const [examFindings, setExamFindings] = useState("Clear vital signs, normal rhythm, no acute distress.");
  const [assessment, setAssessment] = useState("Stable clinical parameters.");
  const [diagnosis, setDiagnosis] = useState("Routine Health Check (Z00.0)");
  const [treatmentPlan, setTreatmentPlan] = useState("Continue current regimen. Schedule follow-up in 30 days.");
  
  const [consultationCompleted, setConsultationCompleted] = useState(false);

  // Simulate connecting to patient WebRTC feed
  useEffect(() => {
    const loadTimer = setTimeout(() => setLoading(false), 500);
    
    // Switch from Connecting to Live after 2 seconds to simulate peer handshake
    const connectTimer = setTimeout(() => {
      setCallStatus("Live");
    }, 2000);

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(connectTimer);
    };
  }, []);

  // Call duration timer
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400">Establishing Secure P2P Connection with {patient.name}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* ================= HEADER ================= */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3.5 flex items-center justify-between shrink-0 z-25">
        <div className="flex items-center gap-4">
          <Link
            href="/doctors/dashboard"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
              alt={patient.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-white">{patient.name}</h1>
                <span className="text-[11px] text-slate-400 font-medium">({patient.gender}, {patient.age})</span>
                <span className="text-[10px] font-mono bg-slate-800 text-blue-400 px-2 py-0.5 rounded-md font-bold">Ref: {patient.id.slice(0, 8)}</span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Waiting: {patient.waitingTime}</span> • <span>SHA: {patient.shaStatus}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className={`w-2.5 h-2.5 rounded-full ${callStatus === "Live" ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-ping"}`} />
            <span className={`text-xs font-black ${callStatus === "Live" ? "text-emerald-400" : "text-amber-400"}`}>
              {callStatus.toUpperCase()}
            </span>
            <span className="text-xs font-mono text-slate-300 ml-2 font-bold">{formatTime(timerSeconds)}</span>
          </div>

          <span className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-extrabold rounded-xl flex items-center gap-1.5">
            <ShieldCheck size={14} /> HIPAA Secure
          </span>
        </div>
      </header>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 overflow-hidden">
        
        {/* LEFT & CENTER: VIDEO & CLINICAL WORKSPACE (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto">
          
          {/* VIDEO CONSULTATION AREA */}
          <div className={`relative w-full h-[380px] md:h-[440px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center ${isFullScreen ? "fixed inset-0 z-50 h-screen w-screen rounded-none" : ""}`}>
            {callStatus === "Connecting" ? (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <RefreshCw size={36} className="animate-spin text-blue-500" />
                <p className="text-xs font-bold tracking-wider uppercase text-blue-400">Connecting to {patient.name}'s feed...</p>
              </div>
            ) : isVideoOff ? (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                  <User size={36} />
                </div>
                <p className="text-xs font-bold">Patient Camera Off</p>
              </div>
            ) : (
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=1200"
                  alt="Patient Video Feed"
                  className="w-full h-full object-cover opacity-95"
                />
                <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> {patient.name} (Active Feed Connected)
                </div>
              </div>
            )}

            {/* Doctor Self-View Preview PiP */}
            <div className="absolute top-4 right-4 w-36 h-24 md:w-48 md:h-32 bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400"
                  alt="Dr. William"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] font-bold text-slate-300">
                  Dr. William (You)
                </span>
              </div>
            </div>

            {/* Connection Quality Indicator */}
            <div className="absolute top-4 left-4 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
              <Activity size={13} /> HD 1080p • 18ms (Secure P2P)
            </div>

            {/* Video Control Bar */}
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

              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                title="Toggle Fullscreen"
              >
                <Maximize2 size={18} />
              </button>

              <div className="w-px h-6 bg-slate-700 mx-1" />

              <button
                onClick={handleCompleteConsultation}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <PhoneOff size={16} /> End Call
              </button>
            </div>
          </div>

          {/* QUICK ACTION CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Write Prescription", icon: Pill, href: "/doctors/prescriptions/new", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
              { label: "Order Lab Tests", icon: FileText, href: "/doctors/labs", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
              { label: "Medical Records", icon: Stethoscope, href: "/doctors/patients", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
              { label: "Follow-up", icon: Calendar, href: "#", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
              { label: "Download Summary", icon: Download, href: "#", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" }
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

          {/* CLINICAL WORKSPACE (SOAP Notes) */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Clinical Consultation Workspace</h3>
                <p className="text-xs text-slate-400">Auto-saved locally for session {patient.name}.</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold rounded-full">
                Auto-saved
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
                <label className="text-xs font-bold text-slate-300">Examination Findings</label>
                <textarea
                  rows={2}
                  value={examFindings}
                  onChange={(e) => setExamFindings(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-600/40 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Assessment</label>
                <textarea
                  rows={2}
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-600/40 resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Diagnosis (ICD-10)</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-600/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Treatment Plan</label>
                <input
                  type="text"
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-600/40"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR: PATIENT INFO & AI ASSISTANT (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* PATIENT INFO SIDEBAR */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Patient Clinical Record
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-blue-400 uppercase">Blood Group</span>
                <p className="text-xs font-bold text-white">{patient.bloodGroup}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">SHA Status</span>
                <p className="text-xs font-bold text-white">{patient.shaStatus}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-red-400 uppercase">Allergies</span>
                <p className="text-xs font-bold text-white">{patient.allergies.join(", ")}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-purple-400 uppercase">Chronic Conditions</span>
                <p className="text-xs font-bold text-white">{patient.chronicConditions.join(", ")}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-blue-400 uppercase">Current Medications</span>
                <p className="text-xs font-bold text-white">{patient.currentMedications.join(", ")}</p>
              </div>
            </div>

            {/* Vital Signs Grid */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-400 font-bold block">HR</span>
                <p className="text-[11px] font-black text-white">{patient.vitals.hr}</p>
              </div>
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-400 font-bold block">BP</span>
                <p className="text-[11px] font-black text-white">{patient.vitals.bp}</p>
              </div>
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-400 font-bold block">Temp</span>
                <p className="text-[11px] font-black text-white">{patient.vitals.temp}</p>
              </div>
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-400 font-bold block">SpO2</span>
                <p className="text-[11px] font-black text-white">{patient.vitals.o2}</p>
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
                <span className="text-[10px] font-black text-amber-400 uppercase">Suggested Assessment</span>
                <p className="text-slate-200 font-medium">Routine Telehealth Follow-up. Vital signs within normal limits.</p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-emerald-400 uppercase">Drug Interaction & Allergy Alerts</span>
                <p className="text-slate-200 font-medium">No active allergy conflicts recorded.</p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-blue-400 uppercase">Recommended Action</span>
                <p className="text-slate-200 font-medium">Issue e-prescription if needed or conclude consultation summary.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ================= FOOTER ACTIONS ================= */}
      <footer className="bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-4 md:px-8 py-4 shrink-0 z-20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          Room Session ID: <code className="text-blue-400 font-mono">SWIFT-{patient.name.toUpperCase()}-LIVE</code>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => alert("Consultation draft notes saved successfully.")}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Save Draft
          </button>
          <button
            onClick={() => alert("Follow-up appointment scheduled.")}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Schedule Follow-up
          </button>
          <Link
            href="/doctors/dashboard"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            Return to Dashboard
          </Link>
          <button
            onClick={handleCompleteConsultation}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 transition cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 size={16} /> Complete Consultation & Summary
          </button>
        </div>
      </footer>

    </div>
  );
}

export default function TelehealthRoomPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs font-bold">
        Loading Telehealth Room...
      </div>
    }>
      <TelehealthRoomContent />
    </Suspense>
  );
}