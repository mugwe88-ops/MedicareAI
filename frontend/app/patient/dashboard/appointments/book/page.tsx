"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Calendar, Video, Eye, AlertCircle, CheckCircle2 } from "lucide-react";

interface Doctor {
  id: number;
  name: string;
  specialization: string;
}

interface AvailabilitySlot {
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface Consultation {
  id: number | string;
  doctor_name?: string;
  department?: string;
  appointment_date: string;
  appointment_time?: string;
  reason: string;
  status: string;
  telehealth_room_url?: string;
}

const COMMON_SYMPTOMS = [
  "Fever",
  "Fatigue / Weakness",
  "Shortness of Breath",
  "Dizziness",
  "Nausea",
  "Acute Pain",
];

export default function BookAppointmentPage() {
  const router = useRouter();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | null>(null);
  const [reason, setReason] = useState<string>("");

  const [symptomSeverity, setSymptomSeverity] = useState<string>("Moderate");
  const [symptomDuration, setSymptomDuration] = useState<string>("1-3 days");
  const [bodySystem, setBodySystem] = useState<string>("General / Systemic");
  const [associatedSymptoms, setAssociatedSymptoms] = useState<string[]>([]);
  const [painScale, setPainScale] = useState<number>(3);

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loadingConsultations, setLoadingConsultations] = useState<boolean>(true);

  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(true);
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const API_BASE = "https://medicareai-1.onrender.com";

  const getNextDateForDay = (dayName: string): string => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const targetDayIndex = days.findIndex(
      (d) => d.toLowerCase() === dayName.toLowerCase()
    );
    if (targetDayIndex === -1) return new Date().toISOString().split("T")[0];

