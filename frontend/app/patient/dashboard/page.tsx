// frontend/app/patient/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, Clock, Pill, FileText, MessageSquare, Shield, Activity, 
  AlertTriangle, PhoneCall, Users, Sparkles, Search, ArrowRight, 
  CheckCircle2, Heart, Thermometer, Droplet, UserCheck, LogOut, ChevronRight
} from "lucide-react";

export default function PatientDashboardPage() {
  const router = useRouter();
  const [patientName, setPatientName] = useState<string>("Patient");
  const [loading, setLoading] = useState<boolean>(true);
  const [aiQuery, setAiQuery] = useState<string>("");
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Dynamic Dashboard Stats State
  const [nextAppointment, setNextAppointment] = useState({ title: "Cardiology with Dr. Jane", time: "Today at 2:00 PM", status: "Confirmed" });
  const [medicationDue, setMedicationDue] = useState({ name: "Amlodipine 5mg", dueTime: "In 30 minutes", taken: false });
  const [pendingLab, setPendingLab] = useState({ name: "Lipid Profile & Complete Blood Count", status: "Results ready to view with AI explanation" });
  const [doctorMessage, setDoctorMessage] = useState({ doctor: "Dr. Robert", preview: "Your blood pressure readings look stable. Keep up the routine.", unread: true });

  useEffect(() => {
    // Fetch patient session/profile if available
    const storedName = localStorage.getItem("userName") || localStorage.getItem("patientName");
    if (storedName) setPatientName(storedName);
    setLoading(false);
  }, []);

  const handleAiAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setAiModalOpen(true);
    
    setTimeout(() => {
      setAiResponse(`Regarding your query: "${aiQuery}" — As your AI Health Assistant, I've analyzed your recent clinical records. Your latest blood pressure is 138/88 mmHg (slightly elevated) and your next appointment is today at 2:00 PM. Would you like me to book a follow-up with your cardiologist or explain your recent lab results in plain English?`);
      setIsAiLoading(false);
    }, 1200);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-8 space-y-6 overflow-y-auto bg-slate-50 w-full">
      
      {/* Top Bar: Welcome & AI Health Assistant Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back, {patientName}</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Your personalized health hub. Monitor medications, upcoming appointments, and AI-powered insights.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.push("/patient/emergency")}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer animate-pulse"
            >
              <PhoneCall size={15} /> Emergency Help
            </button>
            <button 
              onClick={handleLogout}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition cursor-pointer"
              title="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* AI Health Assistant Search Bar (Replaces old plain search bar) */}
        <form onSubmit={handleAiAssistantSubmit} className="relative w-full">
          <div className="absolute left-4 top-3.5 text-blue-600 flex items-center gap-1.5 font-bold text-xs">
            <Sparkles size={16} className="animate-spin text-blue-500" />
            <span className="hidden sm:inline">AI Assistant:</span>
          </div>
          <input
            type="text"
            placeholder="Ask anything e.g. 'What does my lab result mean?' or 'Remind me to take my medication'..."
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            className="w-full bg-blue-50/50 border border-blue-200/80 rounded-2xl pl-28 sm:pl-32 pr-28 py-3 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 transition shadow-sm"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Ask AI
          </button>
        </form>
      </div>

      {/* SECTION 1: Today's Health Hub (Replaces ambiguous Health Score gauge) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-wider text-slate-400 font-black flex items-center gap-1.5">
            <Activity size={14} className="text-blue-600" /> Today's Health Hub
          </h2>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">Live Updates Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Next Appointment Countdown */}
          <div 
            onClick={() => router.push("/patient/consultations")}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 hover:border-blue-300 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition">
                <Calendar size={18} />
              </span>
              <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                {nextAppointment.status}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">Next Appointment</span>
              <h3 className="font-black text-slate-900 text-sm mt-0.5">{nextAppointment.title}</h3>
              <p className="text-xs font-bold text-blue-600 mt-1 flex items-center gap-1">
                <Clock size={12} /> {nextAppointment.time}
              </p>
            </div>
          </div>

          {/* Card 2: Medication Due Soon */}
          <div 
            onClick={() => router.push("/patient/medications")}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 hover:border-purple-300 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition">
                <Pill size={18} />
              </span>
              <span className="text-[10px] font-black uppercase bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                Action Required
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">Medication Status</span>
              <h3 className="font-black text-slate-900 text-sm mt-0.5">{medicationDue.name}</h3>
              <p className="text-xs font-bold text-purple-600 mt-1 flex items-center gap-1">
                <Clock size={12} /> Due {medicationDue.dueTime}
              </p>
            </div>
          </div>

          {/* Card 3: Pending Lab Results Explained by AI */}
          <div 
            onClick={() => router.push("/patient/records")}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 hover:border-emerald-300 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition">
                <FileText size={18} />
              </span>
              <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                AI Ready
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">Lab Reports</span>
              <h3 className="font-black text-slate-900 text-sm mt-0.5 truncate">{pendingLab.name}</h3>
              <p className="text-xs font-bold text-emerald-600 mt-1">Tap for AI Plain-English breakdown</p>
            </div>
          </div>

          {/* Card 4: Doctor Message Waiting */}
          <div 
            onClick={() => router.push("/patient/messages")}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 hover:border-indigo-300 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition">
                <MessageSquare size={18} />
              </span>
              {doctorMessage.unread && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">Message from {doctorMessage.doctor}</span>
              <h3 className="font-black text-slate-900 text-xs mt-0.5 truncate">{doctorMessage.preview}</h3>
              <p className="text-xs font-bold text-indigo-600 mt-1 flex items-center gap-1">Open Chat <ArrowRight size={12} /></p>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: Quick Features Grid (Telehealth, Vitals, Family, Insurance) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Core Actions & Vitals Summary */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* One-Tap Telehealth Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-black uppercase">Ready for Consultation</span>
              <h3 className="text-lg font-black tracking-tight">Dr. Jane is waiting in the Virtual Room</h3>
              <p className="text-xs text-blue-100">Join via HD Video or Low-Data Audio mode instantly.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={() => router.push("/patient/telehealth/room-1")}
                className="flex-1 sm:flex-none px-5 py-3 bg-white text-blue-700 hover:bg-blue-50 font-black text-xs uppercase rounded-2xl shadow transition cursor-pointer flex items-center justify-center gap-2"
              >
                Join Video Call
              </button>
            </div>
          </div>

          {/* Vitals Tracking Preview Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Latest Vitals Trend</span>
              <button 
                onClick={() => router.push("/patient/vitals")}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
              >
                View Full History <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Blood Pressure</span>
                <span className="text-sm font-black text-slate-800 mt-1 block">138/88 <span className="text-[10px] text-amber-600">mmHg</span></span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Heart Rate</span>
                <span className="text-sm font-black text-slate-800 mt-1 block">78 <span className="text-[10px] text-emerald-600">bpm</span></span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Blood Sugar</span>
                <span className="text-sm font-black text-slate-800 mt-1 block">5.4 <span className="text-[10px] text-emerald-600">mmol/L</span></span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Temperature</span>
                <span className="text-sm font-black text-slate-800 mt-1 block">98.6 <span className="text-[10px] text-emerald-600">°F</span></span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Profile Summary, Family & Insurance (SHA/NHIF) */}
        <div className="space-y-6">
          
          {/* Patient Medical Profile Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Medical Summary</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2.5 py-0.5 rounded-full">Active Patient</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-base flex items-center justify-center shadow">
                {patientName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">{patientName}</h3>
                <p className="text-xs text-slate-400">Male • 34 yrs • ID: #MED-8492</p>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Blood Group:</span>
                <strong className="text-slate-800 font-bold">O Positive (O+)</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Known Allergies:</span>
                <strong className="text-rose-600 font-bold">Penicillin</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">SHA / NHIF Status:</span>
                <strong className="text-emerald-600 font-bold">Verified & Active</strong>
              </div>
            </div>
          </div>

          {/* Family Profiles & Insurance Widget */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Family & Insurance</span>
              <button onClick={() => router.push("/patient/family")} className="text-xs text-blue-600 font-bold hover:underline">Manage</button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-600" />
                  <span className="font-bold text-slate-800">Linked Family Accounts</span>
                </div>
                <span className="text-slate-500 font-bold">2 Members</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-emerald-600" />
                  <span className="font-bold text-slate-800">Private Insurance / SHA</span>
                </div>
                <span className="text-emerald-600 font-bold">Covered</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* AI Assistant Modal Result Popup */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs uppercase tracking-wider text-blue-600 font-black flex items-center gap-1.5">
                <Sparkles size={16} /> SwiftMD AI Health Assistant
              </span>
              <button 
                onClick={() => setAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {isAiLoading ? (
              <div className="py-12 text-center space-y-3">
                <Sparkles size={32} className="mx-auto text-blue-600 animate-spin" />
                <p className="text-xs text-slate-500 font-bold">Analyzing your health records & symptoms...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 text-xs text-slate-700 leading-relaxed font-medium">
                  {aiResponse}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setAiModalOpen(false); router.push("/patient/consultations"); }}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Book Consultation
                  </button>
                  <button 
                    onClick={() => setAiModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}