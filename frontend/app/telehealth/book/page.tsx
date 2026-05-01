"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Video, Calendar, Clock, MessageSquare, ChevronRight } from "lucide-react";

// Using a wrapper for Suspense since useSearchParams() requires it in App Router
function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const contextId = searchParams.get("context");

  const [bookingData, setBookingData] = useState({
    appointment_date: "",
    appointment_time: "",
    reason: "",
    is_video: true
  });

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/book`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ ...bookingData, lab_result_id: contextId }),
      });

      if (response.ok) {
        alert("Telehealth session requested successfully!");
        // Redirecting to your actual portal path seen in image_495763.png
        router.push("/patient-portal"); 
      }
    } catch (error) {
      console.error("Booking error:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex items-center space-x-3 mb-4 text-blue-400">
            <Video size={28} />
            <h1 className="text-xl font-black uppercase tracking-widest text-white">Book Video Call</h1>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
            {contextId ? `Ref: Lab Result #${contextId.slice(0, 8)}` : "General Consultation"}
          </p>
        </div>

        <form onSubmit={handleBooking} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              required
              className="w-full px-4 py-4 bg-slate-50 border rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setBookingData({...bookingData, appointment_date: e.target.value})}
            />
            <input
              type="time"
              required
              className="w-full px-4 py-4 bg-slate-50 border rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setBookingData({...bookingData, appointment_time: e.target.value})}
            />
          </div>

          <textarea
            placeholder="Describe your symptoms or follow-up concerns..."
            rows={4}
            className="w-full px-4 py-4 bg-slate-50 border rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            onChange={(e) => setBookingData({...bookingData, reason: e.target.value})}
          />

          <button
            type="submit"
            className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all uppercase tracking-widest text-sm shadow-lg shadow-blue-200"
          >
            <span>Confirm Request</span>
            <ChevronRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

// Main component with Suspense boundary for Next.js build requirements
export default function TelehealthBooking() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold">Loading booking context...</div>}>
      <BookingForm />
    </Suspense>
  );
}