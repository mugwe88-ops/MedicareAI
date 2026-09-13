"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar as CalendarIcon, 
  Video, 
  Plus, 
  Clock, 
  ArrowLeft, 
  LogOut, 
  MapPin, 
  Search, 
  Sparkles, 
  FileText, 
  Upload, 
  Mic, 
  UserCheck, 
  CheckCircle2, 
  PhoneCall,
  X
} from "lucide-react";

interface Appointment {
  id: number;
  doctor_name?: string;
  department?: string;
  appointment_date: string;
  appointment_time: string;
  reason?: string;
  status: string;
  location_type?: "Telehealth" | "In-Person";
  meeting_url?: string;
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeView, setActiveView] = useState<"list" | "week" | "month">("list");
  const [activePrepModal, setActivePrepModal] = useState<string | null>(null);
  const [aiModalContent, setAiModalContent] = useState<string | null>(null);
  const router = useRouter();

  const fetchAppointments = useCallback(async (token: string) => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://medicareai-1.onrender.com";

      const aptRes = await fetch(`${backendUrl}/api/appointments/patient`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (aptRes.ok) {
        const aptData = await aptRes.json();
        const list = Array.isArray(aptData)
          ? aptData
          : aptData.appointments || aptData.data || [];
        
        const enrichedList = list.map((apt: any) => ({
          ...apt,
          location_type: apt.location_type || (apt.reason?.toLowerCase().includes("virtual") ? "Telehealth" : "In-Person"),
          meeting_url: apt.meeting_url || "/patient/dashboard/telehealth/room-1"
        }));
        setAppointments(enrichedList);
      }
    } catch (err) {
      console.error("Failed loading appointments", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchAppointments(token);
  }, [router, fetchAppointments]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date(dateStr);
  };

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const upcoming = appointments.filter(a => a.status?.toLowerCase() === "confirmed" || a.status?.toLowerCase() === "pending").length;
    const completed = appointments.filter(a => a.status?.toLowerCase() === "completed").length;
    const telehealth = appointments.filter(a => a.location_type === "Telehealth").length;
    const month = appointments.filter(a => {
      if (!a.appointment_date) return false;
      const d = parseLocalDate(a.appointment_date);
      return d ? d.getMonth() === currentMonth && d.getFullYear() === currentYear : false;
    }).length;

    return { upcoming, completed, telehealth, month };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesSearch = 
        (apt.doctor_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (apt.department || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (apt.reason || "").toLowerCase().includes(searchQuery.toLowerCase());

      const status = (apt.status || "pending").toLowerCase();
      const loc = apt.location_type || "In-Person";

      let matchesFilter = true;
      if (activeFilter === "Upcoming") matchesFilter = status === "confirmed" || status === "pending";
      else if (activeFilter === "Completed") matchesFilter = status === "completed";
      else if (activeFilter === "Cancelled") matchesFilter = status === "cancelled" || status === "rejected";
      else if (activeFilter === "Telehealth") matchesFilter = loc === "Telehealth";
      else if (activeFilter === "In-Person") matchesFilter = loc === "In-Person";

      return matchesSearch && matchesFilter;
    });
  }, [appointments, searchQuery, activeFilter]);

  const handleAiAction = (actionType: string) => {
    if (actionType === "summarize") {
      setAiModalContent("AI Summary: Based on your recent logs, you reported persistent mild fatigue and headaches over 3 days. Recommendation: Mention duration and sleep habits during your consult.");
    } else if (actionType === "questions") {
      setAiModalContent("Generated Questions for Doctor:\n1. Are my symptoms related to recent diet changes?\n2. Should we consider follow-up blood tests?\n3. Do I need to adjust current prescription timing?");
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-8 space-y-6 overflow-y-auto bg-slate-50 w-full relative min-h-screen">
      {/* Navigation Toolbar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/patient/dashboard")}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Appointments</h2>
          <p className="text-slate-500 font-medium text-xs mt-1">Manage and track your upcoming doctor consultations and telehealth sessions.</p>
        </div>
        <button
          onClick={() => router.push("/patient/dashboard/appointments/book")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer self-start"
        >
          <Plus size={16} /> Book New Appointment
        </button>
      </div>

      {/* Quick Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Upcoming</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.upcoming}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600">
            <Clock size={20} />
          </div>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">This Month</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.month}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600">
            <CalendarIcon size={20} />
          </div>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.completed}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Telehealth</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.telehealth}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-50 text-purple-600">
            <Video size={20} />
          </div>
        </div>
      </div>

      {/* Preparation & AI Assistant Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black text-slate-900 mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Prepare for your upcoming visit
            </h4>
            <p className="text-xs text-slate-500 font-medium mb-4">Complete these checklist items to ensure a smooth consultation.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button 
              onClick={() => setActivePrepModal("Bring Identification Card")}
              className="p-3.5 bg-white hover:bg-slate-50 rounded-2xl text-left border border-slate-200/60 shadow-xs transition cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-blue-600 mb-1.5" />
              <p className="text-xs font-bold text-slate-800">Bring ID</p>
              <p className="text-[10px] text-slate-400 font-medium">Verify identity</p>
            </button>
            <button 
              onClick={() => setActivePrepModal("Upload Insurance Policy Document")}
              className="p-3.5 bg-white hover:bg-slate-50 rounded-2xl text-left border border-slate-200/60 shadow-xs transition cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-600 mb-1.5" />
              <p className="text-xs font-bold text-slate-800">Upload Policy</p>
              <p className="text-[10px] text-slate-400 font-medium">Insurance card</p>
            </button>
            <button 
              onClick={() => setActivePrepModal("Add Medical Symptoms Log")}
              className="p-3.5 bg-white hover:bg-slate-50 rounded-2xl text-left border border-slate-200/60 shadow-xs transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-600 mb-1.5" />
              <p className="text-xs font-bold text-slate-800">Add Symptoms</p>
              <p className="text-[10px] text-slate-400 font-medium">Update log</p>
            </button>
            <button 
              onClick={() => setActivePrepModal("Hardware Test for Microphone & Camera")}
              className="p-3.5 bg-white hover:bg-slate-50 rounded-2xl text-left border border-slate-200/60 shadow-xs transition cursor-pointer"
            >
              <Mic className="w-4 h-4 text-purple-600 mb-1.5" />
              <p className="text-xs font-bold text-slate-800">Test Hardware</p>
              <p className="text-[10px] text-slate-400 font-medium">Mic & Video check</p>
            </button>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-blue-400 text-xs font-extrabold tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" /> AI Health Assistant
            </div>
            <h4 className="text-base font-bold text-white mb-1">Need consultation help?</h4>
            <p className="text-xs text-slate-400">Let AI prepare your notes and doctor questions.</p>
          </div>
          <div className="space-y-2 mt-4">
            <button 
              onClick={() => handleAiAction("summarize")} 
              className="w-full text-left text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-between"
            >
              <span>✨ Summarize my symptoms</span>
              <span className="text-[10px] text-blue-400 font-mono">RUN</span>
            </button>
            <button 
              onClick={() => handleAiAction("questions")} 
              className="w-full text-left text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-between"
            >
              <span>❓ Generate questions for doctor</span>
              <span className="text-[10px] text-blue-400 font-mono">RUN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctor name, specialty, reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto max-w-full">
          {["All", "Upcoming", "Completed", "Cancelled", "Telehealth", "In-Person"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-2 text-xs font-extrabold rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeFilter === filter
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-2xl self-end md:self-auto">
          {(["list", "week", "month"] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-3.5 py-2 text-xs font-extrabold capitalize rounded-xl transition cursor-pointer ${
                activeView === view
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 font-bold text-xs bg-white rounded-3xl border border-slate-100 shadow-sm">
          Loading appointments...
        </div>
      ) : activeView !== "list" ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 capitalize">{activeView} Schedule Overview</h3>
            <p className="text-xs text-slate-500">
              Viewing {filteredAppointments.length} matching appointment(s) mapped across your schedule calendar.
            </p>
            <div className="grid grid-cols-7 gap-2 pt-4 text-center border-t border-slate-100 text-xs font-bold text-slate-400 uppercase">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs py-6 bg-slate-50/50 rounded-2xl border border-slate-100 font-medium text-slate-600">
              {Array.from({ length: 28 }).map((_, i) => (
                <div key={i} className={`p-2.5 rounded-xl border ${i === 14 ? "bg-blue-600 text-white font-bold border-blue-600" : "bg-white border-slate-200/60"}`}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm my-2">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-xs">
            <CalendarIcon className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-1">You're all caught up!</h3>
          <p className="text-slate-500 max-w-sm text-xs font-medium mb-6">
            No upcoming appointments found matching your filters. Ready to schedule your next consultation?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => router.push("/patient/dashboard/appointments/book")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Book Appointment
            </button>
            <button
              onClick={() => router.push("/patient/dashboard/doctors")}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-6 py-3 rounded-2xl border border-slate-200 transition cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-400" /> Find a Doctor
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppointments.map((apt) => {
            const isVideo = apt.location_type === "Telehealth";
            const statusLower = (apt.status || "pending").toLowerCase();
            const parsedDate = parseLocalDate(apt.appointment_date);

            return (
              <div key={apt.id} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 font-black text-base shrink-0">
                      {apt.doctor_name ? apt.doctor_name.replace("Dr. ", "").charAt(0) : "D"}
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">{apt.department || "General Medicine"}</span>
                      <h4 className="text-base font-black text-slate-900 leading-snug">{apt.doctor_name || "General Practitioner"}</h4>
                      <div className="mt-1">
                        {statusLower === "confirmed" && <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase">Confirmed</span>}
                        {statusLower === "completed" && <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase">Completed</span>}
                        {(statusLower === "cancelled" || statusLower === "rejected") && <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 rounded-full text-[10px] font-black uppercase">{statusLower}</span>}
                        {statusLower === "pending" && <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase">Pending</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-500 font-medium space-y-1 shrink-0">
                    <div className="flex items-center justify-end gap-1 font-bold text-slate-800">
                      <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {parsedDate ? parsedDate.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        }) : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.appointment_time}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[10px] font-bold">
                      {isVideo ? <Video className="w-3 h-3 text-purple-600" /> : <MapPin className="w-3 h-3 text-slate-400" />}
                      <span className={isVideo ? "text-purple-600" : "text-slate-500"}>{apt.location_type}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Reason for visit</p>
                  <p className="text-xs font-semibold text-slate-700 italic">"{apt.reason || "General Checkup"}"</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => alert(`Cancelling appointment ID ${apt.id}`)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => router.push(`/patient/dashboard/appointments/book?reschedule=${apt.id}`)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-3 py-2 rounded-xl transition cursor-pointer"
                  >
                    Reschedule
                  </button>
                  {isVideo && (
                    <button
                      onClick={() => router.push(apt.meeting_url || "/patient/dashboard/telehealth/room-1")}
                      className="text-xs font-black bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" /> Join Video
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Menu */}
      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-2 group z-40">
        <div className="hidden group-hover:flex flex-col gap-2 transition-all duration-200 transform translate-y-1">
          <button 
            onClick={() => router.push("/patient/dashboard/telehealth/emergency")}
            className="flex items-center gap-2.5 bg-white text-slate-800 text-xs font-extrabold px-4 py-3 rounded-2xl shadow-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition"
          >
            <PhoneCall className="w-4 h-4 text-rose-500" /> Emergency Consult
          </button>
          <button 
            onClick={() => router.push("/patient/dashboard/clinics")}
            className="flex items-center gap-2.5 bg-white text-slate-800 text-xs font-extrabold px-4 py-3 rounded-2xl shadow-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition"
          >
            <MapPin className="w-4 h-4 text-emerald-500" /> Find Nearby Clinic
          </button>
          <button 
            onClick={() => router.push("/patient/dashboard/appointments/book")}
            className="flex items-center gap-2.5 bg-white text-slate-800 text-xs font-extrabold px-4 py-3 rounded-2xl shadow-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition"
          >
            <CalendarIcon className="w-4 h-4 text-blue-500" /> Schedule Visit
          </button>
        </div>
        <button className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform duration-200 group-hover:rotate-45 cursor-pointer">
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Preparation Modal */}
      {activePrepModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-900 text-sm">Action Requirement</h3>
              <button onClick={() => setActivePrepModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs font-semibold text-slate-600">{activePrepModal}</p>
            <button 
              onClick={() => setActivePrepModal(null)} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
            >
              Complete Task
            </button>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {aiModalContent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase">
                <Sparkles size={16} /> AI Assistant Insights
              </div>
              <button onClick={() => setAiModalContent(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs font-medium text-slate-700 whitespace-pre-line leading-relaxed">{aiModalContent}</p>
            <button 
              onClick={() => setAiModalContent(null)} 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}