"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Appointment {
  id: number | string;
  doctor_name?: string;
  specialization?: string;
  department?: string;
  appointment_date: string;
  appointment_time?: string;
  reason: string;
  status: string;
  telehealth_room_url?: string;
}

export default function AppointmentsListPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const API_BASE = "https://medicareai-1.onrender.com";

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) {
      setErrorMsg("No active session found. Please log in.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    setLoading(true);
    fetch(`${API_BASE}/api/appointments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch appointments.");
        return res.json();
      })
      .then((data) => {
        setAppointments(Array.isArray(data) ? data : data.appointments || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Appointments Fetch Error:", err);
        setErrorMsg("Unable to load appointments. Please try again.");
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center text-slate-400 animate-pulse mt-12">
        Loading appointments...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 mt-12 bg-red-950/80 border border-red-800 text-red-300 rounded-2xl text-center">
        <p className="text-base font-bold mb-4">⚠️ {errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 space-y-6 my-4 sm:my-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Appointments</h1>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-slate-900 text-slate-400 rounded-2xl border border-slate-800 p-8 text-center">
          <p>No appointments found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="space-y-1">
                <span className="inline-block bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                  {appt.status || "CONFIRMED"}
                </span>
                <h3 className="text-xl font-bold text-white">
                  Dr. {appt.doctor_name || "Assigned Physician"}
                </h3>
                <p className="text-xs text-slate-400">
                  {appt.specialization || appt.department || "General Medicine"}
                </p>
                <p className="text-xs text-slate-300 font-semibold pt-1">
                  📅 {appt.appointment_date ? new Date(appt.appointment_date).toLocaleString() : "Not Specified"}
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href={`/patient/dashboard/appointments/${appt.id}`}
                  className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition text-center border border-slate-700"
                >
                  View Details
                </Link>
                <Link
                  href={`/patient/dashboard/telehealth/${appt.id}`}
                  className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition text-center shadow-lg shadow-blue-600/30"
                >
                  Join Room
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
