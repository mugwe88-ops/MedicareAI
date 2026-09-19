"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Calendar, Clock, Video, UserPlus, FileText, Activity, 
  Search, Bell, ShieldCheck, TrendingUp, AlertTriangle, Stethoscope, Mic, 
  DollarSign, Sparkles, AlertCircle, Settings, RefreshCw, PlusCircle, ArrowUpRight, X, Filter
} from "lucide-react";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export default function DoctorDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorIdParam = searchParams.get('doctorId');

  // Duty Toggle State
  const [isOnDuty, setIsOnDuty] = useState<boolean>(true);

  // Doctor Info State (Dynamic)
  const [doctor, setDoctor] = useState({
    name: "Dr. Specialist",
    fullName: "Doctor Specialist, MD",
    specialty: "Consultant General Practitioner",
    licenseStatus: "Verified MD",
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
  ]);

  // Recent Activity Feed State
  const [activities] = useState<ActivityItem[]>([
    { id: "a1", title: "Prescription Sent", time: "5 mins ago", type: "prescription", detail: "Amoxiclav 625mg sent to Pharmally Juja for Mary Wanjiku" },
    { id: "a2", title: "Lab Result Uploaded", time: "18 mins ago", type: "lab", detail: "Lipid Profile & CBC verified by AI for John Mwangi" },
  ]);

  // Modals / AI Note Trigger
  const [aiNoteActive, setAiNoteActive] = useState<boolean>(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [aiNotesText, setAiNotesText] = useState<string>("");

  // Fetch logged-in doctor profile dynamically from Supabase
  useEffect(() => {
    async function fetchDoctorProfile() {
      try {
        let query = supabase.from('doctors').select('*');
        
        if (doctorIdParam) {
          query = query.eq('id', doctorIdParam);
        } else {
          // Default to first active doctor if no param specified
          query = query.limit(1);
        }

        const { data, error } = await query.single();
        if (data && !error) {
          const docName = data.display_name || data.name || "Dr. Specialist";
          const shortName = docName.split(' ')[0] + (docName.split(' ')[1] ? ' ' + docName.split(' ')[1] : '');
          setDoctor({
            name: shortName,
            fullName: docName,
            specialty: data.specialization || data.department || "Consultant General Practitioner",
            licenseStatus: "Verified MD",
            avatar: data.avatar_url || data.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
            lastSync: "Just now",
          });
        }
      } catch (err) {
        console.error("Error fetching doctor profile:", err);
      }
    }

    fetchDoctorProfile();
  }, [doctorIdParam]);

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
    <div className="space-y-6 max-w-[1600px] mx-auto w-full p-4 sm:p-6 text-slate-800 antialiased font-sans">

      {/* SEARCH & QUICK ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-lg">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient name, SHA ID, diagnosis or drug..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-blue-400 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition"
          />
        </div>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={() => setAiNoteActive(true)}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Sparkles size={15} className="text-indigo-600" />
            <span>AI Assistant</span>
          </button>
        </div>
      </div>

      {/* EMERGENCY RED ALERT BAR */}
      <div className="bg-rose-50 border border-rose-200/80 p-4 rounded-3xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
          onClick={() => router.push("/doctors/telehealth/emergency")}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-2xl transition cursor-pointer shadow-md shadow-rose-600/20 whitespace-nowrap"
        >
          Take Emergency Visit Now
        </button>
      </div>

      {/* HERO SECTION: TODAY'S OVERVIEW + PROFILE & AVAILABILITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* HERO CARD (8 Cols) */}
        <div className="lg:col-span-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-blue-500/10 relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-extrabold text-blue-100 bg-white/15 px-3 py-1 rounded-full backdrop-blur-md uppercase tracking-wider">
                  Sunday • 13 Sept • Online
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

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => router.push("/doctors/telehealth/live")}
                className="px-6 py-3 bg-white hover:bg-slate-100 text-blue-700 font-black text-xs rounded-2xl transition shadow-lg cursor-pointer flex items-center gap-2"
              >
                <Video size={16} />
                <span>Start Consultation</span>
              </button>

              <button
                onClick={() => router.push("/doctors/schedule")}
                className="px-5 py-3 bg-white/15 hover:bg-white/25 border border-white/25 text-white font-black text-xs rounded-2xl transition cursor-pointer flex items-center gap-2 backdrop-blur-md"
              >
                <Calendar size={16} />
                <span>View Full Schedule</span>
              </button>
            </div>
          </div>
        </div>

        {/* PROFILE CARD (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
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
                />
              </div>

              <div className="space-y-1 min-w-0">
                <h3 className="font-black text-slate-900 text-base leading-tight truncate">{doctor.fullName}</h3>
                <p className="text-xs font-bold text-slate-500 truncate">{doctor.specialty}</p>
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md w-max border border-blue-100">
                  <ShieldCheck size={13} /> {doctor.licenseStatus}
                </div>
              </div>
            </div>

            {/* Smooth Availability Toggle */}
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

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => router.push("/doctors/profile/edit")}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Settings size={15} /> Edit Profile & Schedule
            </button>
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS HUB */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => router.push("/doctors/telehealth/live")}
          className="p-4 bg-white hover:bg-blue-50/50 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition text-left group flex items-center gap-3.5 cursor-pointer"
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
          onClick={() => router.push("/doctors/patients/new")}
          className="p-4 bg-white hover:bg-indigo-50/50 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition text-left group flex items-center gap-3.5 cursor-pointer"
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
          onClick={() => router.push("/doctors/prescriptions/new")}
          className="p-4 bg-white hover:bg-purple-50/50 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition text-left group flex items-center gap-3.5 cursor-pointer"
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
          onClick={() => router.push("/doctors/labs")}
          className="p-4 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition text-left group flex items-center gap-3.5 cursor-pointer"
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

      {/* TODAY'S SCHEDULE TABLE */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">Today's Appointment Schedule</h3>
            <p className="text-xs font-semibold text-slate-400">Scheduled consultations and physical checkups for Sept 13, 2026</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/doctors/appointments/new")}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle size={14} /> Book Appointment
            </button>
          </div>
        </div>

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
                  <td className="py-4 px-2 whitespace-nowrap">
                    <div className="flex items-center gap-2 font-black text-slate-900">
                      <Clock size={14} className="text-blue-600" />
                      <span>{item.time}</span>
                    </div>
                  </td>

                  <td className="py-4 px-2 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img src={item.avatar} alt={item.patientName} className="w-9 h-9 rounded-xl object-cover" />
                      <div>
                        <strong className="block text-slate-900 font-black">{item.patientName}</strong>
                        <span className="text-[10px] text-slate-400 font-bold">{item.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-2 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {item.type}
                    </span>
                  </td>

                  <td className="py-4 px-2 max-w-xs truncate font-medium text-slate-800">
                    {item.condition}
                  </td>

                  <td className="py-4 px-2 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck size={12} /> {item.shaStatus}
                    </span>
                  </td>

                  <td className="py-4 px-2 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => router.push(`/doctors/telehealth/room?patientId=${item.id}`)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition cursor-pointer"
                      >
                        Join
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI CONSULTATION ASSISTANT MODAL */}
      {aiNoteActive && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-100">
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
                  Click the microphone button to dictate consultation notes or prescriptions.
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
              </div>

              <textarea
                value={aiNotesText}
                onChange={(e) => setAiNotesText(e.target.value)}
                placeholder="Dictated notes will appear here..."
                rows={4}
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setAiNoteActive(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}