import React, { useState } from 'react';

// 1. Define the Doctor interface to fix the TypeScript 'never' error
interface Doctor {
  id: number;
  name: string;
  spec: string;
  rating: number;
}

export default function Doctors() {
  // 2. Tell the state it can be a Doctor or null
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState("");

  const doctors: Doctor[] = [
    { id: 1, name: "Dr. John Doe", spec: "Cardiologist", rating: 4.8 }, 
    { id: 2, name: "Dr. Jane Smith", spec: "Dermatologist", rating: 4.6 },
    { id: 3, name: "Dr. Ahmed Ali", spec: "Pediatrician", rating: 4.9 },
  ];

  const handleBook = async () => {
    // 3. Add a check to satisfy TypeScript that selectedDoctor is not null here
    if (!selectedDoctor || !bookingDate) {
      alert("Please select a doctor and a date.");
      return;
    }

    const payload = {
      patient_id: 1, // William Weru's ID
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
        alert(`Appointment with ${selectedDoctor.name} Booked!`);
        setSelectedDoctor(null);
      }
    } catch (err) {
      console.error("Booking failed", err);
    }
  };

  // ... (Rest of your return/JSX code remains the same)
}