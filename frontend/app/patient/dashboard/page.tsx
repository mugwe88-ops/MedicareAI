// frontend/app/patient/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, Clock, Pill, FileText, MessageSquare, Shield, Activity, 
  PhoneCall, Users, Sparkles, ArrowRight, ChevronRight, RefreshCw, LogOut,
  Video, Upload, UserPlus, Heart, Thermometer, Droplet, CheckCircle2,
  AlertTriangle, Navigation, Hospital, ShieldAlert, X, Search, Check
} from "lucide-react";

interface PatientProfile {
  name: string;
  email: string;
  age: number;
  gender: string;
  bloodGroup: string;
  patientId: string;
  allergies: string[];
  insuranceStatus: string;
  avatarUrl?: string;
}

interface Appointment {
  title: string;
  time: string;
  status: string;
  doctor: string;
}

interface Medication {
  name: string;
  dueTime: string;
  dosage: string;
}

interface LabRecord {
  name: string;
  status: string;
  date: string;
}

interface DoctorMessage {
  doctor: string;
  preview: string;
  unread: boolean;
  time: string;
}

interface Vitals {
  bloodPressure: string;
  heartRate: string;
  weight: string;
  adherence: string;
}

interface TimelineItem {
  time: string;
  title: string;
  type: "medication" | "appointment" | "reminder";
  completed: boolean;
}

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  iconType: "lab" | "prescription" | "message" | "appointment";
}

