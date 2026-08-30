"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Pill, 
  Video, 
  CheckCircle, 
  X, 
  Users,
  Activity,
  Clock,
  Eye,
  FileSpreadsheet,
  Scan,
  FlaskConical,
  Glasses,
  Bell
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
  patient_chronic_conditions?: string;
  patient_allergies?: string;
  patient_surgeries?: string;
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

interface DiagnosticOrder {
  id: number;
  appointment_id: number;
  category: string;
  test_name: string;
  notes?: string;
  created_at?: string;
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState<string>("Doctor");
  const [doctorId, setDoctorId] = useState<number | null>(null);
  
  // Drill-down selected patient state
  const [activePatient, setActivePatient] = useState<Appointment | null>(null);
  const [patientPrescriptions, setPatientPrescriptions] = useState<Prescription[]>([]);
  const [patientDiagnostics, setPatientDiagnostics] = useState<DiagnosticOrder[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  // Global pending diagnostic/lab orders across all appointments for notifications
  const [allPendingDiagnostics, setAllPendingDiagnostics] = useState<DiagnosticOrder[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [modalType, setModalType] = useState<"prescription" | "note" | "quickView" | "quickLab" | "diagnostic" | null>(null);
  const [quickViewPatient, setQuickViewPatient] = useState<Appointment | null>(null);
  const [quickPrescriptionApt, setQuickPrescriptionApt] = useState<Appointment | null>(null);
  const [quickLabApt, setQuickLabApt] = useState<Appointment | null>(null);
  const [quickDiagnosticApt, setQuickDiagnosticApt] = useState<DiagnosticOrder | null>(null);

  // Form states
  const [prescriptionForm, setPrescriptionForm] = useState({
    medication: "",
    dosage: "",
    instructions: "",
  });
  const [diagnosticForm, setDiagnosticForm] = useState({
    category: "Laboratory",
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
        if (parsed.name) {
          const formattedName = parsed.name.startsWith("Dr.") ? parsed.name : `Dr. ${parsed.name}`;
          setDoctorName(formattedName);
        }
        const resolvedId = parsed.id || parsed.doctor_id || parsed.userId || parsed.user_id;
        if (resolvedId) {
          setDoctorId(Number(resolvedId));
        }
      } catch (e) {
        console.error("Failed to parse local user profile", e);
      }
    }

    fetchAppointments(token);

    // Close notification dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      if (Array.isArray(data)) {
        setAppointments(data);
        if (token) {
          fetchAllDiagnostics(data, token);
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDiagnostics = async (aptList: Appointment[], token: string) => {
    try {
      const promises = aptList.map(apt => 
        fetch(`${API_BASE}/api/appointments/${apt.id}/diagnostics`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        })
        .then(res => res.ok ? res.json() : [])
        .catch(() => [])
      );
      const results = await Promise.all(promises);
      const flattened = results.flat();
      setAllPendingDiagnostics(flattened);
    } catch (err) {
      console.error("Error fetching all diagnostics for notifications:", err);
    }
  };

  const fetchPatientExtras = async (appointmentId: number) => {
    const token = localStorage.getItem("token");
    setLoadingExtras(true);
    try {
      const [rxRes, diagRes] = await Promise.all([
        fetch(`${API_BASE}/api/appointments/${appointmentId}/prescriptions`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }),
        fetch(`${API_BASE}/api/appointments/${appointmentId}/diagnostics`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }).catch(() => ({ ok: false, json: async () => [] }))
      ]);

      if (rxRes.ok) {
        const rxData = await rxRes.json();
        setPatientPrescriptions(Array.isArray(rxData) ? rxData : []);
      } else {
        setPatientPrescriptions([]);
      }

      if ('ok' in diagRes && diagRes.ok) {
        const diagData = await (diagRes as Response).json();
        setPatientDiagnostics(Array.isArray(diagData) ? diagData : []);
      } else {
        setPatientDiagnostics([]);
      }
    } catch (err) {
      console.error("Error fetching patient extras:", err);
      setPatientPrescriptions([]);
      setPatientDiagnostics([]);
    } finally {
      setLoadingExtras(false);
    }
  };

  const handleSelectPatient = (apt: Appointment) => {
    setActivePatient(apt);
    fetchPatientExtras(apt.id);
    setShowNotifications(false);
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
        fetchPatientExtras(activePatient.id);
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

  const handleAddDiagnosticOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetApt = activePatient || quickLabApt;
    if (!targetApt) return;
    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        appointment_id: Number(targetApt.id),
        patient_id: targetApt.patient_id ? Number(targetApt.patient_id) : null,
        doctor_id: doctorId ? Number(doctorId) : null,
        category: diagnosticForm.category,
        test_name: diagnosticForm.test_name,
        notes: diagnosticForm.notes,
      };

