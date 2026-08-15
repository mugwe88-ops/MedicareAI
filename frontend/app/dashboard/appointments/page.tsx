"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, Plus, AlertCircle, CheckCircle } from "lucide-react";

interface Appointment {
  id: number;
  department?: string;
  appointment_date?: string;
  appointment_time?: string;
  reason?: string;
  status: string;
  patient_name?: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      const res = await fetch("https://medicareai-1.onrender.com/api/my-appointments", {
        headers: {
          Authorization: `Bearer ${token || ""}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load appointments:", err);
      setError("Unable to retrieve appointments. Please check your backend connection.");
      setAppointments([]);
    } finally {
      // Guarantees loading state is disabled regardless of API outcome
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-slate-500 text-sm">
            View and manage your scheduled consultations with healthcare providers.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm">
          <Plus size={16} /> Book Appointment
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Querying medical records ledger...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex items-start gap-4 text-red-700">
          <AlertCircle size={24} className="shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-semibold text-sm">{error}</p>
            <button
              onClick={fetchAppointments}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-800 font-bold px-3 py-1.5 rounded-lg transition"
            >
              Retry Connection
            </button>
          </div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <Calendar size={48} className="mx-auto text-slate-300" />
          <div>
            <h3 className="font-bold text-slate-800 text-lg">No Appointments Scheduled</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              You currently have no upcoming or past medical appointments registered.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition space-y-3"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-900 text-base">
                  {apt.department || "General Consultation"}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 capitalize">
                  <CheckCircle size={12} /> {apt.status || "Confirmed"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500">
                <p className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  {apt.appointment_date || "Date Pending"} at {apt.appointment_time || "Time Pending"}
                </p>
                {apt.reason && (
                  <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600 text-xs mt-2">
                    <span className="font-semibold text-slate-700">Reason:</span> {apt.reason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}