export default function PatientDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Modals state
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);

  // Dynamic greeting calculations
  const [greeting, setGreeting] = useState<string>("Good Evening");
  const [currentDateString, setCurrentDateString] = useState<string>("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    setCurrentDateString(new Date().toLocaleDateString("en-US", options));
  }, []);

  const [patient, setPatient] = useState<PatientProfile>({
    name: "Willy Weyru",
    email: "willy@example.com",
    age: 34,
    gender: "Male",
    bloodGroup: "O+",
    patientId: "#MED-8492",
    allergies: ["Penicillin"],
    insuranceStatus: "Active SHA / NHIF",
    avatarUrl: ""
  });

  const [nextAppointment, setNextAppointment] = useState<Appointment>({
    title: "Cardiology Follow-up Consultation",
    time: "Today at 2:00 PM",
    status: "Confirmed",
    doctor: "Dr. Robert Vance"
  });

  const [medicationDue, setMedicationDue] = useState<Medication>({
    name: "Amlodipine",
    dosage: "5mg - 1 Tablet",
    dueTime: "In 30 mins"
  });

  const [pendingLab, setPendingLab] = useState<LabRecord>({
    name: "Lipid Profile & Complete Blood Count",
    status: "Results ready",
    date: "Sep 12, 2026"
  });

  const [doctorMessage, setDoctorMessage] = useState<DoctorMessage>({
    doctor: "Dr. Robert Vance",
    preview: "Your blood pressure readings look stable this week. Keep up the low sodium diet.",
    unread: true,
    time: "10 mins ago"
  });

  const [vitals] = useState<Vitals>({
    bloodPressure: "120/80 mmHg",
    heartRate: "72 bpm",
    weight: "68 kg",
    adherence: "92%"
  });

  const [todaySchedule, setTodaySchedule] = useState<TimelineItem[]>([
    { time: "08:00 AM", title: "Morning Amlodipine 5mg", type: "medication", completed: true },
    { time: "02:00 PM", title: "Cardiology Virtual Consultation with Dr. Vance", type: "appointment", completed: false },
    { time: "06:00 PM", title: "Log Evening Blood Pressure Vitals", type: "reminder", completed: false },
    { time: "09:00 PM", title: "Night Dosage & Rest Sync", type: "medication", completed: false }
  ]);

  const [recentActivities] = useState<ActivityItem[]>([
    { id: "1", title: "Lab Result Uploaded", subtitle: "Lipid Profile & CBC verified by AI", time: "1 hour ago", iconType: "lab" },
    { id: "2", title: "Prescription Renewed", subtitle: "Amlodipine 5mg renewed for 30 days", time: "3 hours ago", iconType: "prescription" },
    { id: "3", title: "Doctor Message Received", subtitle: "Dr. Robert Vance left a consultation summary", time: "Yesterday", iconType: "message" },
    { id: "4", title: "Appointment Confirmed", subtitle: "Follow-up confirmed with Cardiology department", time: "2 days ago", iconType: "appointment" }
  ]);

  // AI State
  const [aiQuery, setAiQuery] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medicareai-1.onrender.com";

      if (!token) {
        const storedName = localStorage.getItem("userName") || localStorage.getItem("patientName");
        if (storedName) setPatient(prev => ({ ...prev, name: storedName }));
        setLoading(false);
        return;
      }

      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
      const res = await fetch(`${API_URL}/api/patient/dashboard-data`, { headers });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.patient) setPatient(data.patient);
          if (data.upcomingAppointment) setNextAppointment(data.upcomingAppointment);
          if (data.patient?.name) localStorage.setItem("patientName", data.patient.name);
        }
      }
    } catch (err) {
      console.error("Dashboard sync offline:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAiAsk = (queryText?: string) => {
    const textToSearch = queryText || aiQuery;
    if (!textToSearch.trim()) return;
    setIsAiLoading(true);
    setAiModalOpen(true);
    setAiQuery(textToSearch);

    setTimeout(() => {
      setAiResponse(`Hello ${patient.name}, regarding: "${textToSearch}"\n\nI have evaluated your profile chart. Your current vitals show Blood Pressure at ${vitals.bloodPressure} (Normal range) and Medication Adherence is strong at ${vitals.adherence}. Your next appointment is scheduled for ${nextAppointment.time} with ${nextAppointment.doctor}. Let me know if you would like me to summarize your full lab report or contact your doctor.`);
      setIsAiLoading(false);
    }, 1100);
  };

  const toggleScheduleItem = (index: number) => {
    setTodaySchedule(prev => prev.map((item, i) => i === index ? { ...item, completed: !item.completed } : item));
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto bg-slate-50/60 w-full relative min-h-screen">
      
      {/* 1. PREMIUM WELCOME HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-48 h-48 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              {patient.avatarUrl ? (
                <img src={patient.avatarUrl} alt={patient.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md" />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md text-white font-black text-2xl flex items-center justify-center ring-4 ring-white/20 shadow-md">
                  {patient.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-indigo-600 rounded-full" title="Active Status" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-blue-100 bg-white/15 px-3 py-0.5 rounded-full backdrop-blur-md uppercase tracking-wider">
                  {currentDateString}
                </span>
                <button onClick={fetchDashboardData} className="p-1 text-blue-200 hover:text-white transition" title="Refresh">
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                {greeting}, {patient.name.split(" ")[0]}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-lg">
                Your medical status is <span className="text-emerald-300 font-bold">Stable</span>. You have 1 consultation scheduled for today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button 
              onClick={() => setAiModalOpen(true)}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/20 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Sparkles size={16} className="text-amber-300" />
              <span>Ask AI Health Assistant</span>
            </button>
            <button 
              onClick={handleLogout}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition cursor-pointer backdrop-blur-md"
              title="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>

        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertTriangle size={15} />
          {errorMsg}
        </div>
      )}

      {/* 2. QUICK ACTIONS HUB */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        
        <button 
          onClick={() => router.push("/patient/dashboard/appointments")}
          className="p-4 bg-white hover:bg-blue-50/50 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition text-left group flex items-center gap-3.5 cursor-pointer"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition">
            <Calendar size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-blue-600 transition">Book Appointment</h4>
            <p className="text-[11px] text-slate-400 font-medium">Find specialist doctors</p>
          </div>
        </button>

        <button 
          onClick={() => router.push("/patient/dashboard/consultations")}
          className="p-4 bg-white hover:bg-indigo-50/50 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition text-left group flex items-center gap-3.5 cursor-pointer"
        >
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition">
            <Video size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-indigo-600 transition">Start Video Call</h4>
            <p className="text-[11px] text-slate-400 font-medium">Join teleconsult room</p>
          </div>
        </button>

        <button 
          onClick={() => router.push("/patient/dashboard/medical-records")}
          className="p-4 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition text-left group flex items-center gap-3.5 cursor-pointer"
        >
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition">
            <Upload size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-emerald-600 transition">Upload Prescription</h4>
            <p className="text-[11px] text-slate-400 font-medium">Scan labs or scripts</p>
          </div>
        </button>

        <button 
          onClick={() => router.push("/patient/dashboard/doctors")}
          className="p-4 bg-white hover:bg-purple-50/50 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-300 transition text-left group flex items-center gap-3.5 cursor-pointer"
        >
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-105 transition">
            <UserPlus size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-purple-600 transition">Find a Doctor</h4>
            <p className="text-[11px] text-slate-400 font-medium">Browse verified physicians</p>
          </div>
        </button>

      </div>

      {/* 3. TODAY'S HEALTH HUB (PRIORITIZED GRID) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-wider text-slate-400 font-black flex items-center gap-1.5">
            <Activity size={14} className="text-blue-600" /> Today's Priority Action Hub
          </h2>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/50">Live Sync Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Next Appointment Card (Largest - Col 6) */}
          <div 
            onClick={() => router.push("/patient/dashboard/consultations")}
            className="md:col-span-6 bg-gradient-to-br from-white to-blue-50/30 p-6 rounded-3xl border border-blue-200/80 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-sm">
                  <Calendar size={20} />
                </span>
                <span className="text-xs font-black uppercase text-blue-600 tracking-wide">Next Appointment</span>
              </div>
              <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                {nextAppointment.status}
              </span>
            </div>

            <div className="my-4 space-y-1">
              <h3 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition">{nextAppointment.title}</h3>
              <p className="text-xs font-bold text-slate-500">{nextAppointment.doctor}</p>
              <div className="flex items-center gap-2 pt-2 text-blue-700 font-extrabold text-sm">
                <Clock size={16} />
                <span>{nextAppointment.time}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>Join Telehealth Call Room</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Medication Due Card (Col 3 - Red/Orange Priority Highlight) */}
          <div 
            onClick={() => router.push("/patient/dashboard/medical-records")}
            className="md:col-span-3 bg-gradient-to-br from-white to-amber-50/40 p-5 rounded-3xl border border-amber-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-sm">
                <Pill size={18} />
              </span>
              <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                Urgent Intake
              </span>
            </div>

            <div className="my-3 space-y-0.5">
              <span className="text-[10px] font-bold text-amber-700 uppercase">Medication Due</span>
              <h3 className="font-black text-slate-900 text-base group-hover:text-amber-700 transition">{medicationDue.name}</h3>
              <p className="text-xs font-bold text-slate-500">{medicationDue.dosage}</p>
              <p className="text-xs font-extrabold text-rose-600 pt-1 flex items-center gap-1">
                <Clock size={13} /> {medicationDue.dueTime}
              </p>
            </div>

            <div className="text-[11px] font-bold text-amber-800 flex items-center justify-between pt-2 border-t border-amber-100">
              <span>Mark as Taken</span>
              <CheckCircle2 size={15} />
            </div>
          </div>

          {/* Doctor Message & Lab Results (Col 3 - Stacked layout) */}
          <div className="md:col-span-3 space-y-4 flex flex-col justify-between">
            
            {/* Doctor Message */}
            <div 
              onClick={() => router.push("/patient/dashboard/consultations")}
              className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm hover:border-indigo-300 transition cursor-pointer group flex-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <MessageSquare size={15} />
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Doctor Note</span>
                </div>
                {doctorMessage.unread && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />}
              </div>
              <h4 className="font-black text-slate-900 text-xs mt-2 truncate">{doctorMessage.doctor}</h4>
              <p className="text-[11px] text-slate-500 line-clamp-1 font-medium mt-0.5">{doctorMessage.preview}</p>
            </div>

            {/* Lab Results */}
            <div 
              onClick={() => router.push("/patient/dashboard/medical-records")}
              className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-200/80 shadow-sm hover:border-emerald-400 transition cursor-pointer group flex-1"
            >
              <div className="flex items-center justify-between">
                <span className="p-2 bg-emerald-600 text-white rounded-xl">
                  <FileText size={15} />
                </span>
                <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  AI Ready
                </span>
              </div>
              <h4 className="font-black text-slate-900 text-xs mt-2 truncate">{pendingLab.name}</h4>
              <p className="text-[11px] font-bold text-emerald-700 mt-0.5">View AI Summary →</p>
            </div>

          </div>

        </div>
      </div>

      {/* 4. HEALTH SNAPSHOT & TIMELINE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Health Snapshot Matrix (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Health Snapshot Matrix</h3>
                <p className="text-[11px] text-slate-400 font-medium">Real-time biometrics from synced devices</p>
              </div>
              <button 
                onClick={() => router.push("/patient/dashboard/medical-records")}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
              >
                Full Analytics <ChevronRight size={14} />
              </button>
            </div>

            {/* Metrics Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
                    <th className="pb-2">Metric</th>
                    <th className="pb-2">Value</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold">
                  <tr>
                    <td className="py-3 flex items-center gap-2 text-slate-800">
                      <Heart size={15} className="text-rose-500" /> Blood Pressure
                    </td>
                    <td className="py-3 text-slate-900 font-black">{vitals.bloodPressure}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px]">Optimal</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 flex items-center gap-2 text-slate-800">
                      <Activity size={15} className="text-blue-500" /> Heart Rate
                    </td>
                    <td className="py-3 text-slate-900 font-black">{vitals.heartRate}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px]">Normal</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 flex items-center gap-2 text-slate-800">
                      <Droplet size={15} className="text-indigo-500" /> Weight Body Mass
                    </td>
                    <td className="py-3 text-slate-900 font-black">{vitals.weight}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px]">Maintained</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 flex items-center gap-2 text-slate-800">
                      <CheckCircle2 size={15} className="text-purple-500" /> Medication Adherence
                    </td>
                    <td className="py-3 text-slate-900 font-black">{vitals.adherence}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px]">Excellent</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Recent Activity Feed</h3>
              <span className="text-[10px] text-slate-400 font-bold">Updated real-time</span>
            </div>

            <div className="space-y-3.5">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-2xl transition border border-slate-100">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mt-0.5">
                    {act.iconType === "lab" && <FileText size={16} />}
                    {act.iconType === "prescription" && <Pill size={16} />}
                    {act.iconType === "message" && <MessageSquare size={16} />}
                    {act.iconType === "appointment" && <Calendar size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-800 text-xs">{act.title}</h4>
                      <span className="text-[10px] font-semibold text-slate-400">{act.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{act.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Today's Timeline Schedule (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Today's Schedule</h3>
                <p className="text-[11px] text-slate-400 font-medium">Timeline of tasks & reminders</p>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2.5 py-1 rounded-full">Today</span>
            </div>

            <div className="relative pl-4 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {todaySchedule.map((item, idx) => (
                <div key={idx} className="relative flex items-start justify-between gap-3 group">
                  <button 
                    onClick={() => toggleScheduleItem(idx)}
                    className={`absolute -left-[21px] top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition cursor-pointer ${
                      item.completed ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-300 hover:border-blue-500"
                    }`}
                  >
                    {item.completed && <Check size={12} strokeWidth={3} />}
                  </button>

                  <div className="space-y-0.5 pl-2">
                    <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wide">{item.time}</span>
                    <h4 className={`text-xs font-bold leading-snug transition ${item.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                      {item.title}
                    </h4>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    item.type === "medication" ? "bg-purple-50 text-purple-700" :
                    item.type === "appointment" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Linked Insurance & Profile summary */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-black">Insurance & Coverage</h4>
            <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Shield className="text-emerald-600" size={18} />
                <div>
                  <strong className="block text-slate-900 font-extrabold">{patient.insuranceStatus}</strong>
                  <span className="text-[10px] text-emerald-700 font-bold">100% Outpatient Coverage</span>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2.5 py-1 rounded-lg">Verified</span>
            </div>
          </div>

        </div>

      </div>

      {/* 5. IMPOSSIBLE TO MISS EMERGENCY SOS FLOATING ACTION BUTTON */}
      <button 
        onClick={() => setEmergencyModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-5 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-full shadow-2xl shadow-rose-600/50 flex items-center gap-2.5 cursor-pointer animate-bounce hover:animate-none transition"
      >
        <PhoneCall size={18} className="animate-spin text-rose-200" />
        <span>Emergency SOS</span>
      </button>

      {/* FLOATING AI ASSISTANT TRIGGER BUTTON */}
      <button 
        onClick={() => setAiModalOpen(true)}
        className="fixed bottom-6 right-48 z-40 p-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-xl shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition hidden sm:flex"
      >
        <Sparkles size={18} className="text-amber-300" />
        <span>AI Health Assistant</span>
      </button>

      {/* EMERGENCY MODAL */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-rose-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs uppercase tracking-wider text-rose-600 font-black flex items-center gap-1.5">
                <ShieldAlert size={18} /> Emergency Medical Dispatch
              </span>
              <button onClick={() => setEmergencyModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-1">
              <strong className="block font-black text-sm">Need immediate medical attention?</strong>
              <p className="text-[11px] font-medium">Clicking below directly triggers dispatch services and shares your live GPS location with doctors.</p>
            </div>

            <div className="space-y-2.5">
              <a 
                href="tel:999" 
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition flex items-center justify-center gap-2 shadow-md"
              >
                <PhoneCall size={16} /> Call Ambulance (999 / 112)
              </a>
              <button 
                onClick={() => { alert("Location dispatched to nearest hospital."); setEmergencyModalOpen(false); }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2"
              >
                <Hospital size={16} /> Alert Nearest Hospital (Juja/Nairobi)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI ASSISTANT MODAL WITH SUGGESTION CHIPS */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs uppercase tracking-wider text-blue-600 font-black flex items-center gap-1.5">
                <Sparkles size={16} className="text-blue-500" /> SwiftMD AI Health Assistant
              </span>
              <button onClick={() => setAiModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Smart Suggestion Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Suggested Questions</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Explain my lab results",
                  "Check medication interactions",
                  "Prepare for my appointment",
                  "Find nearby hospitals"
                ].map((chip, i) => (
                  <button 
                    key={i}
                    onClick={() => handleAiAsk(chip)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-xl text-[11px] font-bold transition cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Query Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleAiAsk(); }} className="relative">
              <input
                type="text"
                placeholder="Ask your health query..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-20 py-3 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 transition"
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Ask
              </button>
            </form>

            {isAiLoading ? (
              <div className="py-8 text-center space-y-2">
                <Sparkles size={28} className="mx-auto text-blue-600 animate-spin" />
                <p className="text-xs text-slate-500 font-bold">Analyzing your live health profile...</p>
              </div>
            ) : aiResponse ? (
              <div className="space-y-3">
                <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-medium">
                  {aiResponse}
                </div>
                <button 
                  onClick={() => { setAiModalOpen(false); router.push("/patient/dashboard/consultations"); }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Book Consultation with Doctor
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
}