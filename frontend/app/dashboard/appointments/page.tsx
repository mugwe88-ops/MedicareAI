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
  
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [reason, setReason] = useState<string>("");

  // UI State
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(true);
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const API_BASE = "https://medicareai-1.onrender.com";

  // 1. Load Doctor List on Mount
  useEffect(() => {
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
  }, []);

  // 2. Fetch Active Schedule when Doctor is Selected
  const handleDoctorSelect = async (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setSelectedDate("");
    setSelectedTime("");
    setAvailableTimeSlots([]);
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

  // 3. Compute Available Hourly Time Slots when Date Changes
  useEffect(() => {
    if (!selectedDate || availability.length === 0) {
      setAvailableTimeSlots([]);
      setSelectedTime("");
      return;
    }

    const [year, month, day] = selectedDate.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });

    const activeSlots = availability.filter(
      (s) => s.day_of_week.toLowerCase() === dayName.toLowerCase()
    );

    if (activeSlots.length === 0) {
      setAvailableTimeSlots([]);
      setSelectedTime("");
      return;
    }

    const slots: string[] = [];
    activeSlots.forEach((slot) => {
      const start = parseInt(slot.start_time.split(":")[0], 10);
      const end = parseInt(slot.end_time.split(":")[0], 10);
      for (let h = start; h < end; h++) {
        slots.push(`${h.toString().padStart(2, "0")}:00`);
      }
    });

    setAvailableTimeSlots(slots);
  }, [selectedDate, availability]);

  // 4. Submit Appointment Booking
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) {
      setErrorMsg("Session expired. Please log in again.");
      return;
    }

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
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      setSuccessMsg("Appointment booked successfully! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to issue appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl">
      <h2 className="text-3xl font-extrabold text-white">Book Appointment</h2>
      <p className="text-sm text-blue-400 mb-6 font-medium uppercase tracking-wide">
        Secure Clinical Entry
      </p>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-950/80 border border-red-800 text-red-300 text-sm rounded-xl">
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-sm rounded-xl">
          ✅ {successMsg}
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
            className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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

        {/* ACTIVE PRACTICE HOURS SUMMARY */}
        {selectedDoctorId && (
          <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl">
            <span className="text-xs font-bold uppercase text-slate-400 block mb-2">
              📅 Active Practice Schedule
            </span>
            {loadingSchedule ? (
              <p className="text-xs text-slate-400 animate-pulse">Loading availability...</p>
            ) : availability.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availability.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-950 border border-blue-700/50 text-blue-300 text-xs rounded-full font-medium"
                  >
                    🕒 {s.day_of_week}: {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-400 font-medium">
                ⚠️ Doctor has not set availability hours yet.
              </p>
            )}
          </div>
        )}

        {/* PREFERRED DATE */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
            Preferred Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={!selectedDoctorId}
            className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
          />
        </div>

        {/* DYNAMIC TIME SLOTS */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
            Available Time Slots
          </label>
          {availableTimeSlots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {availableTimeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                    selectedTime === time
                      ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl text-xs text-slate-400">
              {!selectedDoctorId
                ? "Select a doctor first to view available time slots."
                : !selectedDate
                ? "Select a date matching the doctor's active days above."
                : "❌ Doctor is not available on this day. Pick another date."}
            </div>
          )}
        </div>

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
            className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={!selectedDoctorId || !selectedDate || !selectedTime || !reason.trim() || isSubmitting}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:shadow-none"
        >
          {isSubmitting ? "BOOKING..." : "CONFIRM BOOKING 🚀"}
        </button>
      </form>
    </div>
  );
}