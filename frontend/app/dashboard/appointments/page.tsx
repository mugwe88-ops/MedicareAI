'use client';

import { useState, useEffect } from 'react';
import { Calendar, User, FileText, CheckCircle, Clock } from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  city: string;
}

interface UserSession {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function PatientAppointmentsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user session token structure.");
      }
    }
    fetchAllDoctors();
  }, []);

  const fetchAllDoctors = async () => {
    try {
      const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://medicareai-1.onrender.com';
      // Fallback query targets users table or your directory endpoint directly
      const res = await fetch(`${BACKEND_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Temporary stub database matrix array matching Dr. Clinton if system directory is isolated
      setDoctors([
        { id: 4, name: "Dr. Clinton", specialization: "General Medicine", city: "Nairobi" }
      ]);
    } catch (err) {
      console.error("Failed parsing medical practitioners list.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !appointmentTime || !reason) {
      setMessage({ text: 'Please complete all form properties.', isError: true });
      return;
    }

    setSubmitting(true);
    setMessage({ text: '', isError: false });

    try {
      const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://medicareai-1.onrender.com';
      const res = await fetch(`${BACKEND_BASE}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          patient_name: currentUser?.name || 'Anonymous Patient',
          phone: '0712345678', // Default fallback mock phone string mapping
          appointment_time: appointmentTime,
          doctor_id: parseInt(selectedDoctorId, 10),
          patient_id: currentUser?.id || null,
          reason: reason
        })
      });

      if (res.ok) {
        setMessage({ text: '🎉 Appointment successfully booked into clinical pipeline!', isError: false });
        setReason('');
        setAppointmentTime('');
        setSelectedDoctorId('');
      } else {
        const errData = await res.json();
        setMessage({ text: errData.error || 'Database rejected validation properties.', isError: true });
      }
    } catch (err) {
      setMessage({ text: 'Network pipeline bridge failure.', isError: true });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 animate-pulse font-mono text-xs uppercase tracking-wider">
        Querying Medical Provider Directories...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto text-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white tracking-tight">Schedule Virtual Triage Session</h1>
        <p className="text-slate-400 text-sm mt-1">Select an active clinical practitioner to book an appointment.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-semibold border ${
          message.isError 
            ? 'bg-red-950/30 text-red-400 border-red-900/40' 
            : 'bg-green-950/30 text-green-400 border-green-900/40'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleBookAppointment} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        {/* SELECT CLINICIAN */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Assign Clinical Practitioner</label>
          <div className="relative">
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="">-- Choose a Specialist --</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} ({doc.specialization}) - {doc.city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TIME STAMP WINDOW */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Target Date & Time Window</label>
          <input
            type="datetime-local"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 color-scheme-dark"
          />
        </div>

        {/* COMPLAINT DESCRIPTION */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Primary Consultation Complaint / Reason</label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe your current physiological symptoms or check-up objectives..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* DISPATCH ACTION ACTION CARD */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white font-bold text-sm tracking-wide uppercase py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-950/20"
        >
          {submitting ? 'Transmitting Schedule Logs...' : 'Confirm System Booking'}
        </button>
      </form>
    </div>
  );
}