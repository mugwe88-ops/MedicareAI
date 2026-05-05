"use client";
import { useState, useEffect } from "react";
// Import the necessary components
import PatientResultsTable from "../../src/components/PatientResultsTable";
import HealthTrends from "../../src/components/HealthTrends";
import AIInsights from "../../src/components/AIInsights";
import RecordsVault from "../../src/components/RecordsVault";

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
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const [doctors] = useState([
    { id: 1, name: "Dr. Sarah Johnson", specialty: "General Practitioner" },
    { id: 1, name: "Dr. Fibian Nyorita", specialty: " Dermatologist" },
    { id: 2, name: "Dr. Michael Chen", specialty: "Cardiologist" }
  ]);

  const [bookingData, setBookingData] = useState({
    doctorId: "",
    date: "",
    reason: "",
    phone: "" 
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

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`https://medicareai-1.onrender.com/api/appointments/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAppointments(prev => prev.filter(apt => apt.id !== id));
      } else {
        alert("Failed to delete appointment.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Server connection failed.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
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
        setBookingData({ doctorId: "", date: "", reason: "", phone: "" });
        await fetchAppointments(); 
      } else {
        alert(`Booking failed: ${result.error}`);
      }
    } catch (err) {
      alert("Server connection failed.");
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

      <main className="max-w-7xl mx-auto p-8 space-y-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            {/* ONLY UPDATED THE LINE BELOW */}
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">William Weru's Dashboard</h2>
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
               <h2 className="text-2xl font-black text-slate-900 mb-6">New Appointment</h2>
               <form onSubmit={handleBookAppointment} className="space-y-4">
                  <input 
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 font-bold"
                    onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                    required
                  />
                  <select 
                    className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 font-bold"
                    onChange={(e) => setBookingData({...bookingData, doctorId: e.target.value})}
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
                  </select>
                  <input 
                    type="datetime-local" 
                    className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 font-bold"
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    required
                  />
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsBooking(false)} className="flex-1 font-bold text-slate-400">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl">
                      {loading ? "..." : "Confirm"}
                    </button>
                  </div>
               </form>
            </div>
          </div>
        )}

        {/* SECTION: Appointments */}
        <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
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

                    <div className="flex items-center gap-4">
                      <span className={`px-5 py-2 text-[10px] font-black rounded-full uppercase tracking-widest border ${getStatusStyles(apt.status)}`}>
                        {apt.status || 'Scheduled'}
                      </span>
                      
                      <button 
                        onClick={() => handleDelete(apt.id)}
                        disabled={deletingId === apt.id}
                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-90"
                      >
                        {deletingId === apt.id ? (
                          <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-20 bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-100">
                 <p className="text-slate-400 font-bold italic">No appointments found. Your schedule is clear.</p>
               </div>
             )}
           </div>
        </section>

        {/* SECTION: Health Trends & AI Insights */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <HealthTrends />
          </div>
          <div className="lg:col-span-1">
            <AIInsights />
          </div>
        </section>

        {/* SECTION: Records Vault */}
        <RecordsVault />

        {/* SECTION: Lab Reports */}
        <section className="space-y-4">
          <div className="ml-2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent Lab Findings</h3>
            <p className="text-slate-500 font-medium text-sm">Official laboratory reports and clinical results</p>
          </div>
          <PatientResultsTable />
        </section>

      </main>
    </div>
  );
}