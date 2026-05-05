"use client";
import { useState, useEffect } from "react";
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

interface Doctor {
  id: number;
  name: string;
  specialty: string;
}

export default function PatientPortal() {
  const [isBooking, setIsBooking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [bookingData, setBookingData] = useState({
    doctorId: "",
    date: "",
    reason: "",
    phone: "" 
  });

  useEffect(() => {
    fetchAppointments();
    // Initial fetch for all doctors
    fetchDoctors(""); 
  }, []);

  // NEW: Effect to fetch doctors whenever the "reason" changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (isBooking) {
        fetchDoctors(bookingData.reason);
      }
    }, 500); // 500ms debounce to avoid hitting the API on every single keystroke

    return () => clearTimeout(delayDebounceFn);
  }, [bookingData.reason, isBooking]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("https://medicareai-1.onrender.com/api/appointments");
      const data = await res.json();
      if (Array.isArray(data)) setAppointments(data);
    } catch (err) {
      console.error("Fetch Appointments Error:", err);
    }
  };

  // UPDATED: Fetch doctors with a specialty/query parameter
  const fetchDoctors = async (query: string) => {
    setFetchingDoctors(true);
    try {
      // Passes the 'reason' as the 'specialization' query param to your backend
      const url = `https://medicareai-1.onrender.com/api/doctors?specialization=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch doctors");
      const data = await res.json();
      if (Array.isArray(data)) setDoctors(data);
    } catch (err) {
      console.error("Fetch Doctors Error:", err);
    } finally {
      setFetchingDoctors(false);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData.doctorId) return alert("Please select a doctor.");
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
        alert("Appointment booked!");
        setIsBooking(false);
        setBookingData({ doctorId: "", date: "", reason: "", phone: "" });
        fetchAppointments();
      }
    } catch (err) {
       console.error("Booking Error:", err);
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

        {isBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
               <h2 className="text-2xl font-black text-slate-900 mb-6">New Appointment</h2>
               <form onSubmit={handleBookAppointment} className="space-y-4">
                  <input 
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 font-bold text-slate-900"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                    required
                  />
                  
                  {/* Step 1: User types reason/specialty */}
                  <input 
                    type="text"
                    placeholder="Reason (e.g. Dental, Cardiology)"
                    className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-200 font-bold text-slate-900 focus:bg-white transition-colors"
                    value={bookingData.reason}
                    onChange={(e) => setBookingData({...bookingData, reason: e.target.value})}
                  />

                  {/* Step 2: Dropdown filters based on input above */}
                  <select 
                    className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 font-bold text-slate-900"
                    value={bookingData.doctorId}
                    onChange={(e) => setBookingData({...bookingData, doctorId: e.target.value})}
                    required
                  >
                    <option value="">{fetchingDoctors ? "Searching doctors..." : "Select Available Doctor"}</option>
                    {doctors.length > 0 ? (
                      doctors.map(doc => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} ({doc.specialty})
                        </option>
                      ))
                    ) : (
                      !fetchingDoctors && <option disabled>No specialists found for "{bookingData.reason}"</option>
                    )}
                  </select>

                  <input 
                    type="datetime-local" 
                    className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 font-bold text-slate-900"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    required
                  />

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsBooking(false)} className="flex-1 font-bold text-slate-400">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition disabled:opacity-50">
                      {loading ? "Confirming..." : "Confirm"}
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
             {appointments.map((apt) => (
                 <div key={apt.id} className="flex items-center justify-between p-6 border border-slate-50 rounded-3xl bg-slate-50/50">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl border border-slate-100">🩺</div>
                      <div>
                        <p className="font-black text-slate-900 text-lg leading-tight">{apt.patient_name}</p>
                        <p className="text-sm text-slate-500 font-bold mt-1">{apt.appointment_time}</p>
                      </div>
                    </div>
                 </div>
               ))
             }
           </div>
        </section>

        <HealthTrends />
        <AIInsights />
        <RecordsVault />
        <PatientResultsTable />
      </main>
    </div>
  );
}