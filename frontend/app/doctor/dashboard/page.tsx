"use client";
import { useState, useEffect } from "react";

// 1. Define the shape of your data
interface Appointment {
  id: number;
  patient_name: string;
  phone: string;
  appointment_time: string;
  status: string;
  reason: string;
}

export default function DoctorDashboard() {
  // 2. Explicitly tell the state it will hold an array of Appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://medicareai-1.onrender.com/api/appointments")
      .then((res) => res.json())
      .then((data) => {
        // Now TypeScript knows 'data' matches 'Appointment[]'
        setAppointments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      {/* ... rest of your UI header and table ... */}
    </>
  );
}