"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; // Adjust path to your Supabase client
import { Calendar, Clock, User, Building, CheckCircle2, ArrowLeft } from "lucide-react";

export default function BookAppointmentPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: "doc-uuid-dr-pressy-123", // Replace with dynamic doctor ID from search params/props
    doctorName: "Dr. Pressy",
    specialty: "General Practice & Family Medicine",
    appointmentType: "Telehealth Consultation",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
  });

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        alert("You must be logged in as a patient to book an appointment.");
        router.push("/login");
        return;
      }

      // Debug Logging (Step 8)
      console.log("Logged-in patient ID:", user.id);
      console.log("Selected doctor ID:", formData.doctorId);
      
      const payload = {
        patient_id: user.id,
        doctor_id: formData.doctorId,
        patient_name: user.user_metadata?.full_name || "Patient",
        doctor_name: formData.doctorName,
        specialty: formData.specialty,
        appointment_type: formData.appointmentType,
        appointment_date: formData.appointmentDate,
        appointment_time: formData.appointmentTime,
        duration: 30,
        reason: formData.reason,
        status: "Scheduled",
      };
      console.log("Appointment payload before insert:", payload);

      const { data, error } = await supabase.from("appointments").insert([payload]).select();

      if (error) {
        console.error("Supabase insert error:", error);
        alert(`Booking failed: ${error.message}`);
      } else {
        console.log("Supabase insert response:", data);
        alert("Appointment successfully booked and synchronized!");
        router.push("/patient/appointments");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-black text-slate-900 mt-2">Book Appointment with {formData.doctorName}</h1>
        <p className="text-xs text-slate-500">{formData.specialty}</p>
      </div>

      <form onSubmit={handleBooking} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase">Appointment Date</label>
          <input
            type="date"
            required
            value={formData.appointmentDate}
            onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase">Appointment Time</label>
          <input
            type="time"
            required
            value={formData.appointmentTime}
            onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase">Reason for Consultation</label>
          <textarea
            rows={3}
            required
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Describe your symptoms or reason for visit..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-xs resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 transition cursor-pointer disabled:opacity-50"
        >
          {loading ? "Confirming Booking..." : "Confirm & Book Appointment"}
        </button>
      </form>
    </div>
  );
}