"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  FileText, 
  Search, 
  Video, 
  Calendar, 
  Plus,
  LogOut,
  Phone,
  RefreshCw,
  X,
  Pill
} from "lucide-react";

interface Appointment {
  id: number;
  patient_name: string;
  phone: string;
  appointment_date?: string;
  appointment_time: string;
  status: string;
  reason: string;
}

interface Prescription {
  id: number;
  doctor_id: number | null;
  patient_name: string;
  medication_details: string;
  status: string;
  created_at: string;
}

interface UserSession {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<UserSession | null>(null);
  const [providerStatus, setProviderStatus] = useState("Available");
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submittingRx, setSubmittingRx] = useState(false);
  
  // Modal states
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxPatientName, setRxPatientName] = useState("");
  const [rxNotes, setRxNotes] = useState("");

  const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL || "https://medicareai-1.onrender.com";

  // 1. Initial Load & Auth Check
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as UserSession;
      setDoctor(parsedUser);
      fetchAppointments(token);
      fetchPrescriptions(token);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  // 2. Fetch Appointments from Backend API
  const fetchAppointments = async (authToken?: string) => {
    const token = authToken || localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_BASE}/api/appointments/doctor`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
        setErrorMsg("");
      } else {
        setErrorMsg("Failed to load clinical schedule.");
      }
    } catch {
      setErrorMsg("Unable to connect to backend service.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Prescriptions from Backend API (Strict Auth Header)
  const fetchPrescriptions = async (authToken?: string) => {
    const token = authToken || localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${BACKEND_BASE}/api/doctor/prescriptions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPrescriptions(Array.isArray(data) ? data : []);
      } else {
        console.error("Prescriptions fetch error:", res.status);
      }
    } catch (err) {
      console.error("Failed to load prescriptions:", err);
    }
  };

  // 4. Update Provider Availability Status
  const handleStatusChange = async (status: string) => {
    setProviderStatus(status);
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`${BACKEND_BASE}/api/doctor/status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token?.trim() || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        console.log(`Status updated successfully to: ${status}`);
      } else {
        const errorText = await res.text();
        console.warn("Backend status update failed:", errorText);
      }
    } catch (err) {
      console.error("Backend status update network error:", err);
    }
  };

  // 5. Quick Action Route Handlers
  const handleStartQuickConsult = () => {
    router.push("/telehealth/quick-consult");
  };

  const handleIssuePrescription = async () => {
    if (!rxPatientName.trim() || !rxNotes.trim()) {
      alert("Please fill in both Patient Name and Medication details.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired. Please log in again.");
      router.replace("/login");
      return;
    }

    setSubmittingRx(true);
    try {
      const res = await fetch(`${BACKEND_BASE}/api/doctor/prescriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify({
          doctor_id: doctor?.id ? Number(doctor.id) : null,
          patient_name: rxPatientName.trim(),
          medication_details: rxNotes.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Prescription submitted successfully!");
        setShowRxModal(false);
        setRxPatientName("");
        setRxNotes("");
        fetchPrescriptions(token);
      } else {
        alert(`Server Error (${res.status}): ${data.error || "Could not save prescription"}`);
      }
    } catch (err) {
      console.error("Error submitting prescription:", err);
      alert("Network error: Unable to reach the backend server.");
    } finally {
      setSubmittingRx(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/login");
  };

  const formatAppointmentTime = (dateStr?: string, timeStr?: string) => {
    if (!timeStr && !dateStr) return "Scheduled";
    try {
      if (dateStr && timeStr) {
        const fullDate = new Date(`${dateStr.split("T")[0]}T${timeStr}`);
        if (!isNaN(fullDate.getTime())) {
          return fullDate.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
        }
      }
      const rawDate = new Date(timeStr || dateStr || "");
      if (!isNaN(rawDate.getTime())) {
        return rawDate.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
      }
      return `${dateStr ? dateStr.split("T")[0] : ""} ${timeStr || ""}`.trim();
    } catch {
      return timeStr || dateStr || "Scheduled";
    }
  };

  // 6. Dynamic Calculations
  const totalCount = appointments.length;
  const inQueueCount = appointments.filter(
    (a) => a.status?.toLowerCase() === "scheduled" || a.status?.toLowerCase() === "pending"
  ).length;
  const completedCount = appointments.filter(
    (a) => a.status?.toLowerCase() === "completed"
  ).length;

  // Search filter
  const filteredAppointments = appointments.filter((apt) => {
    const query = searchQuery.toLowerCase();
    return (
      apt.patient_name?.toLowerCase().includes(query) ||
      apt.phone?.toLowerCase().includes(query) ||
      apt.reason?.toLowerCase().includes(query)
    );
  });

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const query = searchQuery.toLowerCase();
    return (
      rx.patient_name?.toLowerCase().includes(query) ||
      rx.medication_details?.toLowerCase().includes(query)
    );
  });

  const formatDoctorName = (name?: string) => {
    if (!name) return "Provider";
    return name.toLowerCase().startsWith("dr.") ? name : `Dr. ${name}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b14]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-4 md:p-8 space-y-6">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome, {formatDoctorName(doctor?.name)}
          </h1>
          <p className="text-sm text-slate-400">Provider Control Center Workspace</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-medium">
            {["Available", "In Visit", "On Break"].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  providerStatus === status
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-900/50 text-slate-400 hover:text-red-400 transition-all text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg"
          >
            <LogOut className="w-4 h-4" /> Exit Panel
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/30 text-red-400 rounded-xl text-sm font-semibold border border-red-900/40 flex justify-between items-center">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => fetchAppointments()} className="underline text-xs flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Appointments</p>
            <p className="text-xl font-semibold text-white">{totalCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">In Queue</p>
            <p className="text-xl font-semibold text-white">{inQueueCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Completed</p>
            <p className="text-xl font-semibold text-white">{completedCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Prescriptions</p>
            <p className="text-xl font-semibold text-white">{prescriptions.length}</p>
          </div>
        </div>
      </div>

      {/* SEARCH BAR & ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search patient by name, reason, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setShowRxModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" /> New Prescription
          </button>
          <button 
            onClick={handleStartQuickConsult}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <Video className="w-4 h-4" /> Start Quick Consult
          </button>
        </div>
      </div>

      {/* INCOMING PATIENT SCHEDULE TABLE */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Incoming Patient Schedule ({filteredAppointments.length})</span>
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-500 mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-200">NO PENDING CHECK-INS</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              {searchQuery ? "No patients found matching your search." : "Your confirmed virtual clinical queues will appear here in real-time."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-bold tracking-wider bg-slate-950/40">
                  <th className="p-4">Patient Profile</th>
                  <th className="p-4">Time Window</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{apt.patient_name}</div>
                      <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {apt.phone || "N/A"}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 font-medium">
                      {formatAppointmentTime(apt.appointment_date, apt.appointment_time)}
                    </td>
                    <td className="p-4 text-slate-400 max-w-xs truncate">
                      {apt.reason || "General Consultation"}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                        apt.status?.toLowerCase() === "confirmed" || apt.status?.toLowerCase() === "completed"
                          ? "bg-green-950/40 text-green-400 border border-green-900/40"
                          : "bg-amber-950/40 text-amber-400 border border-amber-900/40"
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {apt.status || "Scheduled"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => router.push(`/telehealth/${apt.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/50 text-purple-200 rounded-lg text-xs font-semibold transition"
                      >
                        <Video className="w-3.5 h-3.5 text-purple-400" />
                        Join Call
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ISSUED PRESCRIPTIONS & CLINICAL NOTES SECTION */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs uppercase tracking-wider">
            <Pill className="w-4 h-4" />
            <span>Issued Prescriptions & Clinical Notes ({filteredPrescriptions.length})</span>
          </div>
        </div>

        {filteredPrescriptions.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-500 mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-200">NO ISSUED NOTES YET</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Submitted prescriptions and clinical notes will display here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-bold tracking-wider bg-slate-950/40">
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Medication & Dosage Details</th>
                  <th className="p-4">Date Issued</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredPrescriptions.map((rx) => (
                  <tr key={rx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-bold text-white">{rx.patient_name}</td>
                    <td className="p-4 text-slate-300 max-w-md">{rx.medication_details}</td>
                    <td className="p-4 text-slate-400 text-xs">
                      {new Date(rx.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-purple-950/40 text-purple-400 border border-purple-900/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {rx.status || "Issued"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NEW PRESCRIPTION MODAL */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-xl p-6 space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <Plus className="w-5 h-5 text-blue-500" /> Issue Prescription
              </h3>
              <button 
                onClick={() => setShowRxModal(false)}
                className="text-slate-400 hover:text-white"
                disabled={submittingRx}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  placeholder="Enter patient full name..."
                  value={rxPatientName}
                  onChange={(e) => setRxPatientName(e.target.value)}
                  disabled={submittingRx}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Medication & Dosage Details
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Amoxicillin 500mg - 1 capsule every 8 hours for 7 days"
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  disabled={submittingRx}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRxModal(false)}
                disabled={submittingRx}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleIssuePrescription}
                disabled={submittingRx}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
              >
                {submittingRx ? "Saving..." : "Issue Rx Order"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}