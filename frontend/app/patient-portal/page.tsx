"use client";
import { useState, useEffect } from "react";

export default function PatientPortal() {
  const [isBooking, setIsBooking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  
  // Doctors placeholder - in production you'd fetch this from /api/doctors
  const [doctors] = useState([
    { id: 1, name: "Dr. Sarah Johnson", specialty: "General Practitioner" },
    { id: 2, name: "Dr. Michael Chen", specialty: "Cardiologist" }
  ]);

  const [bookingData, setBookingData] = useState({
    doctorId: "",
    date: "",
    reason: "",
    phone: "" // Added this to track phone input
  });

  // 1. Fetch real appointments on load
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("https://medicareai-1.onrender.com/api/appointments");
      const data = await res.json();
      if (Array.isArray(data)) setAppointments(data);
    } catch (err) {
      console.error("Failed to fetch appointments");
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // MAPPING FRONTEND TO BACKEND KEYS (Fixes the 400 error)
    const payload = {
      patient_name: "William Weru",      // Replace with dynamic name if stored in localStorage
      phone: bookingData.phone,          // Now coming from the form input
      appointment_time: bookingData.date, 
      doctor_id: bookingData.doctorId,
      reason: bookingData.reason
    };

    try {
      const res = await fetch("https://medicareai-1.onrender.com/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Booking Confirmed!");
        setIsBooking(false);
        fetchAppointments(); // Refresh the list automatically
      } else {
        alert("Error: " + (result.error || "Check your inputs"));
      }
    } catch (err) {
      alert("Server is sleeping. Try again in 10 seconds.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-40">
        <h1 className="text-2xl font-black text-blue-600 tracking-tight">Swift MD</h1>
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">W</div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Dashboard</h2>
            <p className="text-slate-500 font-medium mt-1 text-sm">Manage your health and upcoming visits</p>
          </div>
          <button 
            onClick={() => setIsBooking(true)}
            className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition transform active:scale-95"
          >
            + Book New Appointment
          </button>
        </div>

        {/* MODAL */}
        {isBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-900">Book Visit</h3>
                <button onClick={() => setIsBooking(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
              </div>
              
              <form onSubmit={handleBookAppointment} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                  <input 
                    type="tel"
                    placeholder="+254 7..."
                    required
                    className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold"
                    onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Select Doctor</label>
                  <select 
                    className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold appearance-none"
                    onChange={(e) => setBookingData({...bookingData, doctorId: e.target.value})}
                    required
                  >
                    <option value="">Choose a practitioner...</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold"
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:bg-blue-300 transition"
                  >
                    {loading ? "Confirming..." : "Confirm Booking"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Real Appointments List */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
           <h3 className="text-xl font-bold text-slate-900 mb-6">Upcoming Appointments</h3>
           
           <div className="space-y-4">
             {appointments.length > 0 ? (
               appointments.map((apt: any) => (
                 <div key={apt.id} className="flex items-center justify-between p-6 border border-slate-50 rounded-2xl bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">🩺</div>
                      <div>
                        <p className="font-black text-slate-900">{apt.patient_name}</p>
                        <p className="text-sm text-slate-500 font-bold">{new Date(apt.appointment_time).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-white border border-slate-200 text-blue-600 text-xs font-black rounded-full shadow-sm capitalize">
                      {apt.status || 'Pending'}
                    </span>
                 </div>
               ))
             ) : (
               <div className="text-center py-12">
                 <p className="text-slate-400 font-bold italic">No appointments found. Book your first consultation above.</p>
               </div>
             )}
           </div>
        </div>
      </main>
    </div>
  );
}