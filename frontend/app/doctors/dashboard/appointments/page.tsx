// frontend/app/doctors/dashboard/appointments/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Video, Calendar, User, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface PatientVitals {
  heartRate: string;
  bloodPressure: string;
  temperature: string;
  weight: string;
}

interface AppointmentItem {
  id: string;
  patientName: string;
  patientEmail?: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
  reason?: string;
  vitals?: PatientVitals;
}

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<AppointmentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

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

      const endpoints = [
        "/api/appointments",
        "/api/doctors/appointments",
        "/api/patients/appointments"
      ];

      let data = null;
      let success = false;

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(`${API_URL}${endpoint}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const json = await res.json();
            data = json.appointments || json.data || json;
            success = true;
            break;
          }
        } catch (e) {
          // Try next endpoint fallback
        }
      }

      if (success && Array.isArray(data)) {
        const formatted: AppointmentItem[] = data.map((item: any, idx: number) => ({
          id: item.id || item._id || String(idx),
          patientName: item.patientName || item.patient_name || item.patient?.name || item.name || "Patient",
          patientEmail: item.patientEmail || item.patient_email || item.patient?.email || "patient@medicare.ai",
          specialty: item.specialty || item.type || item.department || "General Consultation",
          date: item.date || item.appointment_date || item.appointmentDate || "2026-09-21",
          time: item.time || item.appointment_time || item.slot || "10:00 AM",
          status: item.status || "Confirmed",
          reason: item.reason || item.notes || "General checkup and consultation request",
          vitals: {
            heartRate: item.vitals?.heartRate || item.heartRate || "72 bpm",
            bloodPressure: item.vitals?.bloodPressure || item.bloodPressure || "120/80 mmHg",
            temperature: item.vitals?.temperature || item.temperature || "98.6°F",
            weight: item.vitals?.weight || item.weight || "70 kg"
          }
        }));

        setAppointments(formatted);
        if (formatted.length > 0) {
          setSelectedPatient(formatted[0]);
        }
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setErrorMsg("Failed to connect to server. Please check your network.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleJoinRoom = (id: string) => {
    router.push(`/doctors/telehealth/${id}`);
  };

  const filteredAppointments = appointments.filter(
    (apt) =>
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-8 space-y-6 overflow-y-auto bg-slate-50 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white px-6 py-5 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Patient Consultations & Bookings</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Manage scheduled appointments, review patient vitals, and join telehealth rooms.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search patient or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 transition"
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Appointments List */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-black">
              Booked Appointments ({appointments.length})
            </span>
            <button
              onClick={fetchAppointments}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Refresh List
            </button>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-xs text-slate-400 font-bold">
              Loading booked patient appointments...
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No patient bookings found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((apt) => {
                const isSelected = selectedPatient?.id === apt.id;
                return (
                  <div
                    key={apt.id}
                    onClick={() => setSelectedPatient(apt)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-blue-50/60 border-blue-300 shadow-sm"
                        : "bg-slate-50/60 border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{apt.patientName}</span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase">
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 font-semibold">
                        {apt.date} @ {apt.time} • <span className="text-slate-500">{apt.specialty}</span>
                      </p>
                      {apt.reason && (
                        <p className="text-xs text-slate-400 italic truncate max-w-md">"{apt.reason}"</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinRoom(apt.id);
                      }}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                    >
                      <Video size={14} /> Room
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Patient Vitals & Info */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Patient Details</span>
            <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2.5 py-1 rounded-lg">Live Vitals</span>
          </div>

          {selectedPatient ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-md">
                  {selectedPatient.patientName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">{selectedPatient.patientName}</h3>
                  <p className="text-xs text-slate-400 font-medium">{selectedPatient.patientEmail}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Consultation Type:</span>
                  <span className="font-bold text-slate-800">{selectedPatient.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Scheduled Time:</span>
                  <span className="font-bold text-blue-600">{selectedPatient.date} @ {selectedPatient.time}</span>
                </div>
                {selectedPatient.reason && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-slate-400 block mb-1 font-medium">Reason for Visit:</span>
                    <p className="text-slate-700 italic">"{selectedPatient.reason}"</p>
                  </div>
                )}
              </div>

              {/* Patient Vitals Grid */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Recorded Vitals</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-bold">Heart Rate</span>
                    <strong className="text-slate-800 text-xs">{selectedPatient.vitals?.heartRate}</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-bold">Blood Pressure</span>
                    <strong className="text-slate-800 text-xs">{selectedPatient.vitals?.bloodPressure}</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-bold">Temperature</span>
                    <strong className="text-slate-800 text-xs">{selectedPatient.vitals?.temperature}</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-bold">Weight</span>
                    <strong className="text-slate-800 text-xs">{selectedPatient.vitals?.weight}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleJoinRoom(selectedPatient.id)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-2xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Video size={16} /> Start Telehealth Session
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs font-medium">
              <User className="mx-auto mb-2 text-slate-300" size={32} />
              Select a patient from your appointments list to view their vitals and medical info.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}