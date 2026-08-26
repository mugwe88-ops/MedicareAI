"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Pill, 
  Video, 
  CheckCircle, 
  ArrowLeft, 
  X, 
  AlertCircle,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Users,
  Activity,
  Eye,
  FileSpreadsheet
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

interface AvailabilitySlot {
  id?: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState<string>("Doctor");
  const [doctorId, setDoctorId] = useState<number | null>(null);
  
  // Availability states
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [newSlot, setNewSlot] = useState<AvailabilitySlot>({
    day_of_week: "Monday",
    start_time: "09:00",
    end_time: "17:00",
  });
  const [savingSlot, setSavingSlot] = useState(false);
  const [availabilityMsg, setAvailabilityMsg] = useState<string | null>(null);

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
        const resolvedId = parsed.id || parsed.doctor_id;
        if (resolvedId) {
          setDoctorId(Number(resolvedId));
          fetchAvailability(Number(resolvedId), token);
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

  const fetchAvailability = async (docId: number, token?: string) => {
    const authToken = token || localStorage.getItem("token") || undefined;
    try {
      const res = await fetch(`${API_BASE}/api/doctors/${docId}/availability`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAvailabilitySlots(data);
      }
    } catch (err) {
      console.error("Error fetching availability:", err);
    }
  };

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) return;
    setSavingSlot(true);
    setAvailabilityMsg(null);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/doctors/${doctorId}/availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSlot),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to add availability slot");

      setAvailabilityMsg("Availability updated successfully!");
      fetchAvailability(Number(doctorId), token || undefined);
      setTimeout(() => setAvailabilityMsg(null), 2500);
    } catch (err: any) {
      setAvailabilityMsg(err.message || "Error saving availability slot.");
    } finally {
      setSavingSlot(false);
    }
  };

  const handleDeleteAvailability = async (slotId?: number) => {
    if (!slotId || !doctorId) return;
    const token = localStorage.getItem("token");

    setAvailabilitySlots((prev) => prev.filter((s) => s.id !== slotId));

    try {
      const res = await fetch(`${API_BASE}/api/doctors/${doctorId}/availability/${slotId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete availability slot.");
      }
    } catch (err) {
      console.error("Error deleting slot:", err);
      fetchAvailability(doctorId, token || undefined);
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-blue-600 tracking-tight">
            MEDICARE <span className="text-slate-800 font-normal">AI</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900 leading-tight">{doctorName}</p>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Medical Specialist
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm shadow-sm">
            {getInitials(doctorName)}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {activePatient ? (
          /* --- INDIVIDUAL PATIENT RECORD & CLINICAL WORKSPACE --- */
          <div className="space-y-6">
            <button
              onClick={() => setActivePatient(null)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition"
            >
              <ArrowLeft size={16} /> Back to Appointments List
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
          /* --- APPOINTMENTS LIST & AVAILABILITY MANAGEMENT VIEW --- */
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

            {/* Availability Manager Panel */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="text-blue-600" size={20} />
                  <h2 className="text-lg font-bold text-slate-900">Manage Practice Availability Slots</h2>
                </div>
                <span className="text-xs text-slate-500">Configure schedule visible to patients during booking</span>
              </div>

              {availabilityMsg && (
                <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={16} /> {availabilityMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={newSlot.day_of_week}
                    onChange={(e) => setNewSlot({ ...newSlot, day_of_week: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-800"
                  >
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newSlot.start_time}
                    onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newSlot.end_time}
                    onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                  />
                </div>
                <div>
                  <button
                    onClick={handleAddAvailability}
                    disabled={savingSlot}
                    className="w-full bg-blue-600 text-white font-medium text-sm py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                  >
                    <Plus size={16} /> {savingSlot ? "Adding..." : "Add Slot"}
                  </button>
                </div>
              </div>

              {/* Current Active Availability Chips */}
              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Active Schedule:</p>
                {availabilitySlots.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No availability slots added yet. Patients will not see open times for booking.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availabilitySlots.map((slot) => (
                      <div key={slot.id || Math.random()} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700">
                        <Clock size={14} className="text-blue-500" />
                        <span>{slot.day_of_week}: {formatDisplayTime(slot.start_time)} - {formatDisplayTime(slot.end_time)}</span>
                        <button onClick={() => handleDeleteAvailability(slot.id)} className="text-slate-400 hover:text-red-600 transition ml-1">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Appointments Section */}
            <div className="flex justify-between items-end mb-4">
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
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-400">Loading appointments...</td>
                    </tr>
                  ) : appointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-400">No patient appointments found.</td>
                    </tr>
                  ) : (
                    appointments.map((apt) => (
                      <tr 
                        key={apt.id} 
                        className="hover:bg-slate-50/80 transition cursor-pointer"
                        onClick={() => handleSelectPatient(apt)}
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{apt.patient_name || "Anonymous"}</p>
                          <p className="text-xs text-slate-500">{apt.phone || "No phone provided"}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          <p className="font-medium">{formatDisplayDate(apt.appointment_date)}</p>
                          <p className="text-xs text-slate-500">{formatDisplayTime(apt.appointment_time)}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                          {apt.reason || "General Consultation"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wider border ${getStatusStyles(apt.status)}`}>
                            {apt.status || "Scheduled"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setQuickViewPatient(apt);
                              setModalType("quickView");
                            }}
                            title="Quick View Record"
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition inline-flex items-center justify-center"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setQuickPrescriptionApt(apt);
                              setModalType("prescription");
                            }}
                            title="Issue Prescription"
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition inline-flex items-center justify-center"
                          >
                            <Pill size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setQuickLabApt(apt);
                              setModalType("quickLab");
                            }}
                            title="Order Lab Test"
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition inline-flex items-center justify-center"
                          >
                            <FileSpreadsheet size={15} />
                          </button>
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

      {/* --- MODALS --- */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            
            {/* Prescription Modal */}
            {modalType === "prescription" && (
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Pill className="text-blue-600" size={20} /> Issue Prescription
                  </h3>
                  <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>

                {feedbackMsg && (
                  <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${feedbackMsg.includes("success") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    <AlertCircle size={16} /> {feedbackMsg}
                  </div>
                )}

                <form onSubmit={handleAddPrescription} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Medication Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amoxicillin 500mg"
                      value={prescriptionForm.medication}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medication: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1 tablet twice daily"
                      value={prescriptionForm.dosage}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions / Notes (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Take with food"
                      value={prescriptionForm.instructions}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 shadow-sm"
                    >
                      {submitting ? "Issuing..." : "Submit Prescription"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Clinical Note Modal */}
            {modalType === "note" && (
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="text-blue-600" size={20} /> Update Clinical Notes
                  </h3>
                  <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>

                {feedbackMsg && (
                  <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${feedbackMsg.includes("saved") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    <AlertCircle size={16} /> {feedbackMsg}
                  </div>
                )}

                <form onSubmit={handleSaveNote} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Assessment & Notes</label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Enter patient diagnosis, findings, or treatment plan..."
                      value={clinicalNote}
                      onChange={(e) => setClinicalNote(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 shadow-sm"
                    >
                      {submitting ? "Saving..." : "Save Note"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Quick View Patient Modal */}
            {modalType === "quickView" && quickViewPatient && (
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="text-blue-600" size={20} /> Patient Summary Record
                  </h3>
                  <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Patient Name</p>
                    <p className="text-sm font-semibold text-slate-900">{quickViewPatient.patient_name}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Contact Phone</p>
                    <p className="text-sm font-medium text-slate-800">{quickViewPatient.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Appointment Time</p>
                    <p className="text-sm font-medium text-slate-800">{formatDisplayDate(quickViewPatient.appointment_date)} at {formatDisplayTime(quickViewPatient.appointment_time)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Chief Complaint / Reason</p>
                    <p className="text-sm font-medium text-slate-800">{quickViewPatient.reason || "General Consultation"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Medical History / Questionnaire</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{quickViewPatient.medical_history || "No history submitted."}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setModalType(null);
                      handleSelectPatient(quickViewPatient);
                    }}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
                  >
                    Open Full Workspace
                  </button>
                </div>
              </div>
            )}

            {/* Quick Lab Order Modal */}
            {modalType === "quickLab" && (
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="text-emerald-600" size={20} /> Order Lab Test
                  </h3>
                  <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>

                {feedbackMsg && (
                  <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${feedbackMsg.includes("success") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    <AlertCircle size={16} /> {feedbackMsg}
                  </div>
                )}

                <form onSubmit={handleAddLabOrder} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Test Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Complete Blood Count (CBC)"
                      value={labOrderForm.test_name}
                      onChange={(e) => setLabOrderForm({ ...labOrderForm, test_name: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Lab Instructions / Notes (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Fasting required for 8 hours prior"
                      value={labOrderForm.notes}
                      onChange={(e) => setLabOrderForm({ ...labOrderForm, notes: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 shadow-sm"
                    >
                      {submitting ? "Ordering..." : "Create Lab Order"}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}