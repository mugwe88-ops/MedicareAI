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

  // Form State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [reason, setReason] = useState<string>("");

  // UI Status State
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // 1. Fetch Doctor List on Mount
  useEffect(() => {
    fetch("/api/doctors-list")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load doctor list");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setDoctors(data);
        }
      })
      .catch((err) => {
        console.error("Error fetching doctors:", err);
        setErrorMsg("Unable to load doctors list. Please refresh.");
      });
  }, []);

  // 2. Fetch Active Availability Schedule when a Doctor is Selected
  useEffect(() => {
    if (!selectedDoctorId) {
      setAvailability([]);
      setAvailableTimeSlots([]);
      setSelectedDate("");
      setSelectedTime("");
      return;
    }

    setLoadingSchedule(true);
    setErrorMsg("");
    setSuccessMsg("");

    fetch(`/api/doctors/${selectedDoctorId}/availability`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load schedule");
        return res.json();
      })
      .then((data) => {
        setAvailability(Array.isArray(data) ? data : []);
        setLoadingSchedule(false);
      })
      .catch((err) => {
        console.error("Error fetching schedule:", err);
        setAvailability([]);
        setLoadingSchedule(false);
      });
  }, [selectedDoctorId]);

  // 3. Generate Available Time Slots based on Chosen Date & Doctor Schedule
  useEffect(() => {
    if (!selectedDate || availability.length === 0) {
      setAvailableTimeSlots([]);
      setSelectedTime("");
      return;
    }

    // Determine day of week from selected date (e.g. "Sunday")
    const [year, month, day] = selectedDate.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });

    // Filter schedule slots matching the chosen day
    const matchingSlots = availability.filter(
      (slot) => slot.day_of_week.toLowerCase() === dayName.toLowerCase()
    );

    if (matchingSlots.length === 0) {
      setAvailableTimeSlots([]);
      setSelectedTime("");
      return;
    }

    // Generate hourly bookable intervals (e.g. "09:00", "10:00", ...)
    const slots: string[] = [];
    matchingSlots.forEach((slot) => {
      const startHour = parseInt(slot.start_time.split(":")[0], 10);
      const endHour = parseInt(slot.end_time.split(":")[0], 10);

      for (let hour = startHour; hour < endHour; hour++) {
        const timeFormatted = `${hour.toString().padStart(2, "0")}:00`;
        slots.push(timeFormatted);
      }
    });

    setAvailableTimeSlots(slots);
  }, [selectedDate, availability]);

  // 4. Handle Appointment Booking Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!selectedDoctorId || !selectedDate || !selectedTime || !reason.trim()) {
      setErrorMsg("Please fill out all fields before submitting.");
      return;
    }

    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) {
      setErrorMsg("Authentication session expired. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/appointments/book", {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit booking request.");
      }

      setSuccessMsg("Appointment booked successfully! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      console.error("Booking error:", err);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800">
      <h2 className="text-3xl font-extrabold text-white">Book Appointment</h2>
      <p className="text-sm text-blue-400 mb-6 font-medium tracking-wide uppercase">
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
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full p-3.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          >
            <option value="">-- Select Doctor --</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                Dr. {doc.name} ({doc.specialization || "General Medicine"})
              </option>
            ))}
          </select>
        </div>

        {/* ACTIVE PRACTICE HOURS SUMMARY BADGE */}
        {selectedDoctorId && (
          <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl">
            <span className="text-xs font-bold uppercase text-slate-400 block mb-2">
              📅 Doctor's Active Practice Schedule
            </span>
            {loadingSchedule ? (
              <p className="text-xs text-slate-400 animate-pulse">
                Loading schedule availability...
              </p>
            ) : availability.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availability.map((slot, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-950/80 border border-blue-700/50 text-blue-300 text-xs font-medium rounded-full"
                  >
                    🕒 {slot.day_of_week}: {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-400 font-medium">
                ⚠️ This doctor has not set active practice hours yet.
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
            className="w-full p-3.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-750"
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
                : "❌ Doctor is not available on this day. Please pick another date."}
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
            className="w-full p-3.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={!selectedDoctorId || !selectedDate || !selectedTime || !reason.trim() || isSubmitting}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:shadow-none"
        >
          {isSubmitting ? "BOOKING APPOINTMENT..." : "CONFIRM BOOKING 🚀"}
        </button>
      </form>
    </div>
  );
}