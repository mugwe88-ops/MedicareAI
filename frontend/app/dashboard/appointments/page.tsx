"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Plus, AlertCircle, CheckCircle, X, User, Video } from "lucide-react";

interface Appointment {
  id: number;
  department?: string;
  doctor_name?: string;
  doctor_id?: number;
  appointment_date?: string;
  appointment_time?: string;
  reason?: string;
  status: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization?: string;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    department: "General Medicine",
    doctor_id: "",
    appointment_date: getTodayString(),
    appointment_time: "09:00",
    reason: "",
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      fetchDoctors(formData.department);
    }
  }, [formData.department, isModalOpen]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("https://medicareai-1.onrender.com/api/my-appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Server status ${res.status}`);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to fetch appointments:", err);
      setError("Unable to retrieve appointments. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async (dept: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(
        `https://medicareai-1.onrender.com/api/doctors-list?specialization=${encodeURIComponent(dept)}`,
        {
          headers: {
            Authorization: `Bearer ${token || ""}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setDoctors(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load doctors:", err);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setBookingError(null);

    if (!formData.doctor_id) {
      setBookingError("Please select a specific doctor for your consultation.");
      setSubmitting(false);
      return;
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch("https://medicareai-1.onrender.com/api/my-appointments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        // Prioritize structured validation errors over raw details
        throw new Error(data.error || data.details || "Failed to schedule appointment.");
      }

      setIsModalOpen(false);
      setFormData({
        department: "General Medicine",
        doctor_id: "",
        appointment_date: getTodayString(),
        appointment_time: "09:00",
        reason: "",
      });
      await fetchAppointments();
    } catch (err: any) {
      setBookingError(err.message || "An error occurred while booking.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return "Date Pending";
    const cleanDate = dateStr.split("T")[0];
    const [year, month, day] = cleanDate.split("-");
    if (!year || !month || !day) return dateStr;
    const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatDisplayTime = (timeStr?: string) => {
    if (!timeStr) return "Time Pending";
    const [hours, minutes] = timeStr.split(":");
    if (!hours || !minutes) return timeStr;
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-slate-500 text-sm">
            View and manage your scheduled consultations with healthcare providers.
          </p>
        </div>
        <button
          onClick={() => {
            setBookingError(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm"
        >
          <Plus size={16} /> Book Appointment
        </button>
      </div>

      {/* List Content */}
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
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {apt.department || "General Consultation"}
                    </h3>
                    {apt.doctor_name && (
                      <p className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-0.5">
                        <User size={12} /> Dr. {apt.doctor_name}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 capitalize">
                    <CheckCircle size={12} /> {apt.status || "Confirmed"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500">
                  <p className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    {formatDisplayDate(apt.appointment_date)} at {formatDisplayTime(apt.appointment_time)}
                  </p>
                  {apt.reason && (
                    <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600 text-xs mt-2">
                      <span className="font-semibold text-slate-700">Reason:</span> {apt.reason}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => router.push(`/telehealth/${apt.id}`)}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-sm"
              >
                <Video size={14} className="text-blue-400" /> Join Video Consultation
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Book New Appointment</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {bookingError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department / Specialty
                </label>
                <select
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value, doctor_id: "" })
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                >
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Gynaecology">Gynaecology</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Doctor <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.doctor_id}
                  onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                >
                  <option value="" disabled>
                    -- Select an available doctor --
                  </option>
                  {doctors.length === 0 ? (
                    <option value="" disabled>
                      No doctors currently available in this department
                    </option>
                  ) : (
                    doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        Dr. {doc.name} {doc.specialization ? `(${doc.specialization})` : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.appointment_date}
                    onChange={(e) =>
                      setFormData({ ...formData, appointment_date: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={formData.appointment_time}
                    onChange={(e) =>
                      setFormData({ ...formData, appointment_time: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Visit
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your symptoms..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}