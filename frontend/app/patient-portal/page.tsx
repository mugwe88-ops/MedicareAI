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

export default function PatientPortal() {
  const [isBooking, setIsBooking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Simulated session data for William Weru
  const [user] = useState({
    id: 1,
    name: "William Weru",
    initial: "W"
  });

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
      // UPDATED: Filter by patient_id to prevent seeing other accounts' data
      const res = await fetch(`https://medicareai-1.onrender.com/api/appointments?patient_id=${user.id}`);
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
      patient_name: user.name, // Use name from session
      patient_id: user.id,     // Ensure patient_id is sent to backend
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
        {/* UPDATED: Dynamic Initial */}
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">{user.initial}</div>
      </nav>

      <main className="max-w-7xl mx-auto p-8 space-y-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            {/* UPDATED: Personalized Header */}
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{user.name}'s Dashboard</h2>
            <p className="text-slate-500 font-medium mt-1 text-sm">Manage your health and upcoming visits</p>
          </div>
          <button 
            onClick={() => setIsBooking(true)}
            className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition transform active:scale-95"
          >
            + Book New Appointment
          </button>
        </div>

        {/* ... [Rest of the file remains the same: Modal, Appointments section, HealthTrends, AIInsights, etc.] ... */}

      </main>
    </div>
  );
}