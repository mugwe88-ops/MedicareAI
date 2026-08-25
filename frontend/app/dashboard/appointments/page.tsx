"use client";

import { useState, useEffect } from "react";

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
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");

  // 1. Fetch Doctor List on Mount
  useEffect(() => {
    fetch("/api/doctors-list")
      .then((res) => res.json())
      .then((data) => setDoctors(data))
      .catch((err) => console.error("Failed to load doctors:", err));
  }, []);

  // 2. Fetch Active Schedule whenever a Doctor is Selected
  useEffect(() => {
    if (!selectedDoctorId) {
      setAvailability([]);
      setAvailableTimeSlots([]);
      setSelectedDate("");
      setSelectedTime("");
      return;
    }

    setLoading(true);
    fetch(`/api/doctors/${selectedDoctorId}/availability`)
      .then((res) => res.json())
      .then((data) => {
        setAvailability(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching schedule:", err);
        setLoading(false);
      });
  }, [selectedDoctorId]);

  // 3. Generate Time Slots based on Selected Date and Doctor's Active Days
  useEffect(() => {
    if (!selectedDate || availability.length === 0) {
      setAvailableTimeSlots([]);
      return;
    }

    // Determine Day Name (e.g., "Sunday")
    const dateObj = new Date(selectedDate);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });

    // Filter slots matching the chosen day
    const activeSlots = availability.filter(
      (slot) => slot.day_of_week.toLowerCase() === dayName.toLowerCase()
    );

    if (activeSlots.length === 0) {
      setAvailableTimeSlots([]);
      setSelectedTime("");
      return;
    }

    // Generate hourly bookable slots (e.g. 09:00, 10:00, ...)
    const slots: string[] = [];
    activeSlots.forEach((slot) => {
      const startHour = parseInt(slot.start_time.split(":")[0], 10);
      const endHour = parseInt(slot.end_time.split(":")[0], 10);

      for (let h = startHour; h < endHour; h++) {
        const timeFormatted = `${h.toString().padStart(2, "0")}:00`;
        slots.push(timeFormatted);
      }
    });

    setAvailableTimeSlots(slots);
  }, [selectedDate, availability]);

  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800">
      <h2 className="text-3xl font-extrabold text-white">Book Appointment</h2>
      <p className="text-sm text-blue-400 mb-6 font-medium tracking-wide uppercase">
        Secure Clinical Entry
      </p>

      <form className="space-y-6">
        {/* SELECT DOCTOR */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
            Select Doctor
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full p-3.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">-- Select Doctor --</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.specialization || "General Medicine"})
              </option>
            ))}
          </select>
        </div>

        {/* ACTIVE PRACTICE HOURS BADGE */}
        {selectedDoctorId && (
          <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl">
            <span className="text-xs font-bold uppercase text-slate-400 block mb-2">
              📅 Doctor's Weekly Availability Schedule
            </span>
            {loading ? (
              <p className="text-xs text-slate-400">Loading schedule...</p>
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
                ⚠️ Doctor has not configured practice availability slots yet.
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
            className="w-full p-3.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white outline-none disabled:opacity-50"
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
                : "❌ Doctor is not available on the selected day. Please pick another date."}
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
            className="w-full p-3.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={!selectedDoctorId || !selectedDate || !selectedTime}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:shadow-none"
        >
          CONFIRM BOOKING 🚀
        </button>
      </form>
    </div>
  );
}