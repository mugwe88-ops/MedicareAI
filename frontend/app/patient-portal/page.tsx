"use client";
import { useState, useEffect } from "react";

// 1. Define what an Appointment looks like (helps TypeScript)
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
  
  // 2. TELL TYPESCRIPT: This is an array of Appointments, not "never"
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const [doctors] = useState([
    { id: 1, name: "Dr. Sarah Johnson", specialty: "General Practitioner" },
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
      const data = await res.json();
      
      // 3. This will now work perfectly
      if (Array.isArray(data)) {
        setAppointments(data);
      }
    } catch (err) {
      console.error("Failed to fetch appointments");
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      patient_name: "William Weru", 
      phone: bookingData.phone,
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

      if (res.ok) {
        alert("Booking Confirmed!");
        setIsBooking(false);
        fetchAppointments(); 
      }
    } catch (err) {
      alert("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ... (Keep your existing Navigation and Header UI) ... */}

      <main className="max-w-7xl mx-auto p-8">
        {/* ... (Keep your Booking Button and Modal UI) ... */}

        {/* Updated Appointments List using the Typed state */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
           <h3 className="text-xl font-bold text-slate-900 mb-6">Upcoming Appointments</h3>
           
           <div className="space-y-4">
             {appointments.length > 0 ? (
               appointments.map((apt) => (
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