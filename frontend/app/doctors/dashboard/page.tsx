"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Activity, 
  Clock,
  RefreshCw
} from "lucide-react";

interface PatientAppointment {
  id: number;
  patient_name: string;
  phone: string;
  schedule: string;
  chief_reason: string;
  status: "CONFIRMED" | "CANCELLED" | "PENDING";
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [doctorName] = useState("Dr. PRESSY PHIDES");
  
  // Mock live data matching your workspace needs
  const [appointments] = useState<PatientAppointment[]>([
    {
      id: 1,
      patient_name: "Willy Weyru",
      phone: "0723503988",
      schedule: "05 Sept 2026 at 9:00 AM",
      chief_reason: "Chief Complaint: General Consultation | Acute follow-up",
      status: "CANCELLED"
    },
    {
      id: 2,
      patient_name: "Willy Weyru",
      phone: "0723503988",
      schedule: "03 Sept 2026 at 9:00 AM",
      chief_reason: "Chief Complaint: General Consultation | Blood pressure check",
      status: "CONFIRMED"
    },
    {
      id: 3,
      patient_name: "Willy Weyru",
      phone: "0723503988",
      schedule: "31 Aug 2026 at 9:00 AM",
      chief_reason: "Chief Complaint: General Consultation | Routine Screening",
      status: "CONFIRMED"
    }
  ]);

  const handleOpenChart = (patientName: string) => {
    alert(`Opening clinical chart workspace for ${patientName}`);
  };

  return (
    <div className="p-8 space-y-8 flex-1">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Live Practice Environment</span>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">Welcome back, {doctorName}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow">
            PP
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{doctorName}</p>
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span> Online
            </span>
          </div>
        </div>
      </div>

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Appointments</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{appointments.length}</h3>
          </div>
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Lab Reviews</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-2">7</h3>
          </div>
          <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Visits</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-2">0</h3>
          </div>
          <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Assigned Patient Queue Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Assigned Patient Queue</h3>
            <p className="text-xs text-gray-500 mt-0.5">Manage schedules, reviews, and clinical charts.</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Queue</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                <th className="py-4 px-6">Patient Name</th>
                <th className="py-4 px-6">Schedule</th>
                <th className="py-4 px-6">Chief Reason</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {appointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-gray-50/50 transition">
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    {appt.patient_name}
                    <span className="block text-xs text-gray-400 font-normal">{appt.phone}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{appt.schedule}</td>
                  <td className="py-4 px-6 text-gray-600 max-w-xs truncate">{appt.chief_reason}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                      appt.status === "CONFIRMED" 
                        ? "bg-amber-50 text-amber-700 border border-amber-200" 
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleOpenChart(appt.patient_name)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer"
                    >
                      Open Chart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
