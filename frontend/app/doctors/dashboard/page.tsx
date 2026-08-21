"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Pill, 
  Video, 
  CheckCircle, 
  Trash2, 
  Plus, 
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
  medical_history?: string; // Added to capture questionnaire details
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState<string>("Doctor");
  const router = useRouter();

  // Modals state
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
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
  }, [router]);

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
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApt) return;
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

      const patientName = selectedApt.patient_name || "Anonymous Patient";

      const payload = {
        appointment_id: Number(selectedApt.id),
        patient_id: selectedApt.patient_id ? Number(selectedApt.patient_id) : null,
        doctor_id: doctorId ? Number(doctorId) : null,
        patient_name: patientName,
        medication: prescriptionForm.medication,
        medication_name: prescriptionForm.medication,
        dosage: prescriptionForm.dosage,
        instructions: prescriptionForm.instructions || "",
        duration: "N/A",
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
        throw new Error(data.message || data.error || `Server responded with ${res.status}`);
      }

      setFeedbackMsg("Prescription issued successfully!");
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
    if (!selectedApt) return;
    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/appointments/${selectedApt.id}/notes`, {
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
          apt.id === selectedApt.id ? { ...apt, clinical_notes: clinicalNote } : apt
        )
      );

      setFeedbackMsg("Clinical note saved!");
      setTimeout(() => {
        setModalType(null);
        setClinicalNote("");
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
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
              Patient Appointments
            </h2>
            <p className="text-slate-500 font-bold mt-2">
              Assigned Records: {appointments.length}
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
                  Clinical Actions
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
                  <tr key={apt.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-10 py-7">
                      <p className="font-black text-slate-900 text-lg leading-tight">
                        {apt.patient_name || "Anonymous Patient"}
                      </p>
                      <p className="text-sm text-slate-400 font-bold mt-1 tracking-tight">
                        {apt.phone || "N/A"}
                      </p>
                      {/* Questionnaire / Medical History Display */}
                      {apt.medical_history && (
                        <div className="mt-3 text-xs bg-blue-50 text-blue-900 p-3 rounded-2xl border border-blue-100 font-medium">
                          <span className="font-black block text-[10px] uppercase tracking-wider text-blue-600 mb-1">
                            Medical Questionnaire:
                          </span>
                          {apt.medical_history}
                        </div>
                      )}
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
                      <span
                        className={`px-4 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest border ${getStatusStyles(
                          apt.status
                        )}`}
                      >
                        {apt.status || "Scheduled"}
                      </span>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {/* Telehealth Video Call */}
                        <button
                          onClick={() => router.push(`/telehealth/${apt.id}`)}
                          className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition shadow-sm"
                          title="Start Video Call"
                        >
                          <Video size={16} />
                        </button>

                        {/* Add Prescription */}
                        <button
                          onClick={() => {
                            setSelectedApt(apt);
                            setModalType("prescription");
                          }}
                          className="p-2.5 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition shadow-sm"
                          title="Issue Prescription"
                        >
                          <Pill size={16} />
                        </button>

                        {/* Add / Edit Clinical Note */}
                        <button
                          onClick={() => {
                            setSelectedApt(apt);
                            setClinicalNote(apt.clinical_notes || "");
                            setModalType("note");
                          }}
                          className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition shadow-sm"
                          title="Add Clinical Note"
                        >
                          <FileText size={16} />
                        </button>

                        {/* Mark Complete */}
                        <button
                          onClick={() => handleStatusUpdate(apt.id, "completed")}
                          className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition shadow-sm"
                          title="Mark Complete"
                        >
                          <CheckCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Prescription Modal */}
      {modalType === "prescription" && selectedApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                Issue Prescription for {selectedApt.patient_name}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medication Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amoxicillin, Hydrocortisone Cream"
                  value={prescriptionForm.medication}
                  onChange={(e) =>
                    setPrescriptionForm({ ...prescriptionForm, medication: e.target.value })
                  }
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
                  onChange={(e) =>
                    setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instructions / Usage Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Take after meals..."
                  value={prescriptionForm.instructions}
                  onChange={(e) =>
                    setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })
                  }
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
      {modalType === "note" && selectedApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                Clinical Notes: {selectedApt.patient_name}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Diagnosis / Observations
                </label>
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