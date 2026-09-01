"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function AppointmentsPage() {
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
      
      // Instantly re-fetch appointments list to include the newly booked item without full reload
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
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 space-y-8 my-4 sm:my-8">
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Book Appointment</h2>
        <p className="text-xs sm:text-sm text-blue-400 mb-6 font-medium uppercase tracking-wide">
          Secure Clinical Entry
        </p>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/80 border border-red-800 text-red-300 text-sm rounded-xl">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-sm rounded-xl space-y-3">
            <p>✅ {successMsg}</p>
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
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-all border border-emerald-700 shadow-md"
                    >
                      📅 Add to Google Calendar
                    </a>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
              Select Doctor
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => handleDoctorSelect(e.target.value)}
              disabled={loadingDoctors}
              className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm sm:text-base"
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

          {selectedDoctorId && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                📅 Click Available Slot to Book
              </label>
              {loadingSchedule ? (
                <p className="text-xs text-slate-400 animate-pulse p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
                  Loading availability...
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
                        className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400"
                            : "bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500/60 hover:bg-slate-750"
                        }`}
                      >
                        <span className="text-sm font-bold flex items-center justify-between">
                          <span>🕒 {s.day_of_week}</span>
                          {isSelected && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md font-semibold">Selected</span>}
                        </span>
                        <span className="text-xs text-slate-400 mt-1 font-mono">
                          {startTimeClean} - {s.end_time.slice(0, 5)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-amber-400 font-medium p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
                  ⚠️ Doctor has not set availability hours yet.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                Body System
              </label>
              <select
                value={bodySystem}
                onChange={(e) => setBodySystem(e.target.value)}
                className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                Symptom Severity
              </label>
              <select
                value={symptomSeverity}
                onChange={(e) => setSymptomSeverity(e.target.value)}
                className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                Symptom Duration
              </label>
              <select
                value={symptomDuration}
                onChange={(e) => setSymptomDuration(e.target.value)}
                className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="Less than 24 hours">Less than 24 hours</option>
                <option value="1-3 days">1-3 days</option>
                <option value="3-7 days">3-7 days</option>
                <option value="1+ weeks">1+ weeks</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
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
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      active
                        ? "bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-500/20"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    {active ? "✓ " : "+ "} {sym}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase text-slate-400">
                Pain Scale (0 = None, 10 = Unbearable)
              </label>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                painScale <= 3 ? "bg-emerald-950 text-emerald-300 border border-emerald-800" :
                painScale <= 6 ? "bg-amber-950 text-amber-300 border border-amber-800" :
                "bg-red-950 text-red-300 border border-red-800"
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
              className="w-full accent-blue-500 bg-slate-800 cursor-pointer h-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
              Reason for Visit / Detailed Symptoms
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your symptoms in detail..."
              className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm sm:text-base"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedDoctorId || !selectedSlot || isSubmitting}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
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
        </form>
      </div>

      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8">
        <h3 className="text-xl font-bold text-white mb-4">Your Consultations</h3>

        {loadingConsultations ? (
          <p className="text-xs text-slate-400 animate-pulse">Loading your booked consultations...</p>
        ) : consultations.length === 0 ? (
          <p className="text-xs text-slate-400">No booked appointments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-medium">DOCTOR / DEPT</th>
                  <th className="pb-3 font-medium">VISIT TIMING</th>
                  <th className="pb-3 font-medium">MEDICAL REASON</th>
                  <th className="pb-3 font-medium">STATUS</th>
                  <th className="pb-3 font-medium text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                {consultations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50">
                    <td className="py-4 font-semibold text-white">
                      <Link 
                        href={`/patient/dashboard/appointments/${item.id}`}
                        className="hover:text-blue-400 transition"
                      >
                        {item.doctor_name || "Doctor"}
                      </Link>
                      <span className="block text-xs font-normal text-slate-400">{item.department || "General Medicine"}</span>
                    </td>
                    <td className="py-4 text-slate-300 text-xs">
                      {item.appointment_date ? `${item.appointment_date.split('T')[0]} at ${item.appointment_time || ''}` : 'Not Scheduled'}
                    </td>
                    <td className="py-4">
                      <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs italic">
                        "{item.reason}"
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="bg-blue-950 text-blue-300 border border-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {item.status || 'CONFIRMED'}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <Link
                        href={`/patient/dashboard/appointments/${item.id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition border border-slate-700"
                      >
                        Details
                      </Link>
                      <Link
                        href={`/patient/dashboard/telehealth/${item.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition shadow-sm"
                      >
                        📹 Join Room
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