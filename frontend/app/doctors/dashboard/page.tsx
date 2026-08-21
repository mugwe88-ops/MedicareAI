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
  AlertCircle 
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
  const [doctorName, setDoctorName] = useState<string>("Doctor");
  
  // Drill-down selected patient state
  const [activePatient, setActivePatient] = useState<Appointment | null>(null);
  const [patientPrescriptions, setPatientPrescriptions] = useState<Prescription[]>([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);

  // Modals state
  const [modalType, setModalType] = useState<"prescription" | "note" | null>(null);
  
  // Form states
  const [prescriptionForm, setPrescriptionForm] = useState({
    medication: "",
    dosage: "",
    instructions: "",
  });
  const [clinicalNote, setClinicalNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const API_BASE = "https://medicareai-1.onrender.com";

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
      } catch (e) {
        console.error("Failed to parse local user profile", e);
      }
    }

    fetchAppointments(token);
  }, []);

  const router = useRouter();

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

  // Fetch prescriptions for the selected patient/appointment
// Fetch prescriptions for the selected patient/appointment using the correct path parameter
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

  // When clicking a patient record, load their prescriptions
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
    if (!activePatient) return;
    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      let doctorId = null;
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          doctorId = parsed.id || parsed.doctor_id;
        } catch (e) {
          console.error("Error parsing doctor profile", e);
        }
      }

      const payload = {
        appointment_id: Number(activePatient.id),
        patient_id: activePatient.patient_id ? Number(activePatient.patient_id) : null,
        doctor_id: doctorId ? Number(doctorId) : null,
        patient_name: activePatient.patient_name || "Anonymous Patient",
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
      
      // Refresh the prescriptions list immediately
      fetchPrescriptionsForAppointment(activePatient.id);

      setTimeout(() => {
        setModalType(null);
        setPrescriptionForm({ medication: "", dosage: "", instructions: "" });
        setFeedbackMsg(null);
      }, 1200);
    } catch (err: any) {
      setFeedbackMsg(err.message || "Error submitting prescription.");
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
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <h1 className="text-2xl font-black text-blue-600 tracking-tighter">
          MedicareAI <span className="text-slate-900 font-light italic">Pro</span>
        </h1>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-black text-slate-900 leading-none">{doctorName}</p>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">
              Medical Specialist
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-100">
            {getInitials(doctorName)}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        {activePatient ? (
          /* --- INDIVIDUAL PATIENT RECORD & CLINICAL WORKSPACE --- */
          <div className="space-y-6">
            <button
              onClick={() => setActivePatient(null)}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition"
            >
              <ArrowLeft size={16} /> Back to Appointments List
            </button>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 p-8 space-y-8">
              {/* Header profile info */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                      {activePatient.patient_name || "Anonymous Patient"}
                    </h2>
                    <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border ${getStatusStyles(activePatient.status)}`}>
                      {activePatient.status || "Scheduled"}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-400 mt-1">
                    Phone: {activePatient.phone || "N/A"} • Visit Timing: {formatDisplayDate(activePatient.appointment_date)} at {formatDisplayTime(activePatient.appointment_time)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push(`/telehealth/${activePatient.id}`)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition font-black text-sm shadow-lg shadow-blue-100"
                  >
                    <Video size={18} /> Start Video Consultation
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(activePatient.id, "completed")}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition font-black text-sm border border-emerald-100"
                  >
                    <CheckCircle size={18} /> Complete
                  </button>
                </div>
              </div>

              {/* Grid content for history & clinical notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Patient History & Questionnaire */}
                <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                    Patient Medical Questionnaire & History
                  </h3>
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase">Chief Reason for Visit:</p>
                    <p className="text-sm font-black text-slate-800 mt-1 mb-4">
                      "{activePatient.reason || "General Consultation"}"
                    </p>

                    <p className="text-xs font-bold text-slate-500 uppercase">Questionnaire Response Profile:</p>
                    <div className="text-sm text-slate-700 font-medium mt-1 whitespace-pre-wrap">
                      {activePatient.medical_history || "No prior questionnaire data submitted."}
                    </div>
                  </div>
                </div>

                {/* Clinical Notes & Prescriptions Management */}
                <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-6">
                  {/* Clinical Notes Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                        Clinical Documentation
                      </h3>
                      <button
                        onClick={() => {
                          setClinicalNote(activePatient.clinical_notes || "");
                          setModalType("note");
                        }}
                        className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FileText size={14} /> {activePatient.clinical_notes ? "Edit Note" : "Add Clinical Note"}
                      </button>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Doctor's Clinical Notes:</p>
                      <div className="text-slate-800 text-sm font-medium min-h-[60px]">
                        {activePatient.clinical_notes || (
                          <span className="text-slate-400 italic">No clinical notes recorded yet.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Issued Prescriptions Section */}
                  <div className="space-y-3 pt-2 border-t border-slate-200/60">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                        Issued Prescriptions
                      </h3>
                      <button
                        onClick={() => setModalType("prescription")}
                        className="px-3.5 py-1.5 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition font-black text-xs flex items-center gap-1.5"
                      >
                        <Pill size={14} /> Issue Prescription
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto">
                      {loadingPrescriptions ? (
                        <p className="text-xs text-slate-400 italic">Loading prescriptions...</p>
                      ) : patientPrescriptions.length === 0 ? (
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 text-xs text-slate-400 italic">
                          No prescriptions issued for this visit yet.
                        </div>
                      ) : (
                        patientPrescriptions.map((rx) => (
                          <div key={rx.id} className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex items-start justify-between gap-3">
                            <div>
                              <p className="font-black text-purple-900 text-sm">
                                {rx.medication || rx.medication_name || rx.drug_name || "Medication"}
                              </p>
                              <p className="text-xs font-bold text-slate-600 mt-0.5">
                                Dosage: {rx.dosage}
                              </p>
                              {rx.instructions && (
                                <p className="text-xs text-slate-500 mt-1 italic">
                                  Instructions: {rx.instructions}
                                </p>
                              )}
                            </div>
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-extrabold text-[10px] rounded-lg uppercase">
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
          /* --- APPOINTMENTS LIST VIEW --- */
          <>
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                  Patient Appointments
                </h2>
                <p className="text-slate-500 font-bold mt-2">
                  Assigned Records: {appointments.length} (Click a patient to view full history)
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr className="border-b border-slate-100">
                    <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Patient Profile
                    </th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Visit Timing
                    </th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Medical Reason
                    </th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Status
                    </th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center font-black text-slate-300 italic text-xl">
                        Accessing secure records...
                      </td>
                    </tr>
                  ) : appointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center font-bold text-slate-400 text-base">
                        No appointments assigned to your schedule.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((apt) => (
                      <tr 
                        key={apt.id} 
                        onClick={() => handleSelectPatient(apt)}
                        className="hover:bg-blue-50/40 transition-all cursor-pointer group"
                      >
                        <td className="px-10 py-7">
                          <p className="font-black text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition">
                            {apt.patient_name || "Anonymous Patient"}
                          </p>
                          <p className="text-sm text-slate-400 font-bold mt-1 tracking-tight">
                            {apt.phone || "N/A"}
                          </p>
                        </td>
                        <td className="px-10 py-7">
                          <p className="font-black text-slate-700">
                            {formatDisplayDate(apt.appointment_date)}
                          </p>
                          <p className="text-xs font-black text-blue-500 uppercase mt-0.5">
                            {formatDisplayTime(apt.appointment_time)}
                          </p>
                        </td>
                        <td className="px-10 py-7">
                          <div className="px-4 py-2 bg-slate-100 rounded-xl inline-block">
                            <p className="text-xs text-slate-500 font-black italic uppercase tracking-tighter">
                              "{apt.reason || "General Consultation"}"
                            </p>
                          </div>
                        </td>
                        <td className="px-10 py-7">
                          <span className={`px-4 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest border ${getStatusStyles(apt.status)}`}>
                            {apt.status || "Scheduled"}
                          </span>
                        </td>
                        <td className="px-10 py-7 text-right">
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
                            View Record &rarr;
                          </span>
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

      {/* Prescription Modal */}
      {modalType === "prescription" && activePatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                Issue Prescription for {activePatient.patient_name}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>

            {feedbackMsg && (
              <div className="bg-blue-50 text-blue-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} /> {feedbackMsg}
              </div>
            )}

            <form onSubmit={handleAddPrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Medication Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amoxicillin, Hydrocortisone Cream"
                  value={prescriptionForm.medication}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medication: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dosage</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500mg, Twice daily for 7 days"
                  value={prescriptionForm.dosage}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instructions / Usage Notes</label>
                <textarea
                  rows={3}
                  placeholder="Take after meals..."
                  value={prescriptionForm.instructions}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 text-slate-800 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="w-1/2 py-2.5 rounded-xl font-bold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl font-bold text-sm bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clinical Notes Modal */}
      {modalType === "note" && activePatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                Clinical Notes: {activePatient.patient_name}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>

            {feedbackMsg && (
              <div className="bg-amber-50 text-amber-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} /> {feedbackMsg}
              </div>
            )}

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Diagnosis / Observations</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Record symptoms, diagnosis, and treatment recommendations..."
                  value={clinicalNote}
                  onChange={(e) => setClinicalNote(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 text-slate-800 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="w-1/2 py-2.5 rounded-xl font-bold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl font-bold text-sm bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}