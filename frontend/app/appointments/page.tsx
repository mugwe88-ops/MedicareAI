"use client";

import { useState, useEffect } from "react";

interface Slot {
  day_of_week: string;
  start_time: string;
  end_time: string;
}

export default function BookAppointmentPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [availability, setAvailability] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  // 1. Fetch doctor availability when doctor changes
  useEffect(() => {
    if (!selectedDoctorId) return;

    fetch(`/api/doctors/${selectedDoctorId}/availability`)
      .then((res) => res.json())
      .then((data) => {
        setAvailability(data);
      })
      .catch((err) => console.error("Error fetching slots:", err));
  }, [selectedDoctorId]);

  // 2. Generate time slots based on selected date and doctor schedule
  useEffect(() => {
    if (!selectedDate || availability.length === 0) {
      setTimeSlots([]);
      return;
    }

    const dateObj = new Date(selectedDate);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[dateObj.getDay()];

    // Find slots matching the selected day of the week
    const matchingDay = availability.filter(
      (s) => s.day_of_week.toLowerCase() === dayName.toLowerCase()
    );

    if (matchingDay.length === 0) {
      setTimeSlots([]);
      return;
    }

    // Convert start and end times into 1-hour bookable increments
    const generated: string[] = [];
    matchingDay.forEach((slot) => {
      let startHour = parseInt(slot.start_time.split(":")[0], 10);
      const endHour = parseInt(slot.end_time.split(":")[0], 10);

      while (startHour < endHour) {
        const formattedTime = `${startHour.toString().padStart(2, "0")}:00`;
        generated.push(formattedTime);
        startHour++;
      }
    });

    setTimeSlots(generated);
  }, [selectedDate, availability]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-900 text-white rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Book Appointment</h2>

      {/* Select Doctor */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">SELECT DOCTOR</label>
        <select
          value={selectedDoctorId}
          onChange={(e) => setSelectedDoctorId(e.target.value)}
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
        >
          <option value="">Choose a Specialist...</option>
          {doctors.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.name} ({doc.specialization})
            </option>
          ))}
        </select>
      </div>

      {/* Preferred Date */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">PREFERRED DATE</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
        />
      </div>

      {/* Dynamic Available Time Slots */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">AVAILABLE TIME SLOTS</label>
        {timeSlots.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setSelectedTime(time)}
                className={`p-3 rounded-lg text-center font-medium border ${
                  selectedTime === time
                    ? "bg-blue-600 border-blue-400 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-amber-400 bg-amber-950/40 p-3 rounded-lg border border-amber-800/50">
            {selectedDate
              ? "No available practice slots for this day."
              : "Select a doctor and date to view available practice slots."}
          </p>
        )}
      </div>
    </div>
  );
}