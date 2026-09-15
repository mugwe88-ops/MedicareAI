// frontend/app/doctors/telehealth/emergency/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneCall,
  AlertTriangle,
  Activity,
  Heart,
  Thermometer,
  FileText,
  Send,
  Sparkles,
  Clock,
  MapPin,
  Building,
  CheckCircle2,
  Users,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Phone,
  Radio,
  Plus
} from "lucide-react";

// Mock Emergency Patient Queue
interface EmergencyPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  priority: "Critical" | "High" | "Moderate";
  complaint: string;
  waitingTime: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  emergencyContact: { name: string; relation: string; phone: string };
  shaStatus: string;
  vitals: {
    hr: string;
    bp: string;
    o2: string;
    rr: string;
    temp: string;
  };
}

const initialEmergencyQueue: EmergencyPatient[] = [
  {
    id: "EM-301",
    name: "Grace Akinyi",
    age: 42,
    gender: "Female",
    priority: "Critical",
    complaint: "Severe acute chest pain radiating to left arm, shortness of breath, diaphoresis.",
    waitingTime: "02:14 mins",
    bloodGroup: "O+",
    allergies: ["Aspirin sensitivity"],
    chronicConditions: ["Hypertension"],
    currentMedications: ["Amlodipine 5mg"],
    emergencyContact: { name: "Ochieng Akinyi", relation: "Spouse", phone: "+254 722 111 222" },
    shaStatus: "Verified",
    vitals: {
      hr: "128 bpm (High)",
      bp: "175/105 mmHg (Critical)",
      o2: "91% (Low)",
      rr: "26 cpm (Rapid)",
      temp: "37.1°C"
    }
  },
  {
    id: "EM-302",
    name: "Brian Kiprono",
    age: 29,
    gender: "Male",
    priority: "High",
    complaint: "Sudden onset severe asthmatic crisis, accessory muscle use, unable to complete sentences.",
    waitingTime: "05:40 mins",
    bloodGroup: "B+",
    allergies: ["None known"],
    chronicConditions: ["Severe Asthma"],
    currentMedications: ["Salbutamol Inhaler"],
    emergencyContact: { name: "Mercy Kiprono", relation: "Sister", phone: "+254 733 333 444" },
    shaStatus: "Verified",
    vitals: {
      hr: "115 bpm",
      bp: "140/90 mmHg",
      o2: "89% (Critical)",
      rr: "30 cpm (Critical)",
      temp: "36.9°C"
    }
  }
];

