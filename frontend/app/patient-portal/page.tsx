"use client";
import { useState, useEffect } from "react";

interface Appointment {
  id: number;
  patient_name: string;
  appointment_time: string;
  status: string;
  phone: string;
  reason?: string;
}

export default function PatientPortal() {
  const [isBooking, setIsBooking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const [doctors] = useState([
    { id: 1, name: "Dr. Sarah Johnson", specialty: "General Practitioner" },
    { id: 2, name: "Dr. Michael Chen", specialty: "Cardiologist" }
  ]);

  const [bookingData, setBookingData] = useState({
    doctorId: "",
    date: "",
    reason: "",
    phone: "" // Required by backend
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("https://medicareai-1.onrender.com/api/appointments");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (Array.isArray(data)) setAppointments(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      patient_name: "William Weru", 
      phone: bookingData.phone,
      appointment_time: bookingData.date, 
      doctor_id: parseInt(bookingData.doctorId),
      reason: bookingData.reason || "General Consultation"
    };

    try {
      const res = await fetch("https://medicareai-1.onrender.com/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsBooking(false);
        setBookingData({ doctorId: "", date: "", reason: "", phone: "" });
        await fetchAppointments(); 
      } else {
        const error = await res.json();
        alert(`Booking failed: ${error.error}`);
      }
    } catch (err) {
      alert("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const res = await fetch(`https://medicareai-1.onrender.com/api/appointments/${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchAppointments();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
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
            className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition transform active:scale-95"
          >
            + Book New Appointment
          </button>
        </div>

        {isBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
              <h3 className="text-2xl font-black text-slate-900 mb-6">Book Visit</h3>
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <input 
                  type="tel" 
                  placeholder="Phone Number (e.g. +254...)" 
                  className="w-full p-4 border rounded-2xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                  required 
                />
                <select 
                  className="w-full p-4 border rounded-2xl bg-slate-50 font-bold"
                  onChange={(e) => setBookingData({...bookingData, doctorId: e.target.value})}
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
                </select>
                <input 
                  type="datetime-local" 
                  className="w-full p-4 border rounded-2xl bg-slate-50 font-bold"
                  onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                  required 
                />
                <textarea 
                  placeholder="Reason (Optional)" 
                  className="w-full p-4 border rounded-2xl bg-slate-50 h-24 font-bold"
                  onChange={(e) => setBookingData({...bookingData, reason: e.target.value})}
                />
                <div className="flex gap-4">
                  <button type="button" onClick={() => setIsBooking(false)} className="flex-1 py-4 font-bold text-slate-400">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl">
                    {loading ? "..." : "Confirm"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
           <h3 className="text-xl font-bold text-slate-900 mb-6">Upcoming Appointments</h3>
           <div className="space-y-4">
             {appointments.length > 0 ? (
               appointments.map((apt) => (
                 <div key={apt.id} className="flex items-center justify-between p-6 border border-slate-50 rounded-3xl bg-slate-50/50">
                    <div className="flex items-center gap-5">
                      <div className="text-2xl">🩺</div>
                      <div>
                        <p className="font-black text-slate-900">{apt.patient_name}</p>
                        <p className="text-sm text-slate-500 font-bold">
                          {new Date(apt.appointment_time).toLocaleString('en-GB')}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteAppointment(apt.id)}
                      className="text-red-400 hover:text-red-600 font-bold text-xs"
                    >
                      Cancel
                    </button>
                 </div>
               ))
             ) : (
               <div className="text-center py-20">
                 <p className="text-slate-400 font-bold italic">No appointments found.</p>
               </div>
             )}
           </div>
        </div>
      </main>
    </div>
  );
}