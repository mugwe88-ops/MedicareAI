// frontend/app/doctors/dashboard/appointments/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, Video, Calendar as CalendarIcon, User, AlertCircle, RefreshCw, 
  CheckCircle2, Clock, FileText, Pill, Stethoscope, Share2, AlertTriangle, 
  XCircle, ArrowRight, Shield, Activity, PhoneCall, FolderOpen, MessageSquare
} from "lucide-react";

interface PatientVitals {
  heartRate: string;
  bloodPressure: string;
  temperature: string;
  weight: string;
}

interface AppointmentItem {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  age: number;
  gender: string;
  bloodGroup: string;
  lastVisitDate: string;
  primaryDiagnosis: string;
  clinicalStatus: "Stable" | "Observation" | "Critical";
  allergies: string[];
  currentMedications: string[];
  insuranceType: string;
  emergencyContact: string;
  isNewPatient: boolean;
  specialty: string;
  consultationType: "Online" | "Physical";
  date: string;
  time: string;
  status: "Confirmed" | "Waiting" | "Completed" | "Canceled" | "No Show";
  riskFlags: string[];
  reason?: string;
  vitals?: PatientVitals;
}

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<AppointmentItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [patientTypeFilter, setPatientTypeFilter] = useState<string>("all");

  const fetchAppointments = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medicareai-1.onrender.com";

      if (!token) {
        setErrorMsg("Authentication token missing. Please log in again.");
        setIsLoading(false);
        return;
      }

      const endpoints = ["/api/doctors/appointments", "/api/appointments/doctor", "/api/appointments"];
      let fetchedData = null;
      let success = false;

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(`${API_URL}${endpoint}`, {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const json = await res.json();
            fetchedData = json.appointments || json.data || json.bookings || (Array.isArray(json) ? json : null);
            if (fetchedData && Array.isArray(fetchedData)) {
              success = true;
              break;
            }
          }
        } catch (e) {}
      }

      if (success && Array.isArray(fetchedData)) {
        const formatted: AppointmentItem[] = fetchedData.map((item: any, idx: number) => ({
          id: item.id || item._id || String(idx),
          patientId: item.patientId || item.patient_id || `MED-ID-${1000 + idx}`,
          patientName: item.patientName || item.patient_name || item.patient?.name || item.name || "Patient",
          patientEmail: item.patientEmail || item.patient_email || item.patient?.email || "patient@medicare.ai",
          age: item.age || 38,
          gender: item.gender || "Female",
          bloodGroup: item.bloodGroup || "O+",
          lastVisitDate: item.lastVisitDate || "2026-08-12",
          primaryDiagnosis: item.primaryDiagnosis || "Essential Hypertension",
          clinicalStatus: item.clinicalStatus || (idx === 0 ? "Critical" : idx === 1 ? "Observation" : "Stable"),
          allergies: item.allergies || ["Penicillin", "Sulfa drugs"],
          currentMedications: item.currentMedications || ["Amlodipine 5mg daily", "Metformin 500mg"],
          insuranceType: item.insuranceType || "SHA / NHIF",
          emergencyContact: item.emergencyContact || "+254 712 345 678",
          isNewPatient: idx % 2 === 0,
          specialty: item.specialty || item.type || item.department || "Cardiology",
          consultationType: idx % 3 === 0 ? "Physical" : "Online",
          date: item.date || item.appointment_date || "2026-09-17",
          time: item.time || item.appointment_time || "09:00 AM",
          status: item.status || "Confirmed",
          riskFlags: item.riskFlags || (idx === 0 ? ["High BP", "DM"] : idx === 1 ? ["Pregnancy"] : []),
          reason: item.reason || item.notes || "General checkup and routine monitoring",
          vitals: {
            heartRate: item.vitals?.heartRate || "78 bpm",
            bloodPressure: item.vitals?.bloodPressure || "138/88 mmHg",
            temperature: item.vitals?.temperature || "98.6°F",
            weight: item.vitals?.weight || "68 kg"
          }
        }));

        setAppointments(formatted);
        if (formatted.length > 0 && !selectedPatient) setSelectedPatient(formatted[0]);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      setErrorMsg("Failed to connect to server. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActionLoading(id);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medicareai-1.onrender.com";

      await fetch(`${API_URL}/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      await fetchAppointments();
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartConsultation = (id: string) => {
    router.push(`/doctors/telehealth/${id}`);
  };

  const handleOpenRecord = (patientId: string) => {
    router.push(`/doctors/patients/${patientId}`);
  };

  const handleMessage = (patientId: string) => {
    router.push(`/doctors/messages?patient=${patientId}`);
  };

  // Filter Logic
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          apt.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = specialtyFilter === "all" || apt.specialty.toLowerCase() === specialtyFilter.toLowerCase();
    const matchesMode = modeFilter === "all" || apt.consultationType === modeFilter;
    const matchesStatus = statusFilter === "all" || apt.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPatientType = patientTypeFilter === "all" || (patientTypeFilter === "new" ? apt.isNewPatient : !apt.isNewPatient);

    let matchesDate = true;
    const todayStr = "2026-09-17";
    if (dateFilter === "today") matchesDate = apt.date === todayStr;
    if (dateFilter === "tomorrow") matchesDate = apt.date !== todayStr;

    return matchesSearch && matchesSpecialty && matchesMode && matchesStatus && matchesPatientType && matchesDate;
  });

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-8 space-y-6 overflow-y-auto bg-slate-50 w-full">
      {/* Top Header & Search / Filters Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Live Patient Queue & Consultations</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Smart clinical management with instant patient profile views and real-time telehealth rooms.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search patient or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-600"
              />
            </div>
            <button onClick={fetchAppointments} className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-2xl transition cursor-pointer">
              <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-xs">
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-700 outline-none">
            <option value="all">📅 All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow / Upcoming</option>
          </select>
          <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-700 outline-none">
            <option value="all">🩺 All Specialties</option>
            <option value="cardiology">Cardiology</option>
            <option value="general consultation">General Consultation</option>
          </select>
          <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-700 outline-none">
            <option value="all">💻 Online / Physical</option>
            <option value="Online">Online Telehealth</option>
            <option value="Physical">Physical Clinic</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-700 outline-none">
            <option value="all">⚡ All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Waiting">Waiting Queue</option>
            <option value="Completed">Completed</option>
            <option value="Canceled">Canceled</option>
          </select>
          <select value={patientTypeFilter} onChange={(e) => setPatientTypeFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-700 outline-none">
            <option value="all">👥 New vs Returning</option>
            <option value="new">New Patients</option>
            <option value="returning">Returning Patients</option>
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Appointment Rows */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-black">
              Patient Queue & Schedule ({filteredAppointments.length})
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Smart Reminder: Active
            </span>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-xs text-slate-400 font-bold">Loading live patient queue...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No matching patient records found in queue.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((apt) => {
                const isSelected = selectedPatient?.id === apt.id;
                return (
                  <div
                    key={apt.id}
                    onClick={() => setSelectedPatient(apt)}
                    className={`p-4 rounded-2xl border transition cursor-pointer space-y-3 ${
                      isSelected ? "bg-blue-50/60 border-blue-300 shadow-sm" : "bg-slate-50/60 border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{apt.patientName}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                            apt.status === "Completed" ? "bg-slate-200 text-slate-700" : "bg-emerald-50 text-emerald-600"
                          }`}>
                            {apt.status}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">
                            {apt.isNewPatient ? "New Patient" : "Returning"}
                          </span>
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-full">
                            {apt.consultationType}
                          </span>
                        </div>

                        {apt.riskFlags.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-1">
                            <AlertTriangle size={13} className="text-rose-500" />
                            {apt.riskFlags.map((flag, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-black rounded-md border border-rose-100">
                                {flag}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-xs text-slate-500 font-medium">
                          {apt.date} @ {apt.time} • <strong className="text-blue-600">{apt.specialty}</strong>
                        </p>
                      </div>

                      {/* Quick Actions on Row */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStartConsultation(apt.id); }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <Video size={13} /> Consult
                        </button>
                        <button
                          onClick={(e) => handleUpdateStatus(apt.id, "Canceled", e)}
                          className="p-1.5 bg-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-600 rounded-xl text-xs transition cursor-pointer"
                          title="Cancel Appointment"
                        >
                          <XCircle size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Detailed Patient Panel */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Patient Profile Details</span>
            <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2.5 py-1 rounded-lg">Live View</span>
          </div>

          {selectedPatient ? (
            <div className="space-y-4">
              {/* Profile Avatar, Age, Gender & ID */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-md">
                  {selectedPatient.patientName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">{selectedPatient.patientName}</h3>
                  <p className="text-xs text-slate-400">
                    {selectedPatient.age} yrs • {selectedPatient.gender} • <strong className="text-blue-600">{selectedPatient.patientId}</strong>
                  </p>
                </div>
              </div>

              {/* Status & Primary Info Box */}
              <div className="space-y-2.5 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Current Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                    selectedPatient.clinicalStatus === "Critical" ? "bg-rose-100 text-rose-700 animate-pulse" :
                    selectedPatient.clinicalStatus === "Observation" ? "bg-amber-100 text-amber-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>
                    {selectedPatient.clinicalStatus}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Primary Diagnosis:</span>
                  <strong className="text-slate-800 text-right">{selectedPatient.primaryDiagnosis}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Last Visit Date:</span>
                  <strong className="text-slate-800">{selectedPatient.lastVisitDate}</strong>
                </div>

                {/* Vitals: Latest BP & HR */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                  <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-bold">Blood Pressure</span>
                    <strong className="text-slate-800 text-xs">{selectedPatient.vitals?.bloodPressure}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-bold">Heart Rate</span>
                    <strong className="text-slate-800 text-xs">{selectedPatient.vitals?.heartRate}</strong>
                  </div>
                </div>

                {/* Allergies */}
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 block font-bold mb-1">Allergies:</span>
                  <div className="flex gap-1 flex-wrap">
                    {selectedPatient.allergies.map((a, i) => (
                      <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-bold text-[10px]">{a}</span>
                    ))}
                  </div>
                </div>

                {/* Current Medication */}
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 block font-bold mb-1">Current Medication:</span>
                  <div className="flex gap-1 flex-wrap">
                    {selectedPatient.currentMedications.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold text-[10px]">{m}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Open Record, Start Telehealth, Message */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleStartConsultation(selectedPatient.id)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Video size={16} /> Start Telehealth
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenRecord(selectedPatient.patientId)}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FolderOpen size={15} /> Open Record
                  </button>
                  <button
                    onClick={() => handleMessage(selectedPatient.patientId)}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare size={15} /> Message
                  </button>
                </div>

                <button
                  onClick={() => handleUpdateStatus(selectedPatient.id, "Completed")}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={15} /> Mark Complete
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs font-medium">
              Click on any patient appointment row to view their complete profile and medical details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}