export default function EmergencyTelehealthPage() {
  const [queue, setQueue] = useState<EmergencyPatient[]>(initialEmergencyQueue);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialEmergencyQueue[0]?.id || "");
  const [isQueueEmpty, setIsQueueEmpty] = useState<boolean>(false);

  // Video call controls state
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Clinical workspace notes state
  const [clinicalNotes, setClinicalNotes] = useState({
    chiefComplaint: "Severe acute chest pain radiating to left arm, diaphoresis.",
    rapidAssessment: "Patient conscious, anxious, acute respiratory distress and hypertensive urgency.",
    emergencyDiagnosis: "Suspected Acute Coronary Syndrome (I24.9) / Hypertensive Emergency.",
    immediateTreatment: "Administer sublingual nitroglycerin, oxygen therapy via non-rebreather mask, ready ambulance dispatch.",
    disposition: "Emergency Transfer to Level 5 Hospital.",
    referralNotes: "Requires immediate cardiology intervention and emergency ECG on arrival."
  });

  const [savedStatus, setSavedStatus] = useState("All changes auto-saved");

  // Timer state
  const [responseTimer, setResponseTimer] = useState(142); // seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setResponseTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const selectedPatient = queue.find(p => p.id === selectedPatientId) || queue[0];

  const handleNoteChange = (field: string, val: string) => {
    setClinicalNotes(prev => ({ ...prev, [field]: val }));
    setSavedStatus("Unsaved changes...");
    setTimeout(() => setSavedStatus("All changes auto-saved"), 1000);
  };

  const handleAction = (actionName: string) => {
    alert(`Emergency Command Triggered: ${actionName} for patient ${selectedPatient?.name}`);
  };

  if (isQueueEmpty || queue.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-6">
        <div className="w-20 h-20 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-3xl flex items-center justify-center shadow-2xl">
          <CheckCircle2 size={40} />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-xl font-black text-white">No emergency patients in queue.</h1>
          <p className="text-xs text-slate-400 max-w-sm">
            All acute emergency cases have been triaged and resolved. The command center is standing by.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/doctors/telehealth"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} /> Return to Telehealth Dashboard
          </Link>
          <button
            onClick={() => {
              setQueue(initialEmergencyQueue);
              setIsQueueEmpty(false);
            }}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Simulate Incoming Emergency
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 pb-32">
      
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/doctors/telehealth"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft size={16} /> Telehealth
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight">Emergency Telehealth Command Center</h1>
                <span className="px-2.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-extrabold rounded-full flex items-center gap-1.5 animate-pulse">
                  <Radio size={11} /> LIVE EMERGENCY STATUS
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                {queue.length} Critical patient(s) waiting • Active Response Timer: <span className="text-red-400 font-mono font-bold">{formatTime(responseTimer)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={() => setIsQueueEmpty(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Clear Queue (Test Empty)
            </button>
            <Link
              href="/doctors/dashboard"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CENTER: QUEUE, VIDEO, CLINICAL WORKSPACE (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* LIVE EMERGENCY QUEUE BAR */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Users size={16} className="text-red-500" /> Active Emergency Queue (Critical First)
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Sorted by Triage Priority</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {queue.map(pat => {
                const isSelected = pat.id === selectedPatient?.id;
                return (
                  <div
                    key={pat.id}
                    onClick={() => setSelectedPatientId(pat.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${isSelected ? "bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-900/20" : "bg-slate-950 border-slate-800 hover:border-slate-700"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400">{pat.id}</span>
                        <h4 className="font-black text-white text-xs">{pat.name}</h4>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${pat.priority === "Critical" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}>
                        {pat.priority}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-medium line-clamp-2">{pat.complaint}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                      <span className="flex items-center gap-1 text-amber-400 font-bold"><Clock size={11} /> Wait: {pat.waitingTime}</span>
                      <span className="text-blue-400 font-bold underline">Select & Join →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* EMERGENCY VIDEO CONSULTATION PANEL */}
          <div className="bg-slate-900 rounded-3xl border border-red-500/40 p-6 space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-600 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">
              Emergency Video Active
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Video size={16} className="text-red-500" /> Live Stream: {selectedPatient?.name} ({selectedPatient?.id})
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold">Encrypted 256-bit P2P</span>
            </div>

            {/* Video Box */}
            <div className="relative w-full h-80 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400 animate-pulse">
                  <Video size={36} />
                </div>
                <p className="text-xs font-black text-white">Streaming Patient Camera Feed...</p>
                <p className="text-[10px] text-slate-400">Audio stream active with real-time noise suppression.</p>
              </div>

              {/* Doctor Self-View PiP */}
              <div className="absolute bottom-4 right-4 w-32 h-24 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-xl">
                Doctor Self-View
              </div>
            </div>

            {/* Video Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-3 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${isVideoOn ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-red-600 text-white"}`}
                >
                  {isVideoOn ? <Video size={16} /> : <VideoOff size={16} />}
                </button>
                <button
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`p-3 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${isMicOn ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-red-600 text-white"}`}
                >
                  {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
                </button>
                <button
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={`px-3.5 py-3 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${isScreenSharing ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                >
                  <Share2 size={16} /> Share Screen
                </button>
              </div>

              <button
                onClick={() => alert("Ending emergency call. Generating incident report...")}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 transition cursor-pointer flex items-center gap-2"
              >
                <PhoneCall size={16} /> End Emergency Call
              </button>
            </div>
          </div>

          {/* LIVE VITAL SIGNS MONITORING */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <Activity size={16} className="text-emerald-500" /> Live Telemetries & Vital Signs
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-red-500/40 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Heart Rate</span>
                <p className="font-black text-red-400 text-sm">{selectedPatient.vitals.hr}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-red-500/40 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Blood Pressure</span>
                <p className="font-black text-red-400 text-sm">{selectedPatient.vitals.bp}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-red-500/40 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Oxygen Sat</span>
                <p className="font-black text-red-400 text-sm">{selectedPatient.vitals.o2}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-amber-500/40 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Resp Rate</span>
                <p className="font-black text-amber-400 text-sm">{selectedPatient.vitals.rr}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Temperature</span>
                <p className="font-black text-white text-sm">{selectedPatient.vitals.temp}</p>
              </div>
            </div>
          </div>

          {/* EMERGENCY ACTIONS */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" /> Emergency Response Actions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <button
                onClick={() => handleAction("Call Ambulance (Red Crescent / 999)")}
                className="p-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone size={16} /> Call Ambulance
              </button>
              <button
                onClick={() => handleAction("Refer to Nearest Hospital")}
                className="p-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Building size={16} /> Refer to Hospital
              </button>
              <button
                onClick={() => handleAction("Notify Emergency Contact")}
                className="p-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Users size={16} /> Notify Contact
              </button>
              <button
                onClick={() => handleAction("Write Emergency Prescription")}
                className="p-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText size={16} /> Emergency Rx
              </button>
              <button
                onClick={() => handleAction("Order STAT Lab Tests")}
                className="p-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Activity size={16} /> Order STAT Labs
              </button>
              <button
                onClick={() => handleAction("Generate Official Referral Letter")}
                className="p-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={16} /> Referral Letter
              </button>
            </div>
          </div>

          {/* CLINICAL WORKSPACE (Expandable / Editable Notes) */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-blue-500" /> Emergency Clinical Workspace & Notes
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">{savedStatus}</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Chief Complaint</label>
                <textarea
                  rows={2}
                  value={clinicalNotes.chiefComplaint}
                  onChange={e => handleNoteChange("chiefComplaint", e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white focus:outline-blue-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Rapid Assessment</label>
                <textarea
                  rows={2}
                  value={clinicalNotes.rapidAssessment}
                  onChange={e => handleNoteChange("rapidAssessment", e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white focus:outline-blue-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Emergency Diagnosis</label>
                <input
                  type="text"
                  value={clinicalNotes.emergencyDiagnosis}
                  onChange={e => handleNoteChange("emergencyDiagnosis", e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:outline-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Immediate Treatment Plan</label>
                <textarea
                  rows={2}
                  value={clinicalNotes.immediateTreatment}
                  onChange={e => handleNoteChange("immediateTreatment", e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white focus:outline-blue-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Disposition & Referral Notes</label>
                <input
                  type="text"
                  value={clinicalNotes.disposition}
                  onChange={e => handleNoteChange("disposition", e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:outline-blue-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR: AI ASSISTANT & HOSPITAL REFERRAL (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI EMERGENCY ASSISTANT PANEL */}
          <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-slate-900 rounded-3xl border border-blue-500/30 p-6 text-white space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="p-2 bg-blue-600 text-white rounded-xl">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider">Swift MD Emergency AI</h3>
                <p className="text-[10px] text-blue-400 font-bold">Real-time Clinical Decision Support</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-red-500/30 space-y-1">
                <span className="text-[10px] font-black text-red-400 uppercase">Red-Flag Alert</span>
                <p className="text-slate-300 font-medium">Tachycardia combined with SpO2 below 92% indicates immediate risk of circulatory collapse.</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-1">
                <span className="text-[10px] font-black text-amber-400 uppercase">Drug Interaction Warning</span>
                <p className="text-slate-300 font-medium">Caution with Nitroglycerin if patient has recent phosphodiesterase inhibitor use.</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-blue-500/30 space-y-1">
                <span className="text-[10px] font-black text-blue-400 uppercase">WHO & Kenya MOH Protocol</span>
                <p className="text-slate-300 font-medium">Follow national emergency cardiac care pathways. Immediate Level 5/6 hospital transfer recommended.</p>
              </div>
            </div>
          </div>

          {/* HOSPITAL REFERRAL PANEL */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <Building size={16} className="text-emerald-500" /> Nearest Hospital Referral
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-white">Embu Level 5 Teaching & Referral Hospital</h4>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold rounded-full">Ready</span>
                </div>
                <p className="text-slate-400 text-[11px] flex items-center gap-1">
                  <MapPin size={12} /> Embu Town • Approx. 4.2 km away
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold">Est. Ambulance Travel:</span>
                  <span className="text-amber-400 font-mono font-bold">12 mins</span>
                </div>
              </div>

              <button
                onClick={() => alert("Dispatching electronic referral summary to Embu Level 5 ER intake...")}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={14} /> Dispatch Referral Summary
              </button>
            </div>
          </div>

          {/* PATIENT PROFILE CARD SUMMARY */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-500" /> Patient Emergency Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-slate-950 rounded-xl">
                <span className="text-slate-400">Patient Name:</span>
                <span className="font-bold text-white">{selectedPatient.name} ({selectedPatient.age} yrs)</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded-xl">
                <span className="text-slate-400">Blood Group:</span>
                <span className="font-bold text-blue-400">{selectedPatient.bloodGroup}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded-xl">
                <span className="text-slate-400">SHA Status:</span>
                <span className="font-bold text-emerald-400">{selectedPatient.shaStatus}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded-xl">
                <span className="text-slate-400">Emergency Contact:</span>
                <span className="font-bold text-white">{selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.phone})</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Allergies & Conditions:</span>
                <p className="font-bold text-red-400">{selectedPatient.allergies.join(", ")} • {selectedPatient.chronicConditions.join(", ")}</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ================= FOOTER ACTIONS ================= */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 md:px-8 py-3.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-bold">
            Active Emergency ID: <code className="text-red-400 font-mono">{selectedPatient.id}</code>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => alert("Emergency notes saved successfully.")}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Save Emergency Notes
            </button>
            <button
              onClick={() => alert("Emergency consultation marked as completed.")}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Complete Consultation
            </button>
            <button
              onClick={() => alert("Generating official emergency incident report PDF...")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Generate Emergency Report
            </button>
            <Link
              href="/doctors/telehealth"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Return to Telehealth Dashboard
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}