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
  const [cancellingId, setCancellingId] = useState<number | string | null>(null);

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

  // Handle Appointment Cancellation
  const handleCancelAppointment = async (id: number | string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) {
      alert("Authentication token missing. Please log in again.");
      router.push("/login");
      return;
    }

    setCancellingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/appointments/${id}`, {
        method: "PUT", 
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!res.ok) {
        const deleteRes = await fetch(`${API_BASE}/api/appointments/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!deleteRes.ok) throw new Error("Failed to cancel appointment.");
      }

      setAppointments((prev) =>
        prev.map((appt) => (appt.id === id ? { ...appt, status: "CANCELLED" } : appt))
      );
    } catch (err: any) {
      console.error("Cancellation Error:", err);
      alert(err.message || "Failed to cancel appointment.");
    } finally {
      setCancellingId(null);
    }
  };

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
      {/* Header section with Title and Restored Book Appointment Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Appointments</h1>
        <Link
          href="/patient/dashboard/appointments/book"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center gap-2"
        >
          + Book Appointment
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-slate-900 text-slate-400 rounded-2xl border border-slate-800 p-8 text-center">
          <p>No appointments found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {appointments.map((appt) => {
            const isCancelled = appt.status?.toUpperCase() === "CANCELLED";
            return (
              <div
                key={appt.id}
                className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-1 max-w-lg">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      isCancelled
                        ? "bg-red-950 text-red-300 border-red-800"
                        : "bg-blue-950 text-blue-300 border-blue-800"
                    }`}
                  >
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
                  {/* Clean truncated display for medical reason */}
                  {appt.reason && (
                    <p className="text-xs text-slate-400 italic truncate max-w-md" title={appt.reason}>
                      Reason: {appt.reason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                  <Link
                    href={`/patient/dashboard/appointments/${appt.id}`}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition text-center border border-slate-700"
                  >
                    View Details
                  </Link>

                  {!isCancelled && (
                    <>
                      <Link
                        href={`/patient/dashboard/telehealth/${appt.id}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition text-center shadow-lg shadow-blue-600/30"
                      >
                        Join Room
                      </Link>

                      <button
                        onClick={() => handleCancelAppointment(appt.id)}
                        disabled={cancellingId === appt.id}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-bold rounded-xl transition text-center border border-red-800/60"
                      >
                        {cancellingId === appt.id ? "Cancelling..." : "Cancel"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
