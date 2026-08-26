"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Pill, 
  Video, 
  CheckCircle, 
  X, 
  Users,
  Activity,
  Eye,
  FileSpreadsheet,
  LayoutDashboard,
  Calendar,
  Settings as SettingsIcon,
  LogOut
} from "lucide-react";

interface Appointment {
  id: number;
  patient_name: string;
  phone?: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason?: string;
  patient_id?: number;
  clinical_notes?: string;
  medical_history?: string;
}

interface Prescription {
  id: number;
  appointment_id: number;
  medication?: string;
  medication_name?: string;
  drug_name?: string;
  dosage: string;
  instructions?: string;
  created_at?: string;
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState<string>("Dr. Ivan Weru");
  const [doctorId, setDoctorId] = useState<number | null>(null);
  
  // Drill-down selected patient state
  const [activePatient, setActivePatient] = useState<Appointment | null>(null);
  const [patientPrescriptions, setPatientPrescriptions] = useState<Prescription[]>([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);

  // Modals state
  const [modalType, setModalType] = useState<"prescription" | "note" | "quickView" | "quickLab" | null>(null);
  const [quickViewPatient, setQuickViewPatient] = useState<Appointment | null>(null);
  const [quickPrescriptionApt, setQuickPrescriptionApt] = useState<Appointment | null>(null);
  const [quickLabApt, setQuickLabApt] = useState<Appointment | null>(null);

  // Form states
  const [prescriptionForm, setPrescriptionForm] = useState({
    medication: "",
    dosage: "",
    instructions: "",
  });
  const [labOrderForm, setLabOrderForm] = useState({
    test_name: "",
    notes: "",
  });
  const [clinicalNote, setClinicalNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const API_BASE = "https://medicareai-1.onrender.com";
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.name) setDoctorName(parsed.name);
        const resolvedId = parsed.id || parsed.doctor_id || parsed.userId || parsed.user_id;
        if (resolvedId) {
          setDoctorId(Number(resolvedId));
        }
      } catch (e) {
        console.error("Failed to parse local user profile", e);
      }
    }

    fetchAppointments(token);
  }, []);

  const fetchAppointments = async (authToken?: string) => {
    const token = authToken || localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/appointments/doctor`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (Array.isArray(data)) setAppointments(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptionsForAppointment = async (appointmentId: number) => {
    const token = localStorage.getItem("token");
    setLoadingPrescriptions(true);
    try {
      const res = await fetch(`${API_BASE}/api/appointments/${appointmentId}/prescriptions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPatientPrescriptions(data);
        }
      } else {
        setPatientPrescriptions([]);
      }
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setPatientPrescriptions([]);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  const handleSelectPatient = (apt: Appointment) => {
    setActivePatient(apt);
    fetchPrescriptionsForAppointment(apt.id);
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
        );
        if (activePatient && activePatient.id === id) {
          setActivePatient((prev) => prev ? { ...prev, status: newStatus } : null);
        }
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetApt = activePatient || quickPrescriptionApt;
    if (!targetApt) return;
    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        appointment_id: Number(targetApt.id),
        patient_id: targetApt.patient_id ? Number(targetApt.patient_id) : null,
        doctor_id: doctorId ? Number(doctorId) : null,
        patient_name: targetApt.patient_name || "Anonymous Patient",
        medication: prescriptionForm.medication,
        medication_name: prescriptionForm.medication,
        drug_name: prescriptionForm.medication,
        dosage: prescriptionForm.dosage,
        instructions: prescriptionForm.instructions || "",
        duration: "7 days",
      };

      const res = await fetch(`${API_BASE}/api/prescriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || `Server responded with status ${res.status}`);
      }

      setFeedbackMsg("Prescription issued successfully!");
      if (activePatient) {
        fetchPrescriptionsForAppointment(activePatient.id);
      }

      setTimeout(() => {
        setModalType(null);
        setQuickPrescriptionApt(null);
        setPrescriptionForm({ medication: "", dosage: "", instructions: "" });
        setFeedbackMsg(null);
      }, 1200);
    } catch (err: any) {
      setFeedbackMsg(err.message || "Error submitting prescription.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddLabOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLabApt) return;
    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        appointment_id: Number(quickLabApt.id),
        patient_id: quickLabApt.patient_id ? Number(quickLabApt.patient_id) : null,
        doctor_id: doctorId ? Number(doctorId) : null,
        test_name: labOrderForm.test_name,
        notes: labOrderForm.notes,
      };

      const res = await fetch(`${API_BASE}/api/lab-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to submit lab order.");
      }

      setFeedbackMsg("Lab order created successfully!");
      setTimeout(() => {
        setModalType(null);
        setQuickLabApt(null);
        setLabOrderForm({ test_name: "", notes: "" });
        setFeedbackMsg(null);
      }, 1200);
    } catch (err: any) {
      setFeedbackMsg(err.message || "Error submitting lab order.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/appointments/${activePatient.id}/notes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clinical_notes: clinicalNote }),
      });

      if (!res.ok) throw new Error("Failed to update clinical notes");

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === activePatient.id ? { ...apt, clinical_notes: clinicalNote } : apt
        )
      );
      setActivePatient((prev) => prev ? { ...prev, clinical_notes: clinicalNote } : null);

      setFeedbackMsg("Clinical note saved!");
      setTimeout(() => {
        setModalType(null);
        setFeedbackMsg(null);
      }, 1200);
    } catch (err: any) {
      setFeedbackMsg(err.message || "Error saving note.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? dateStr
      : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatDisplayTime = (timeStr?: string) => {
    if (!timeStr) return "N/A";
    const [hours, minutes] = timeStr.split(":");
    if (!hours || !minutes) return timeStr;
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "confirmed":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled":
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getInitials = (name: string) => {
    return name
      .replace(/^dr\.\s*/i, "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const pendingLabReviews = appointments.filter(a => a.status?.toLowerCase() === "pending").length;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col justify-between hidden md:flex sticky top-0 h-screen border-r border-slate-800">
        <div>
          <div className="p-6 border-b border-slate-800/80">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Swift MD Portal</p>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">Doctor Workspace</h2>
          </div>

          <div className="p-4 space-y-1">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Clinical Menu</p>
            
            <button 
              onClick={() => { setActivePatient(null); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm shadow-sm transition"
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button 
              onClick={() => {
                const firstApt = appointments[0];
                if (firstApt) router.push(`/doctors/dashboard/telehealth/${firstApt.id}`);
                else alert("No active appointment available for telehealth room.");
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 font-medium text-sm transition"
            >
              <Video size={18} /> Telehealth Room
            </button>
            <button 
              onClick={() => router.push("/doctors/schedule")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 font-medium text-sm transition"
            >
              <Calendar size={18} /> Schedule Manager
            </button>
            <button 
              onClick={() => router.push("/doctors/settings")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 font-medium text-sm transition"
            >
              <SettingsIcon size={18} /> Settings
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/login");
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/30 rounded-lg transition"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header bar */}
        <header className="bg-slate-900 text-white px-8 py-3.5 flex justify-between items-center sticky top-0 z-40 border-b border-slate-800 shadow-sm">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Live Practice Environment</p>
            <p className="text-sm font-medium text-slate-200">Welcome back, {doctorName}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-white leading-tight">{doctorName}</p>
              <p className="text-[10px] font-medium text-blue-400 uppercase tracking-wider">Medical Specialist</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow">
              {getInitials(doctorName)}
            </div>
          </div>
        </header>

        <main className="max-w-7xl w-full mx-auto px-6 py-8 space-y-8 flex-1">
          {activePatient ? (
            /* --- INDIVIDUAL PATIENT RECORD & CLINICAL WORKSPACE --- */
            <div className="space-y-6">
              <button
                onClick={() => setActivePatient(null)}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition"
              >
                ← Back to Appointments List
              </button>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {activePatient.patient_name || "Anonymous Patient"}
                      </h2>
                      <span className={`px-3 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wider border ${getStatusStyles(activePatient.status)}`}>
                        {activePatient.status || "Scheduled"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Phone: <span className="font-medium text-slate-700">{activePatient.phone || "N/A"}</span> • Visit Timing: <span className="font-medium text-slate-700">{formatDisplayDate(activePatient.appointment_date)} at {formatDisplayTime(activePatient.appointment_time)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.push(`/doctors/dashboard/telehealth/${activePatient.id}`)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm"
                    >
                      <Video size={16} /> Start Video Consultation
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(activePatient.id, "completed")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition font-medium text-sm border border-emerald-200"
                    >
                      <CheckCircle size={16} /> Complete Visit
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-5 rounded-lg border border-slate-200/70 space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Patient Medical Questionnaire & History
                    </h3>
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase">Chief Reason for Visit</p>
                        <p className="text-sm font-medium text-slate-800 mt-0.5">
                          {activePatient.reason || "General Consultation"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase">Questionnaire Response Profile</p>
                        <div className="text-sm text-slate-700 mt-0.5 whitespace-pre-wrap">
                          {activePatient.medical_history || "No prior questionnaire data submitted."}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-lg border border-slate-200/70 space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Clinical Documentation
                        </h3>
                        <button
                          onClick={() => {
                            setClinicalNote(activePatient.clinical_notes || "");
                            setModalType("note");
                          }}
                          className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FileText size={14} /> {activePatient.clinical_notes ? "Edit Note" : "Add Clinical Note"}
                        </button>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Doctor's Clinical Notes:</p>
                        <div className="text-slate-700 text-sm min-h-[50px]">
                          {activePatient.clinical_notes || (
                            <span className="text-slate-400 italic">No clinical notes recorded yet.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Issued Prescriptions
                        </h3>
                        <button
                          onClick={() => setModalType("prescription")}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-semibold text-xs flex items-center gap-1"
                        >
                          <Pill size={14} /> Issue Prescription
                        </button>
                      </div>

                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {loadingPrescriptions ? (
                          <p className="text-xs text-slate-400 italic">Loading prescriptions...</p>
                        ) : patientPrescriptions.length === 0 ? (
                          <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-400 italic">
                            No prescriptions issued for this visit yet.
                          </div>
                        ) : (
                          patientPrescriptions.map((rx) => (
                            <div key={rx.id} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-900 text-sm">
                                  {rx.medication || rx.medication_name || rx.drug_name || "Medication"}
                                </p>
                                <p className="text-xs text-slate-600 mt-0.5">
                                  Dosage: <span className="font-medium">{rx.dosage}</span>
                                </p>
                                {rx.instructions && (
                                  <p className="text-xs text-slate-500 mt-1 italic">
                                    Instructions: {rx.instructions}
                                  </p>
                                )}
                              </div>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-medium text-[10px] rounded uppercase">
                                Active
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* --- APPOINTMENTS DASHBOARD VIEW --- */
            <>
              {/* Quick Statistics Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Appointments</p>
                    <p className="text-2xl font-bold text-slate-900 mt-0.5">{appointments.length}</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Lab Reviews</p>
                    <p className="text-2xl font-bold text-slate-900 mt-0.5">{pendingLabReviews}</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Video size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Telehealth Shortcut</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5">Quick Virtual Room</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const firstApt = appointments[0];
                      if (firstApt) {
                        router.push(`/doctors/dashboard/telehealth/${firstApt.id}`);
                      } else {
                        alert("No active appointments available for telehealth launch.");
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-xs shadow-sm"
                  >
                    Join Room
                  </button>
                </div>
              </div>

              {/* Appointments Section */}
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Patient Appointments
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Assigned Records: <span className="font-semibold text-slate-700">{appointments.length}</span> (Click row for full workspace or use quick actions)
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Patient Profile
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Visit Timing
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Medical Reason
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                        Quick Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                          Loading appointments...
                        </td>
                      </tr>
                    ) : appointments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                          No appointments currently scheduled.
                        </td>
                      </tr>
                    ) : (
                      appointments.map((apt) => (
                        <tr 
                          key={apt.id} 
                          className="hover:bg-slate-50/85 transition cursor-pointer"
                          onClick={() => handleSelectPatient(apt)}
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900">{apt.patient_name || "Anonymous Patient"}</p>
                            <p className="text-xs text-slate-500">{apt.phone || "No phone listed"}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            <p className="font-medium">{formatDisplayDate(apt.appointment_date)}</p>
                            <p className="text-xs text-slate-500">{formatDisplayTime(apt.appointment_time)}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate">
                            {apt.reason || "General Consultation"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wider border ${getStatusStyles(apt.status)}`}>
                              {apt.status || "Scheduled"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setQuickViewPatient(apt);
                                  setModalType("quickView");
                                }}
                                title="Quick View Record"
                                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  setQuickPrescriptionApt(apt);
                                  setModalType("prescription");
                                }}
                                title="Issue Prescription"
                                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              >
                                <Pill size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  setQuickLabApt(apt);
                                  setModalType("quickLab");
                                }}
                                title="Order Lab Test"
                                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              >
                                <FileSpreadsheet size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>

      {/* --- MODAL DIALOGS --- */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-6 relative border border-slate-200 animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => {
                setModalType(null);
                setQuickPrescriptionApt(null);
                setQuickLabApt(null);
                setQuickViewPatient(null);
                setFeedbackMsg(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={20} />
            </button>

            {feedbackMsg && (
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-xs font-medium flex items-center gap-2">
                <CheckCircle size={16} /> {feedbackMsg}
              </div>
            )}

            {/* 1. Prescription Modal */}
            {modalType === "prescription" && (
              <form onSubmit={handleAddPrescription} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Issue Electronic Prescription</h3>
                <p className="text-xs text-slate-500">
                  For Patient: <span className="font-semibold text-slate-700">{activePatient?.patient_name || quickPrescriptionApt?.patient_name}</span>
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Medication Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Amoxicillin 500mg"
                    value={prescriptionForm.medication}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medication: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage & Frequency</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 1 tablet twice daily"
                    value={prescriptionForm.dosage}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions / Notes (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Take with food..."
                    value={prescriptionForm.instructions}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
                  >
                    {submitting ? "Issuing..." : "Submit Prescription"}
                  </button>
                </div>
              </form>
            )}

            {/* 2. Clinical Note Modal */}
            {modalType === "note" && (
              <form onSubmit={handleSaveNote} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Edit Clinical Notes</h3>
                <p className="text-xs text-slate-500">
                  Patient: <span className="font-semibold text-slate-700">{activePatient?.patient_name}</span>
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SOAP Notes / Observations</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Type clinical notes here..."
                    value={clinicalNote}
                    onChange={(e) => setClinicalNote(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
                  >
                    {submitting ? "Saving..." : "Save Note"}
                  </button>
                </div>
              </form>
            )}

            {/* 3. Quick View Modal */}
            {modalType === "quickView" && quickViewPatient && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Quick Patient Profile</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-sm">
                  <p><span className="font-semibold text-slate-500">Name:</span> {quickViewPatient.patient_name}</p>
                  <p><span className="font-semibold text-slate-500">Phone:</span> {quickViewPatient.phone || "N/A"}</p>
                  <p><span className="font-semibold text-slate-500">Visit Reason:</span> {quickViewPatient.reason || "General"}</p>
                  <p><span className="font-semibold text-slate-500">Timing:</span> {formatDisplayDate(quickViewPatient.appointment_date)} at {formatDisplayTime(quickViewPatient.appointment_time)}</p>
                  <p><span className="font-semibold text-slate-500">Questionnaire:</span> {quickViewPatient.medical_history || "None"}</p>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalType(null);
                      handleSelectPatient(quickViewPatient);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
                  >
                    Open Full Workspace
                  </button>
                </div>
              </div>
            )}

            {/* 4. Lab Order Modal */}
            {modalType === "quickLab" && (
              <form onSubmit={handleAddLabOrder} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Order Diagnostic Lab Test</h3>
                <p className="text-xs text-slate-500">
                  For Patient: <span className="font-semibold text-slate-700">{quickLabApt?.patient_name}</span>
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Test Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Complete Blood Count (CBC)"
                    value={labOrderForm.test_name}
                    onChange={(e) => setLabOrderForm({ ...labOrderForm, test_name: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Instructions / Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Fasting required..."
                    value={labOrderForm.notes}
                    onChange={(e) => setLabOrderForm({ ...labOrderForm, notes: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
                  >
                    {submitting ? "Ordering..." : "Submit Lab Order"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}