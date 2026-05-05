"use client"; // This must be at the very top

import React, { useState } from 'react';

interface Doctor {
  id: number;
  name: string;
  spec: string;
  rating: number;
}

export default function Doctors() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState("");

  const doctors: Doctor[] = [
    { id: 1, name: "Dr. John Doe", spec: "Cardiologist", rating: 4.8 }, 
    { id: 2, name: "Dr. Jane Smith", spec: "Dermatologist", rating: 4.6 },
    { id: 3, name: "Dr. Ahmed Ali", spec: "Pediatrician", rating: 4.9 },
  ];

  const handleBook = async () => {
    if (!selectedDoctor || !bookingDate) {
      alert("Please select a date and time.");
      return;
    }

    const payload = {
      patient_id: 1, 
      doctor_id: selectedDoctor.id, 
      appointment_time: bookingDate,
      phone: "0723503988",
      reason: "General Consultation"
    };

    try {
      const res = await fetch("https://medicareai-1.onrender.com/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(`Success! Appointment booked with ${selectedDoctor.name}`);
        setSelectedDoctor(null);
      }
    } catch (err) {
      console.error("Booking error:", err);
    }
  };

  // The return statement must return JSX for TypeScript to recognize this as a component
  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {doctors.map((d) => (
            <div key={d.id} className="p-6 border rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold">{d.name}</h3>
              <p className="text-blue-600">{d.spec}</p>
              <button 
                onClick={() => setSelectedDoctor(d)}
                className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg"
              >
                Book Now
              </button>
            </div>
          ))}
        </div>

        {selectedDoctor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-2xl max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Confirm with {selectedDoctor.name}</h3>
              <input 
                type="datetime-local" 
                className="w-full border p-2 rounded mb-4"
                onChange={(e) => setBookingDate(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={() => setSelectedDoctor(null)} className="flex-1 border py-2 rounded">Cancel</button>
                <button onClick={handleBook} className="flex-1 bg-blue-600 text-white py-2 rounded">Confirm</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}