    const today = new Date();
    const currentDayIndex = today.getDay();
    let distance = targetDayIndex - currentDayIndex;
    if (distance <= 0) distance += 7;

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + distance);

    const year = nextDate.getFullYear();
    const month = String(nextDate.getMonth() + 1).padStart(2, "0");
    const day = String(nextDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getGoogleCalendarUrl = (doctorName: string, date: string, time: string, visitReason: string) => {
    const cleanDate = date.replace(/-/g, "");
    const cleanTime = time.replace(/:/g, "") + "00";
    const startDateTime = `${cleanDate}T${cleanTime}`;
    
    const title = encodeURIComponent(`Consultation with Dr. ${doctorName}`);
    const details = encodeURIComponent(`Reason for visit: ${visitReason}. Body System: ${bodySystem}. Pain Level: ${painScale}/10. Join via MedicareAI.`);
    const location = encodeURIComponent("MedicareAI Telehealth Room");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTime}/${startDateTime}&details=${details}&location=${location}`;
  };

  const handleSymptomToggle = (sym: string) => {
    setAssociatedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const fetchConsultations = async (token: string) => {
    try {
      setLoadingConsultations(true);
      const res = await fetch(`${API_BASE}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load consultations");
      const data = await res.json();
      const apptList = Array.isArray(data) ? data : data.appointments || [];
      setConsultations(apptList);
    } catch (err) {
      console.error("Consultations Fetch Error:", err);
    } finally {
      setLoadingConsultations(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) {
      setErrorMsg("No active session found. Please log in again.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    setLoadingDoctors(true);
    fetch(`${API_BASE}/api/doctors-list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load doctor list");
        return res.json();
      })
      .then((data) => {
        const docList = Array.isArray(data) ? data : data.doctors || [];
        setDoctors(docList);
        setLoadingDoctors(false);
      })
      .catch((err) => {
        console.error("Doctor Fetch Error:", err);
        setErrorMsg("Unable to load doctors list. Please check backend connection.");
        setLoadingDoctors(false);
      });

    fetchConsultations(token);
  }, [router]);

  const handleDoctorSelect = async (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setSelectedSlot(null);
    setErrorMsg("");

    if (!doctorId) {
      setAvailability([]);
      return;
    }

    setLoadingSchedule(true);
    try {
      const res = await fetch(`${API_BASE}/api/doctors/${doctorId}/availability`);
      const data = await res.json();
      setAvailability(Array.isArray(data) ? data : data.availability || []);
    } catch (err) {
      console.error("Availability Fetch Error:", err);
      setAvailability([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedSlot) {
      setErrorMsg("Please select a time slot from the schedule.");
      return;
    }

    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) {
      setErrorMsg("Session expired. Please log in again.");
      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    const calculatedDate = getNextDateForDay(selectedSlot.day);
    const doc = doctors.find((d) => String(d.id) === selectedDoctorId);

    const formattedSymptoms = associatedSymptoms.length > 0 ? associatedSymptoms.join(", ") : "None";
    const comprehensiveReason = [
      reason.trim() ? `Chief Complaint: ${reason}` : "Chief Complaint: General Consultation",
      `Body System: ${bodySystem}`,
      `Severity: ${symptomSeverity}`,
      `Duration: ${symptomDuration}`,
      `Associated Symptoms: ${formattedSymptoms}`,
      `Pain Scale: ${painScale}/10`
    ].join(" | ");

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/appointments/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctor_id: parseInt(selectedDoctorId, 10),
          department: doc?.specialization || "General Medicine",
          appointment_date: calculatedDate,
          appointment_time: selectedSlot.time,
          reason: comprehensiveReason,
          symptom_severity: symptomSeverity,
          symptom_duration: symptomDuration,
          body_system: bodySystem,
          associated_symptoms: associatedSymptoms,
          pain_scale: painScale,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      setSuccessMsg(`Appointment booked for ${selectedSlot.day} (${calculatedDate}) at ${selectedSlot.time}!`);
      
      await fetchConsultations(token);
      
      setSelectedSlot(null);
      setReason("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to issue appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 w-full max-w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <button
            onClick={() => router.back()}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft size={14} /> Back to Appointments
          </button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Book Appointment
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Secure Clinical Entry
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3.5 py-2 rounded-xl text-xs font-bold self-start sm:self-auto">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>Encrypted Gateway</span>
        </div>
      </div>

      {/* Main Booking Form */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm max-w-4xl">
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{successMsg}</span>
            </div>
            {selectedSlot && selectedDoctorId && (
              <div>
                {(() => {
                  const doc = doctors.find((d) => String(d.id) === selectedDoctorId);
                  const docName = doc ? doc.name : "Doctor";
                  const calUrl = getGoogleCalendarUrl(
                    docName,
                    getNextDateForDay(selectedSlot.day),
                    selectedSlot.time,
                    reason || "General Consultation"
                  );

                  return (
                    <a
                      href={calUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      <Calendar size={14} /> Add to Google Calendar
                    </a>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SELECT DOCTOR */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">
              Select Doctor
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => handleDoctorSelect(e.target.value)}
              disabled={loadingDoctors}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition disabled:opacity-50"
            >
              <option value="">
                {loadingDoctors ? "Loading doctor list..." : "-- Select Doctor --"}
              </option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.name} ({doc.specialization || "General Medicine"})
                </option>
              ))}
            </select>
          </div>

          {/* AVAILABILITY SLOTS */}
          {selectedDoctorId && (
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-600" /> Click Available Slot to Book
              </label>
              {loadingSchedule ? (
                <p className="text-xs text-slate-400 font-medium p-4 bg-slate-50 rounded-2xl border border-slate-200/60 animate-pulse">
                  Loading schedule availability...
                </p>
              ) : availability.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availability.map((s, idx) => {
                    const startTimeClean = s.start_time.slice(0, 5);
                    const isSelected =
                      selectedSlot?.day === s.day_of_week && selectedSlot?.time === startTimeClean;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setSelectedSlot({
                            day: s.day_of_week,
                            time: startTimeClean,
                          })
                        }
                        className={`p-4 rounded-2xl text-left border transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                            : "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xs font-black flex items-center justify-between">
                          <span>🕒 {s.day_of_week}</span>
                          {isSelected && (
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                              Selected
                            </span>
                          )}
                        </span>
                        <span className={`text-xs mt-1 font-mono font-medium ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                          {startTimeClean} - {s.end_time.slice(0, 5)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-amber-700 font-bold p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  ⚠️ Doctor has not set availability hours yet.
                </p>
              )}
            </div>
          )}

          {/* 3 COLUMN INPUTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">
                Body System
              </label>
              <select
                value={bodySystem}
                onChange={(e) => setBodySystem(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              >
                <option value="General / Systemic">General / Systemic</option>
                <option value="Respiratory">Respiratory</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Gastrointestinal">Gastrointestinal</option>
                <option value="Neurological">Neurological</option>
                <option value="Musculoskeletal">Musculoskeletal</option>
                <option value="Dermatological">Dermatological</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">
                Symptom Severity
              </label>
              <select
                value={symptomSeverity}
                onChange={(e) => setSymptomSeverity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">
                Symptom Duration
              </label>
              <select
                value={symptomDuration}
                onChange={(e) => setSymptomDuration(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              >
                <option value="Less than 24 hours">Less than 24 hours</option>
                <option value="1-3 days">1-3 days</option>
                <option value="3-7 days">3-7 days</option>
                <option value="1+ weeks">1+ weeks</option>
              </select>
            </div>
          </div>

          {/* ASSOCIATED SYMPTOMS */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">
              Common Associated Symptoms (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map((sym) => {
                const active = associatedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => handleSymptomToggle(sym)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/80"
                    }`}
                  >
                    {active ? "✓ " : "+ "} {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PAIN SCALE */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Pain Scale (0 = None, 10 = Unbearable)
              </label>
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                painScale <= 3
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : painScale <= 6
                  ? "bg-amber-50 text-amber-700 border-amber-100"
                  : "bg-rose-50 text-rose-700 border-rose-100"
              }`}>
                Level: {painScale} / 10
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={painScale}
              onChange={(e) => setPainScale(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 bg-slate-200 rounded-lg h-2 cursor-pointer"
            />
          </div>

          {/* REASON FOR VISIT */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">
              Reason for Visit / Detailed Symptoms
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your symptoms in detail..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition resize-none"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!selectedDoctorId || !selectedSlot || isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Booking Appointment...
                </>
              ) : (
                "Confirm & Book Appointment"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* CONSULTATIONS LIST */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm max-w-4xl space-y-4">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Your Consultations</h3>

        {loadingConsultations ? (
          <p className="text-xs text-slate-400 font-medium animate-pulse">Loading your booked consultations...</p>
        ) : consultations.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium">No booked appointments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-black text-slate-400 border-b border-slate-100 uppercase tracking-wider">
                  <th className="pb-3">Doctor / Dept</th>
                  <th className="pb-3">Visit Timing</th>
                  <th className="pb-3">Medical Reason</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                {consultations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 font-bold text-slate-900">
                      <Link 
                        href={`/patient/dashboard/appointments/${item.id}`}
                        className="hover:text-blue-600 transition"
                      >
                        {item.doctor_name || "Doctor"}
                      </Link>
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.department || "General Medicine"}</span>
                    </td>
                    <td className="py-4 text-slate-600">
                      {item.appointment_date ? `${item.appointment_date.split('T')[0]} at ${item.appointment_time || ''}` : 'Not Scheduled'}
                    </td>
                    <td className="py-4">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[11px] font-medium italic">
                        "{item.reason}"
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {item.status || 'CONFIRMED'}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <Link
                        href={`/patient/dashboard/appointments/${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200/60"
                      >
                        <Eye size={12} /> Details
                      </Link>
                      <Link
                        href={`/patient/dashboard/telehealth/${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        <Video size={12} /> Join Room
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}