"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Video, 
  Store, 
  FileText, 
  UserCheck 
} from "lucide-react";

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("telehealth"); // matches active sidebar highlight
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch patient appointments safely
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://medicareai-1.onrender.com/api/my-appointments", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        }
      } catch (err) {
        console.error("Failed to load patient records:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-4 shrink-0">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="bg-blue-600 text-white font-bold p-2 rounded-lg text-sm">S</div>
          <span className="font-extrabold text-lg tracking-wider">SWIFT MD</span>
        </div>

        <nav className="space-y-1 font-semibold text-xs tracking-wide">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
              activeTab === "dashboard" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <LayoutDashboard size={18} /> MY DASHBOARD
          </button>

          <button
            onClick={() => setActiveTab("appointments")}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
              activeTab === "appointments" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Calendar size={18} /> MY APPOINTMENTS
          </button>

          <button
            onClick={() => setActiveTab("telehealth")}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
              activeTab === "telehealth" ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Video size={18} /> TELEHEALTH ROOM
          </button>

          <button
            onClick={() => setActiveTab("pharmacy")}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
              activeTab === "pharmacy" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Store size={18} /> PHARMACY STORE
          </button>

          <button
            onClick={() => setActiveTab("records")}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
              activeTab === "records" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <FileText size={18} /> MEDICAL RECORDS
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === "telehealth" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Telehealth Consultation Room</h1>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <p className="text-slate-600 text-sm">
                Join your scheduled virtual consultation or request an immediate video call with an available doctor.
              </p>
              
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-900">Virtual Clinic Status</h4>
                  <p className="text-xs text-blue-700">Doctors available for instant triage</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition">
                  Enter Consultation
                </button>
              </div>
            </div>

            {/* Upcoming Telehealth Appointments */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">Your Video Appointments</h3>
              {loading ? (
                <p className="text-sm text-slate-400">Loading sessions...</p>
              ) : appointments.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {appointments.map((apt: any) => (
                    <div key={apt.id} className="py-3 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium text-slate-700">{apt.department || "General Consultation"}</p>
                        <p className="text-xs text-slate-400">{apt.appointment_date} at {apt.appointment_time}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No upcoming video sessions scheduled.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="text-slate-800">
            <h1 className="text-2xl font-bold">Patient Overview</h1>
            <p className="text-slate-500 text-sm mt-1">Welcome back to Swift MD.</p>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="text-slate-800">
            <h1 className="text-2xl font-bold">My Appointments</h1>
          </div>
        )}

        {activeTab === "pharmacy" && (
          <div className="text-slate-800">
            <h1 className="text-2xl font-bold">Pharmacy Store</h1>
          </div>
        )}

        {activeTab === "records" && (
          <div className="text-slate-800">
            <h1 className="text-2xl font-bold">Medical Records</h1>
          </div>
        )}
      </main>
    </div>
  );
}