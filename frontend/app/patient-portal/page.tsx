"use client";
import { useState, useEffect } from "react";

export default function PatientPortal() {
  const [isBooking, setIsBooking] = useState(false);
  const [doctors, setDoctors] = useState([{ id: 1, name: "Dr. Sarah Johnson", specialty: "General" }]); // Placeholder
  const [bookingData, setBookingData] = useState({ doctorId: "", date: "", reason: "" });
  const [loading, setLoading] = useState(false);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("https://medicareai-1.onrender.com/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingData,
          patientId: 1, // You'll get this from your logged-in user state/token
        }),
      });
      if (res.ok) {
        alert("Appointment booked successfully!");
        setIsBooking(false);
      }
    } catch (err) {
      alert("Failed to book appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Existing Navbar and Stats... */}

      <main className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Patient Dashboard</h2>
          <button 
            onClick={() => setIsBooking(true)}
            className="px-6 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 transition"
          >
            + Book Appointment
          </button>
        </div>

        {/* MODAL OVERLAY */}
        {isBooking && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Book Consultation</h3>
              
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Doctor</label>
                  <select 
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setBookingData({...bookingData, doctorId: e.target.value})}
                    required
                  >
                    <option value="">Choose a practitioner...</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Appointment Date</label>
                  <input 
                    type="datetime-local" 
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Reason for Visit</label>
                  <textarea 
                    placeholder="Brief description of your symptoms..."
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 h-24"
                    onChange={(e) => setBookingData({...bookingData, reason: e.target.value})}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsBooking(false)}
                    className="flex-1 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 disabled:bg-blue-300 transition"
                  >
                    {loading ? "Confirming..." : "Confirm Booking"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* The rest of your dashboard UI... */}
      </main>
    </div>
  );
}