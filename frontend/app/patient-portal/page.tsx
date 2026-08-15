"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, 
  Video, 
  Activity, 
  FileText, 
  Clock, 
  User, 
  PlusCircle, 
  CheckCircle2 
} from "lucide-react";

interface Appointment {
  id: number;
  patient_name?: string;
  doctor_name?: string;
  department?: string;
  appointment_date?: string;
  appointment_time?: string;
  status: string;
  phone?: string;
  reason?: string;
}

export default function PatientPortal() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "records">("overview");

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://medicareai-1.onrender.com/api/my-appointments", {
        headers: {
          Authorization: `Bearer ${token || ""}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error("Failed to load patient records:", err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Patient Care Portal</h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage your upcoming consultations, health records, and medical schedules.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab("appointments")}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <PlusCircle size={18} /> Book Consultation
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold text-slate-500">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 transition-colors ${
              activeTab === "overview" ? "border-b-2 border-blue-600 text-blue-600" : "hover:text-slate-800"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`pb-3 transition-colors ${
              activeTab === "appointments" ? "border-b-2 border-blue-600 text-blue-600" : "hover:text-slate-800"
            }`}
          >
            My Appointments ({appointments.length})
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-200">
            Loading your medical portal...
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Metric Card 1 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Total Visits</p>
                    <p className="text-2xl font-bold text-slate-800">{appointments.length}</p>
                  </div>
                </div>

                {/* Metric Card 2 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Active Status</p>
                    <p className="text-2xl font-bold text-slate-800">Verified</p>
                  </div>
                </div>

                {/* Metric Card 3 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <Video size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Telehealth Room</p>
                    <p className="text-2xl font-bold text-slate-800">Ready</p>
                  </div>
                </div>

                {/* Appointment List Preview */}
                <div className="md:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Medical Activity</h3>
                  {appointments.length === 0 ? (
                    <p className="text-sm text-slate-500">No recent consultations logged.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {appointments.slice(0, 5).map((apt) => (
                        <div key={apt.id} className="py-3.5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock size={16} className="text-slate-400" />
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {apt.department || "General Consultation"}
                              </p>
                              <p className="text-xs text-slate-400">
                                {apt.appointment_date || "Date Pending"}
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600 capitalize">
                            {apt.status || "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "appointments" && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Scheduled Appointments</h3>
                {appointments.length === 0 ? (
                  <p className="text-sm text-slate-500">No appointments found.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="p-4 border border-slate-200 rounded-xl space-y-2 bg-slate-50/50">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-800">{apt.department || "General Health"}</h4>
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar size={14} /> {apt.appointment_date || "N/A"} at {apt.appointment_time || "N/A"}
                        </p>
                        {apt.reason && (
                          <p className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-100">
                            Note: {apt.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}