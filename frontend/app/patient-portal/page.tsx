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
    phone: "" // Added to resolve the "Missing required fields" 400 error
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
      doctor_id: parseInt(bookingData.doctorId) || null,
      reason: bookingData.reason || "General Consultation"
    };

    try {
      const res = await fetch("https://medicareai-1.onrender.com/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        setIsBooking(false);
        setBookingData({ doctorId: "", date: "", reason: "", phone: "" }); // Reset form
        await fetchAppointments(); 
      } else {
        alert(`Booking failed: ${result.error}`);
      }
    } catch (err) {
      alert("Server connection failed. Check if backend is awake.");
    } finally {
      setLoading(false);
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
              
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                  <input 
                    type="tel"
                    placeholder="+254..."
                    className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold"
                    onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Select Doctor</label>
                  <select 
                    className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold"
                    onChange={(e) => setBookingData({...bookingData, doctorId: e.target.value})}
                    required
                  >
                    <option value="">Choose a practitioner...</option>
                    {doctors.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold"
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    required
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
           <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Upcoming Appointments</h3>
           
           <div className="space-y-4">
             {appointments.length > 0 ? (
               appointments.map((apt) => (
                 <div key={apt.id} className="flex items-center justify-between p-6 border border-slate-50 rounded-3xl bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl border border-slate-100">🩺</div>
                      <div>
                        <p className="font-black text-slate-900 text-lg leading-tight">{apt.patient_name}</p>
                        <p className="text-sm text-slate-500 font-bold mt-1">
                          {new Date(apt.appointment_time).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <span className="px-5 py-2 text-[10px] font-black rounded-full uppercase tracking-widest bg-blue-100 text-blue-700">
                      {apt.status || 'Scheduled'}
                    </span>
                 </div>
               ))
             ) : (
               <div className="text-center py-20 bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-100">
                 <p className="text-slate-400 font-bold italic">No appointments found. Your schedule is clear.</p>
               </div>
             )}
           </div>
        </div>
      </main>
    </div>
  );
}