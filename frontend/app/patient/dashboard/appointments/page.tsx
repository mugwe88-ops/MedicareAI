"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface ConsultationDetail {
  id: number | string;
  doctor_id?: number;
  doctor_name?: string;
  specialization?: string;
  department?: string;
  appointment_date: string;
  appointment_time?: string;
  reason: string;
  status: string;
  telehealth_room_url?: string;
  age?: number;
  phone_number?: string;
  chronic_conditions?: string[];
  allergies?: string;
  past_surgeries?: boolean;
  symptom_severity?: string;
  symptom_duration?: string;
  body_system?: string;
  associated_symptoms?: string[];
  pain_scale?: number;
}

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params?.id;

  const [appointment, setAppointment] = useState<ConsultationDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isCanceling, setIsCanceling] = useState<boolean>(false);
  const [cancelSuccess, setCancelSuccess] = useState<string>("");

  const API_BASE = "https://medicareai-1.onrender.com";

  // Helper function to generate Google Calendar URL
  const getGoogleCalendarUrl = (doctorName: string, date: string, time: string, visitReason: string) => {
    if (!date) return "#";
    const cleanDate = date.split("T")[0].replace(/-/g, ""); // e.g. 20260901
    const cleanTime = time ? time.replace(/:/g, "") + "00" : "090000";
    const startDateTime = `${cleanDate}T${cleanTime}`;

    const title = encodeURIComponent(`Consultation with Dr. ${doctorName || "Doctor"}`);
    const details = encodeURIComponent(`Reason for visit: ${visitReason}. Join via MedicareAI Telehealth.`);
    const location = encodeURIComponent("MedicareAI Telehealth Room");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTime}/${startDateTime}&details=${details}&location=${location}`;
  };

  useEffect(() => {
    if (!appointmentId) return;

    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) {
      setErrorMsg("No active session found. Please log in.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    setLoading(true);
    fetch(`${API_BASE}/api/appointments/${appointmentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch appointment details.");
        return res.json();
      })
      .then((data) => {
        setAppointment(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Appointment Detail Fetch Error:", err);
        setErrorMsg("Unable to load appointment details. Please try again.");
        setLoading(false);
      });
  }, [appointmentId, router]);

  const handleCancelAppointment = async () => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) {
      setErrorMsg("Session expired. Please log in.");
      return;
    }

    setIsCanceling(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE}/api/appointments/${appointmentId}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel appointment.");

      setCancelSuccess("Appointment successfully canceled.");
      setTimeout(() => {
        router.push("/patient/dashboard/appointments");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Error canceling appointment.");
      setIsCanceling(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto p-8 text-center text-slate-400 animate-pulse mt-12">
        Loading appointment details...
      </div>
    );
  }

  if (errorMsg && !appointment) {
    return (
      <div className="w-full max-w-3xl mx-auto p-8 mt-12 bg-red-950/80 border border-red-800 text-red-300 rounded-2xl text-center">
        <p className="text-base font-bold mb-4">⚠️ {errorMsg}</p>
        <Link
          href="/patient/dashboard/appointments"
          className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
        >
          Back to Appointments
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-8 space-y-6 my-4 sm:my-8">
      {/* HEADER NAV */}
      <div className="flex items-center justify-between">
        <Link
          href="/patient/dashboard/appointments"
          className="text-xs font-bold text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
        >
          ← Back to Appointments
        </Link>
        <span className="text-xs text-slate-500 font-mono">ID: #{appointmentId}</span>
      </div>

      {/* MAIN DETAILS CARD */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Consultation Overview</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Dr. {appointment?.doctor_name || "Assigned Physician"}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">{appointment?.specialization || appointment?.department || "General Medicine"}</p>
          </div>
          <div>
            <span className="inline-block bg-blue-950 text-blue-300 border border-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase">
              {appointment?.status || "CONFIRMED"}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-950/80 border border-red-800 text-red-300 text-sm rounded-xl">
            ⚠️ {errorMsg}
          </div>
        )}

        {cancelSuccess && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-sm rounded-xl">
            ✅ {cancelSuccess}
          </div>
        )}

        {/* TIMING & ACTIONS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50">
          <div>
            <span className="block text-xs font-bold uppercase text-slate-400 mb-1">Scheduled Date & Time</span>
            <p className="text-base font-semibold text-white">
              {appointment?.appointment_date ? new Date(appointment.appointment_date).toLocaleString() : "Not Specified"}
            </p>
          </div>
          <div className="flex flex-col sm:items-end justify-center gap-2">
            {appointment?.appointment_date && (
              <a
                href={getGoogleCalendarUrl(
                  appointment?.doctor_name || "Doctor",
                  appointment.appointment_date,
                  appointment.appointment_time || "",
                  appointment.reason
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition border border-slate-700"
              >
                📅 Add to Google Calendar
              </a>
            )}
          </div>
        </div>

        {/* CLINICAL QUESTIONNAIRE & SYMPTOMS SUMMARY */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold uppercase text-slate-300 tracking-wider">Clinical Questionnaire & Triage Info</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Body System</span>
              <span className="text-sm font-semibold text-white">{appointment?.body_system || "General / Systemic"}</span>
            </div>
            <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Severity</span>
              <span className="text-sm font-semibold text-white">{appointment?.symptom_severity || "Moderate"}</span>
            </div>
            <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Pain Scale</span>
              <span className="text-sm font-semibold text-white">{appointment?.pain_scale !== undefined ? `${appointment.pain_scale}/10` : "N/A"}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-3">
            <div>
              <span className="block text-xs font-bold uppercase text-slate-400 mb-1">Chief Complaint / Notes</span>
              <p className="text-sm text-slate-300 italic bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                &ldquo;{appointment?.reason || "No detailed notes provided."}&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <span className="text-slate-400 font-bold block mb-1 uppercase">Chronic Conditions:</span>
                <span className="text-slate-200">
                  {Array.isArray(appointment?.chronic_conditions) && appointment.chronic_conditions.length > 0
                    ? appointment.chronic_conditions.join(", ")
                    : "None reported"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-1 uppercase">Allergies:</span>
                <span className="text-slate-200">{appointment?.allergies || "None"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
          <Link
            href={`/patient/dashboard/telehealth/${appointmentId}`}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-center"
          >
            📹 Join Telehealth Room
          </Link>
          <button
            type="button"
            onClick={handleCancelAppointment}
            disabled={isCanceling}
            className="w-full sm:w-auto px-6 py-4 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800 text-xs sm:text-sm font-bold rounded-xl transition text-center cursor-pointer disabled:opacity-50"
          >
            {isCanceling ? "Canceling..." : "Cancel Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}
