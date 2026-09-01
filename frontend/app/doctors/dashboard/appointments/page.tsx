"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Video, FileText, User, Activity, Clock, AlertCircle } from "lucide-react";

interface Appointment {
  id: string;
  patient_name: string;
  patient_email?: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  medical_reason?: string;
  vitals?: {
    heartRate?: string;
    bloodPressure?: string;
    temperature?: string;
    weight?: string;
  };
}

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      // Adjust endpoint to match your backend doctor appointments route
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/doctors/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error("Failed to load doctor appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (appointmentId: string) => {
    router.push(`/doctors/dashboard/telehealth?appointmentId=${appointmentId}`);
  };

  if (loading) {
    return <div className="p-8 text-slate-600 font-medium">Loading patient bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Patient Consultations & Bookings</h1>
        <p className="text-xs text-slate-500">Manage scheduled appointments, review patient vitals, and join telehealth rooms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-4">
          {appointments.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 font-medium text-sm">
              No patient bookings found.
            </div>
          ) : (
            appointments.map((appt) => (
              <div 
                key={appt.id} 
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-blue-300"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-base">{appt.patient_name}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-600">
                      {appt.status || "Confirmed"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <Clock size={14} /> {appt.appointment_date} at {appt.appointment_time}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    <strong className="text-slate-800">Reason:</strong> {appt.medical_reason || "General Consultation"}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => setSelectedPatient(appt)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText size={14} /> View Records
                  </button>
                  <button
                    onClick={() => handleJoinRoom(appt.id)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Video size={14} /> Join Room
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Patient Quick Info & Vitals Panel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">Patient Details</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Selected Profile</p>
            </div>
          </div>

          {selectedPatient ? (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Full Name</p>
                <p className="text-sm font-black text-slate-800">{selectedPatient.patient_name}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Medical Complaint / Notes</p>
                <p className="text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedPatient.medical_reason || "No specific notes provided."}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                  <Activity size={14} /> Latest Vitals
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-bold">Heart Rate</span>
                    <strong className="text-slate-800">{selectedPatient.vitals?.heartRate || "72 bpm"}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-bold">Blood Pressure</span>
                    <strong className="text-slate-800">{selectedPatient.vitals?.bloodPressure || "120/80"}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-bold">Temperature</span>
                    <strong className="text-slate-800">{selectedPatient.vitals?.temperature || "98.6°F"}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-bold">Weight</span>
                    <strong className="text-slate-800">{selectedPatient.vitals?.weight || "70 kg"}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleJoinRoom(selectedPatient.id)}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Video size={16} /> Start Telehealth Session
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs font-medium">
              <AlertCircle className="mx-auto mb-2 text-slate-300" size={24} />
              Select a patient from your appointments list to view their vitals and medical info.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}