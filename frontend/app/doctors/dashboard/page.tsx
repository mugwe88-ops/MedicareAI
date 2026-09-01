"use client";

import { useState, useEffect } from "react";
import { Users, Calendar, Building2, AlertTriangle, ShieldCheck, Clock, CheckCircle2, RefreshCw } from "lucide-react";

interface Appointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  status: string;
  reason?: string;
}

export default function DoctorDashboardPage() {
  const [doctorName, setDoctorName] = useState("Doctor");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [stats, setStats] = useState({ totalDoctors: 2937, totalStaffs: 5453, totalPatients: "170K", pharmacies: 21 });

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user?.name) {
          setDoctorName(user.name);
        }
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
  }, []);

  const fetchDoctorAppointments = async () => {
    setLoadingAppts(true);
    try {
      const token = localStorage.getItem("token");
      // Fetches appointments filtered for the logged-in doctor ID from the backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/doctors/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching doctor appointments:", err);
    } finally {
      setLoadingAppts(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Welcome Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-blue-600 font-extrabold">Overview</span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-500 font-medium">Hospital Workspace</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, Dr. {doctorName}
          </h1>
        </div>

        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {doctorName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Dr. {doctorName}</p>
            <p className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
              <ShieldCheck size={12} /> Active Practitioner
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Total Doctors</span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-gray-900">{stats.totalDoctors}</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">Registered active practitioners</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Total Staffs</span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-gray-900">{stats.totalStaffs}</h3>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Users size={18} />
            </div>
          </div>
          <p className="text-[11px] text-amber-600 font-medium">8 Staffs on vacation</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Total Patients</span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-gray-900">{stats.totalPatients}</h3>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Calendar size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">Synced from queue records</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Pharmacies</span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-gray-900">{stats.pharmacies}</h3>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">Partner locations</p>
        </div>
      </div>

      {/* Real-Time Upcoming Appointments Widget */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-gray-900 text-sm">Real-Time Upcoming Appointments</h3>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-extrabold border border-blue-100">
              {appointments.length} Booked
            </span>
          </div>
          <button
            onClick={fetchDoctorAppointments}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 font-bold transition cursor-pointer bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200"
          >
            <RefreshCw size={12} className={loadingAppts ? "animate-spin" : ""} /> Refresh Feed
          </button>
        </div>

        {loadingAppts ? (
          <div className="text-center py-8 text-gray-400 text-xs font-semibold">
            Checking for newly booked appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 text-xs font-medium">
            No upcoming appointments found assigned to your ID yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {appointments.map((appt) => (
              <div key={appt.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">ID: {appt.id}</span>
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold rounded-md flex items-center gap-1">
                    <CheckCircle2 size={10} /> {appt.status || "Confirmed"}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{appt.patientName || "Patient Booking"}</h4>
                  {appt.reason && <p className="text-[11px] text-gray-500 truncate">Reason: {appt.reason}</p>}
                </div>
                <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-600 font-medium">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {appt.date}</span>
                  <span className="flex items-center gap-1 text-blue-600 font-bold"><Clock size={12} /> {appt.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hospital Reports & Alerts */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-gray-900 text-sm">Hospital Report & Alerts</h3>
          <button className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">View All</button>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                <AlertTriangle size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Room 501 AC is not working</h4>
                <p className="text-[11px] text-gray-500">Reported by Steve</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold rounded-lg">
              Pending
            </span>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <Calendar size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Daniel extended his holiday</h4>
                <p className="text-[11px] text-gray-500">Reported by Andrew</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold rounded-lg">
              Logged
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}