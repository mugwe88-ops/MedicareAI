"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

export default function BookAppointmentPage() {
  const router = useRouter();

  // Form & Data State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  
  // Directly selected schedule info
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | null>(null);
  const [reason, setReason] = useState<string>("");

  // UI State
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(true);
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const API_BASE = "https://medicareai-1.onrender.com";

  // Helper function to calculate the next calendar date matching a day name (e.g. "Tuesday")
  const getNextDateForDay = (dayName: string): string => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const targetDayIndex = days.findIndex(
      (d) => d.toLowerCase() === dayName.toLowerCase()
    );
    if (targetDayIndex === -1) return new Date().toISOString().split("T")[0];

    const today = new Date();
    const currentDayIndex = today.getDay();
    let distance = targetDayIndex - currentDayIndex;
    if (distance <= 0) distance += 7; // Target next upcoming instance of that day

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + distance);

    const year = nextDate.getFullYear();
    const month = String(nextDate.getMonth() + 1).padStart(2, "0");
    const day = String(nextDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to generate a direct Google Calendar URL
  const getGoogleCalendarUrl = (doctorName: string, date: string, time: string, visitReason: string) => {
    const cleanDate = date.replace(/-/g, ""); // e.g. 20260901
    const cleanTime = time.replace(/:/g, "") + "00"; // e.g. 100000
    const startDateTime = `${cleanDate}T${cleanTime}`;
    
    const title = encodeURIComponent(`Consultation with Dr. ${doctorName}`);
    const details = encodeURIComponent(`Reason for visit: ${visitReason}. Join via MedicareAI.`);
    const location = encodeURIComponent("MedicareAI Telehealth Room");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTime}/${startDateTime}&details=${details}&location=${location}`;
  };

  // 1. Load Doctor List on Mount & Verify Session Token
  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) {
      setErrorMsg("No active session found. Please log in again.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    setLoadingDoctors(true);
    fetch(`${API_BASE}/api/doctors-list`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load doctor list");
        return res.json();
      })
      .then((data) => {
        setDoctors(Array.isArray(data) ? data : []);
        setLoadingDoctors(false);
      })
      .catch((err) => {
        console.error("Doctor Fetch Error:", err);
        setErrorMsg("Unable to load doctors list. Please check backend connection.");
        setLoadingDoctors(false);
      });
  }, [router]);

  // 2. Fetch Active Schedule when Doctor is Selected
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
      setAvailability(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Availability Fetch Error:", err);
      setAvailability([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // 3. Handle Appointment Booking Submission
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
          appointment_date: calculatedDate,
          appointment_time: selectedSlot.time,
          reason: reason.trim() || "General Consultation",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      setSuccessMsg(`Appointment booked for ${selectedSlot.day} (${calculatedDate}) at ${selectedSlot.time}!`);
      setTimeout(() => router.push("/dashboard/appointments"), 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to issue appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-8 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl my-4 sm:my-8">
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
        {/* SELECT DOCTOR */}
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

        {/* CLICK-TO-SELECT PRACTICE SCHEDULE */}
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

        {/* REASON FOR VISIT */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
            Reason for Visit
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe your symptoms..."
            className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm sm:text-base"
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={!selectedDoctorId || !selectedSlot || isSubmitting}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:shadow-none"
        >
          {isSubmitting
            ? "BOOKING..."
            : selectedSlot
            ? `CONFIRM BOOKING FOR ${selectedSlot.day.toUpperCase()} @ ${selectedSlot.time} 🚀`
            : "SELECT A SLOT TO BOOK 🚀"}
        </button>
      </form>
    </div>
  );
}