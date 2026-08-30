"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Video, 
  Calendar, 
  Settings, 
  Bell, 
  Users, 
  FileText, 
  Activity, 
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  FilePlus,
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
  const [doctorName, setDoctorName] = useState("Dr. PRESSY PHIDES");
  const [loading, setLoading] = useState(false);
  
  // Mock live data matching your workspace needs
  const [appointments, setAppointments] = useState<PatientAppointment[]>([
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
    // Navigate or trigger modal for patient chart view
    alert(`Opening clinical chart workspace for ${patientName}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0B132B] text-white flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 border-b border-gray-800">
            <span className="text-xs tracking-wider text-blue-400 font-semibold uppercase">Swift MD Portal</span>
            <h1 className="text-xl font-bold tracking-tight mt-1">Doctor Workspace</h1>
          </div>
          <nav className="p-4 space-y-2">
            <a href="/doctors/dashboard" className="flex items-center space-x-3 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-md">
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </a>
            <a href="/doctors/telehealth" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl transition">
              <Video className="h-5 w-5" />
              <span>Telehealth Room</span>
            </a>
            <a href="/doctors/schedule" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl transition">
              <Calendar className="h-5 w-5" />
              <span>Schedule Manager</span>
            </a>
            <a href="/doctors/settings" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl transition">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </a>
          </nav>
        </div>

        {/* Doctor Profile Footer in Sidebar */}
        <div className="p-4 border-t border-gray-800 m-4 bg-gray-900/50 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
              DP
            </div>
            <div>
              <p className="text-sm font-bold text-white">{doctorName}</p>
              <span className="text-xs text-green-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span> Online
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <div>
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Live Practice Environment</span>
            <h2 className="text-xl font-extrabold text-gray-900">Welcome back, {doctorName}</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">7</span>
            </button>
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow">
              PP
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8">
          
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
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-3 py-1.5 rounded-lg transition"
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
                          className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-semibold transition shadow-sm"
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
      </main>
    </div>
  );
}
