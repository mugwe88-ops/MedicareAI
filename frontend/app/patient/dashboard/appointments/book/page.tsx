"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Doctor {
  id: number | string;
  name: string;
  specialization?: string;
  department?: string;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Form state fields matching your backend endpoint
  const [formData, setFormData] = useState({
    department: "General Medicine",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
    symptom_severity: "Mild",
    symptom_duration: "",
    body_system: "",
    associated_symptoms: "",
    pain_scale: "0",
  });

  const API_BASE = "https://medicareai-1.onrender.com";

  // Fetch available doctors on mount
  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) {
      setErrorMsg("No active session found. Please log in.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    fetch(`${API_BASE}/api/doctors`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDoctors(data);
        } else if (data.doctors && Array.isArray(data.doctors)) {
          setDoctors(data.doctors);
        }
      })
      .catch((err) => console.error("Could not fetch doctors list:", err));
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) {
      alert("Authentication session expired. Please log in again.");
      router.push("/login");
      return;
    }

    if (!formData.appointment_date || !formData.appointment_time) {
      setErrorMsg("Please select both an appointment date and time.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/appointments/book`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || "Failed to book appointment.");
      }

      // Redirect back to appointments list on success
      router.push("/patient/dashboard/appointments");
    } catch (err: any) {
      console.error("Booking error:", err);
      setErrorMsg(err.message || "An error occurred while booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-8 space-y-6 my-4 sm:my-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-white">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">Book an Appointment</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Fill out your consultation details and symptoms below to schedule your visit.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-sm font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Department Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
            Department / Specialization
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="General Medicine">General Medicine</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Neurology">Neurology</option>
            <option value="Orthopedics">Orthopedics</option>
          </select>
        </div>

        {/* Doctor Selection (Optional) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
            Preferred Physician (Optional)
          </label>
          <select
            name="doctor_id"
            value={formData.doctor_id}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">-- Any Available Physician --</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                Dr. {doc.name} {doc.specialization ? `(${doc.specialization})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Date and Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Appointment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Appointment Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="appointment_time"
              value={formData.appointment_time}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Chief Complaint / Reason */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
            Chief Complaint / Reason for Visit
          </label>
          <textarea
            name="reason"
            rows={2}
            value={formData.reason}
            onChange={handleChange}
            placeholder="Briefly describe your main symptom or reason for booking..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Symptom Assessment Questionnaire Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Body System Affected
            </label>
            <input
              type="text"
              name="body_system"
              value={formData.body_system}
              onChange={handleChange}
              placeholder="e.g., Respiratory, Gastrointestinal"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Symptom Severity
            </label>
            <select
              name="symptom_severity"
              value={formData.symptom_severity}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Duration
            </label>
            <input
              type="text"
              name="symptom_duration"
              value={formData.symptom_duration}
              onChange={handleChange}
              placeholder="e.g., 3 days, 2 weeks"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Pain Scale (0 - 10)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              name="pain_scale"
              value={formData.pain_scale}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
            Associated Symptoms
          </label>
          <input
            type="text"
            name="associated_symptoms"
            value={formData.associated_symptoms}
            onChange={handleChange}
            placeholder="e.g., Fever, headache, fatigue"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.push("/patient/dashboard/appointments")}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-bold rounded-xl transition border border-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-lg shadow-blue-600/30 disabled:opacity-50"
          >
            {loading ? "Booking Appointment..." : "Confirm Booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
