"use client";
import { useState, useEffect } from "react";

export default function PatientPortal() {
  const [isBooking, setIsBooking] = useState(false);
  const [doctors, setDoctors] = useState([{ id: 1, name: "Dr. Sarah Johnson", specialty: "General" }]); 
  const [bookingData, setBookingData] = useState({ doctorId: "", date: "", reason: "" });
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("William Weru"); // This should ideally come from your auth state

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // MAPPING FRONTEND TO BACKEND KEYS
    const payload = {
      patient_name: userName,            // Matches backend requirement
      phone: "+254700000000",            // Matches backend requirement
      appointment_time: bookingData.date, // Matches backend requirement
      doctor_id: bookingData.doctorId,
      reason: bookingData.reason
    };

    try {
      const res = await fetch("https://medicareai-1.onrender.com/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Appointment booked successfully!");
        setIsBooking(false);
        // Optional: Refresh your appointment list here
      } else {
        alert("Error: " + (data.error || "Booking failed"));
      }
    } catch (err) {
      console.error("Booking Error:", err);
      alert("Failed to connect to server. Ensure backend is awake.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-40">
        <h1 className="text-2xl font-black text-blue-600 tracking-tight">Swift MD</h1>
        <div className="flex items-center gap-3">
          <span className="text-slate-600 font-bold text-sm">Patient Portal</span>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">W</div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Patient Dashboard</h2>
            <p className="text-slate-500 font-medium">Welcome back, {userName}</p>
          </div>
          <button 
            onClick={() => setIsBooking(true)}
            className="px-6 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition transform active:scale-95"
          >
            + Book Appointment
          </button>
        </div>

        {/* MODAL OVERLAY */}
        {isBooking && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-900">Book Consultation</h3>
                <button onClick={() => setIsBooking(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              
              <form onSubmit={handleBookAppointment} className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Select Doctor</label>
                  <select 
                    className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
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
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Preferred Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Reason for Visit</label>
                  <textarea 
                    placeholder="Brief description of your symptoms..."
                    className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 h-28 text-slate-900 font-medium"
                    onChange={(e) => setBookingData({...bookingData, reason: e.target.value})}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsBooking(false)}
                    className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:bg-blue-300 transition"
                  >
                    {loading ? "Confirming..." : "Confirm Booking"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Placeholder for Appointments List */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
           <h3 className="text-xl font-bold text-slate-900 mb-6">Upcoming Appointments</h3>
           <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-slate-400 font-medium italic">No appointments found. Book your first consultation above.</p>
           </div>
        </div>
      </main>
    </div>
  );
}