      const res = await fetch(`${API_BASE}/api/diagnostics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to submit diagnostic order.");
      }

      setFeedbackMsg("Diagnostic test ordered successfully!");
      if (activePatient) {
        fetchPatientExtras(activePatient.id);
      }
      if (token) {
        fetchAllDiagnostics(appointments, token);
      }

      setTimeout(() => {
        setModalType(null);
        setQuickLabApt(null);
        setDiagnosticForm({ category: "Laboratory", test_name: "", notes: "" });
        setFeedbackMsg(null);
      }, 1200);
    } catch (err: any) {
      setFeedbackMsg(err.message || "Error submitting diagnostic order.");
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

  const pendingAppointmentsList = appointments.filter(a => a.status?.toLowerCase() === "pending" || a.status?.toLowerCase() === "scheduled" || !a.status);
  const pendingAppointmentsCount = pendingAppointmentsList.length;
  const pendingLabReviews = allPendingDiagnostics.length;
  const totalNotificationsCount = pendingAppointmentsCount + pendingLabReviews;

  return (
    <div className="max-w-7xl w-full mx-auto px-6 py-8 space-y-8 flex-1 bg-slate-100 min-h-screen text-slate-800 font-sans relative">
      
      {/* Top Header Bar with Notification Button Integration */}
      <div className="flex justify-between items-center bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Doctor Workspace</h1>
          <p className="text-xs text-slate-500">Welcome back, {doctorName}</p>
        </div>

        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition focus:outline-none"
            title="Notifications"
          >
            <Bell size={20} />
            {totalNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {totalNotificationsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Card */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bell size={16} />
                  <h3 className="font-bold text-sm">Notifications & Pending Tasks</h3>
                </div>
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {totalNotificationsCount} New
                </span>
              </div>

              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                {totalNotificationsCount === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs italic">
                    No pending appointments or lab reviews. All caught up!
                  </div>
                ) : (
                  <>
                    {pendingAppointmentsList.length > 0 && (
                      <div className="p-3 bg-slate-50/50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                          Pending Appointments ({pendingAppointmentsList.length})
                        </p>
                        <div className="space-y-2">
                          {pendingAppointmentsList.map((apt) => (
                            <div
                              key={`notif-apt-${apt.id}`}
                              onClick={() => handleSelectPatient(apt)}
                              className="bg-white p-3 rounded-xl border border-slate-200 hover:border-blue-400 cursor-pointer transition shadow-sm flex items-center justify-between"
                            >
                              <div>
                                <p className="font-semibold text-slate-900 text-xs">{apt.patient_name || "Patient"}</p>
                                <p className="text-[11px] text-slate-500">{formatDisplayDate(apt.appointment_date)} at {formatDisplayTime(apt.appointment_time)}</p>
                              </div>
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded">
                                Review
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {allPendingDiagnostics.length > 0 && (
                      <div className="p-3 bg-slate-50/50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                          Pending Lab & Diagnostic Orders ({allPendingDiagnostics.length})
                        </p>
                        <div className="space-y-2">
                          {allPendingDiagnostics.map((diag) => {
                            const parentApt = appointments.find(a => a.id === diag.appointment_id);
                            return (
                              <div
                                key={`notif-diag-${diag.id}`}
                                onClick={() => parentApt && handleSelectPatient(parentApt)}
                                className="bg-white p-3 rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition shadow-sm flex items-center justify-between"
                              >
                                <div>
                                  <p className="font-semibold text-slate-900 text-xs">{diag.test_name}</p>
                                  <p className="text-[11px] text-slate-500">Patient: {parentApt?.patient_name || "Assigned Patient"}</p>
                                </div>
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded">
                                  {diag.category || "Lab"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {activePatient ? (
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
                    {activePatient.patient_chronic_conditions || activePatient.patient_allergies || activePatient.patient_surgeries ? (
                      <div className="text-sm text-slate-700 mt-1 space-y-1">
                        <p><strong>Chronic Conditions:</strong> {activePatient.patient_chronic_conditions || 'None'}</p>
                        <p><strong>Allergies:</strong> {activePatient.patient_allergies || 'None'}</p>
                        <p><strong>Surgeries / Hospitalizations:</strong> {activePatient.patient_surgeries || 'None'}</p>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500 italic mt-0.5">
                        {activePatient.medical_history || "No prior questionnaire data submitted."}
                      </div>
                    )}
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

                {/* Diagnostics Orders Section */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Diagnostics & Labs
                    </h3>
                    <button
                      onClick={() => setModalType("diagnostic")}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition font-semibold text-xs flex items-center gap-1"
                    >
                      <FlaskConical size={14} /> Order Diagnostics
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto">
                    {loadingExtras ? (
                      <p className="text-xs text-slate-400 italic">Loading diagnostic orders...</p>
                    ) : patientDiagnostics.length === 0 ? (
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-400 italic">
                        No lab, imaging, or ophthalmology tests ordered yet.
                      </div>
                    ) : (
                      patientDiagnostics.map((diag) => (
                        <div key={diag.id} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold text-[10px] rounded uppercase">
                                {diag.category || "Lab"}
                              </span>
                              <p className="font-semibold text-slate-900 text-sm">
                                {diag.test_name}
                              </p>
                            </div>
                            {diag.notes && (
                              <p className="text-xs text-slate-500 mt-1 italic">
                                Notes: {diag.notes}
                              </p>
                            )}
                          </div>
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-medium text-[10px] rounded uppercase">
                            Pending
                          </span>
                        </div>
                      ))
                    )}
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

                  <div className="space-y-2 max-h-[160px] overflow-y-auto">
                    {loadingExtras ? (
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

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Visits</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{pendingAppointmentsCount}</p>
              </div>
            </div>
          </div>

          {/* Appointments Management Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Assigned Patient Queue</h2>
              <button 
                onClick={() => fetchAppointments()}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Refresh Queue
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">Loading patient appointments queue...</div>
            ) : appointments.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No patient appointments found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-3">Patient Name</th>
                      <th className="px-6 py-3">Schedule</th>
                      <th className="px-6 py-3">Chief Reason</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {apt.patient_name || "Anonymous Patient"}
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs">
                          {formatDisplayDate(apt.appointment_date)} at {formatDisplayTime(apt.appointment_time)}
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs max-w-xs truncate">
                          {apt.reason || "General Consultation"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wider border ${getStatusStyles(apt.status)}`}>
                            {apt.status || "Scheduled"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleSelectPatient(apt)}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 transition rounded-lg text-xs font-semibold"
                          >
                            Open Chart
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL WINDOWS */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base">
                {modalType === "prescription" && "Issue New Prescription"}
                {modalType === "diagnostic" && "Order Diagnostic / Lab Test"}
                {modalType === "note" && "Edit Clinical Documentation"}
              </h3>
              <button 
                onClick={() => { setModalType(null); setFeedbackMsg(null); }}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {feedbackMsg && (
                <div className={`mb-4 p-3 rounded-xl text-xs font-semibold ${feedbackMsg.includes("success") || feedbackMsg.includes("saved") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  {feedbackMsg}
                </div>
              )}

              {modalType === "prescription" && (
                <form onSubmit={handleAddPrescription} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Medication Name</label>
                    <input
                      type="text"
                      required
                      value={prescriptionForm.medication}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medication: e.target.value })}
                      placeholder="e.g., Amoxicillin 500mg"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dosage</label>
                    <input
                      type="text"
                      required
                      value={prescriptionForm.dosage}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })}
                      placeholder="e.g., 1 tablet twice daily"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Special Instructions</label>
                    <textarea
                      rows={3}
                      value={prescriptionForm.instructions}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })}
                      placeholder="e.g., Take after meals with plenty of water"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-600 resize-none"
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                    >
                      {submitting ? "Issuing..." : "Confirm & Issue Prescription"}
                    </button>
                  </div>
                </form>
              )}

              {modalType === "diagnostic" && (
                <form onSubmit={handleAddDiagnosticOrder} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                    <select
                      value={diagnosticForm.category}
                      onChange={(e) => setDiagnosticForm({ ...diagnosticForm, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-600"
                    >
                      <option value="Laboratory">Laboratory Test</option>
                      <option value="Imaging">Imaging / Radiology</option>
                      <option value="Ophthalmology">Ophthalmology Examination</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Test Name</label>
                    <input
                      type="text"
                      required
                      value={diagnosticForm.test_name}
                      onChange={(e) => setDiagnosticForm({ ...diagnosticForm, test_name: e.target.value })}
                      placeholder="e.g., Complete Blood Count (CBC) or Chest X-Ray"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Clinical Notes / Instructions</label>
                    <textarea
                      rows={3}
                      value={diagnosticForm.notes}
                      onChange={(e) => setDiagnosticForm({ ...diagnosticForm, notes: e.target.value })}
                      placeholder="Specific clinical requests or preparation instructions..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-600 resize-none"
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
                    >
                      {submitting ? "Ordering..." : "Submit Diagnostic Order"}
                    </button>
                  </div>
                </form>
              )}

              {modalType === "note" && (
                <form onSubmit={handleSaveNote} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Doctor's Clinical Notes</label>
                    <textarea
                      rows={5}
                      required
                      value={clinicalNote}
                      onChange={(e) => setClinicalNote(e.target.value)}
                      placeholder="Enter examination findings, diagnosis, and treatment instructions..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-800 outline-none focus:border-blue-600 resize-none"
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                    >
                      {submitting ? "Saving..." : "Save Clinical Note"}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
