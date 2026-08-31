"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Activity, 
  Clock,
  RefreshCw,
  UserCheck,
  Building2,
  CalendarDays
} from "lucide-react";

interface PatientAppointment {
  id: number;
  patient_name: string;
  phone: string;
  schedule: string;
  chief_reason: string;
  status: "CONFIRMED" | "CANCELLED" | "PENDING";
  gender: string;
  age: number;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [doctorName] = useState("Dr. Robert Fox");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<PatientAppointment[]>([
    {
      id: 1,
      patient_name: "Jorge",
      phone: "0723503988",
      schedule: "20 May 7:30pm",
      chief_reason: "General Consultation & Acute follow-up",
      status: "CONFIRMED",
      gender: "Female",
      age: 76
    },
    {
      id: 2,
      patient_name: "Phillip",
      phone: "0723503988",
      schedule: "20 May 8:30pm",
      chief_reason: "Blood pressure check & review",
      status: "CONFIRMED",
      gender: "Male",
      age: 47
    },
    {
      id: 3,
      patient_name: "Nathan",
      phone: "0723503988",
      schedule: "20 May 9:00pm",
      chief_reason: "Routine Screening & Lab Follow-up",
      status: "CONFIRMED",
      gender: "Female",
      age: 40
    },
    {
      id: 4,
      patient_name: "Soham",
      phone: "0723503988",
      schedule: "20 May 6:30pm",
      chief_reason: "General Consultation",
      status: "CONFIRMED",
      gender: "Female",
      age: 43
    }
  ]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://medicareai-backend.onrender.com";
      const res = await fetch(`${apiUrl}/api/appointments`);
      if (!res.ok) throw new Error("Failed to fetch appointments from backend");
      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map((item: any, index: number) => ({
          id: item.id || index + 1,
          patient_name: item.patient_name || item.name || "Patient",
          phone: item.phone || "N/A",
          schedule: item.schedule || item.date || "Scheduled",
          chief_reason: item.chief_reason || item.reason || "General Consultation",
          status: item.status || "CONFIRMED",
          gender: item.gender || "N/A",
          age: item.age || 30
        }));
        setAppointments(formatted);
      }
    } catch (err: any) {
      console.warn("Using fallback local appointment data:", err.message);
      setError("Running on offline preview cache (Backend loading...)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleOpenChart = (patientName: string) => {
    alert(`Opening clinical chart workspace for ${patientName}`);
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Overview / Hospital Workspace</span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Welcome back, {doctorName}</h2>
          {error && <p className="text-xs text-amber-600 font-medium mt-1">{error}</p>}
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
          <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
            RF
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{doctorName}</p>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> Active Admin
            </span>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Doctors</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">2,937</h3>
            <span className="text-xs text-blue-600 font-medium mt-1 inline-block">+3 Doctors joined this week</span>
          </div>
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Staffs</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">5,453</h3>
            <span className="text-xs text-amber-600 font-medium mt-1 inline-block">8 Staffs on vacation</span>
          </div>
          <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Patients</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">170K</h3>
            <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">175 New patients admitted</span>
          </div>
          <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pharmacies</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">21</h3>
            <span className="text-xs text-indigo-600 font-medium mt-1 inline-block">85k Medicine on reserve</span>
          </div>
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Middle Section: Hospital Report & Success Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Hospital Report & Alerts</h3>
            <span className="text-xs text-blue-600 font-semibold cursor-pointer">View All</span>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Activity size={18} /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Room 501 AC is not working</p>
                  <p className="text-xs text-slate-400">Reported by Steve</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md">Pending</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Clock size={18} /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Daniel extended his holiday</p>
                  <p className="text-xs text-slate-400">Reported by Andrew</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md">Logged</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Success Stats</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Anesthetics</span>
                <span>83%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: "83%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Gynecology</span>
                <span>95%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: "95%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Neurology</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Orthopedics</span>
                <span>97%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: "97%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Online Appointments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Online Appointment Queue</h3>
            <p className="text-xs text-slate-400 mt-0.5">Live tracking schedule synced from backend database.</p>
          </div>
          <button 
            onClick={fetchAppointments} 
            disabled={loading}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Syncing..." : "Refresh"}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="py-4 px-6">No.</th>
                <th className="py-4 px-6">Patient Name</th>
                <th className="py-4 px-6">Schedule Time</th>
                <th className="py-4 px-6">Age</th>
                <th className="py-4 px-6">Gender</th>
                <th className="py-4 px-6">Assigned Doctor</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {appointments.map((appt, idx) => (
                <tr key={appt.id || idx} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 font-bold text-slate-500">0{idx + 1}</td>
                  <td className="py-4 px-6 font-semibold text-slate-900">{appt.patient_name}</td>
                  <td className="py-4 px-6 text-slate-600 flex items-center gap-1.5 pt-5">
                    <CalendarDays size={14} className="text-blue-500" /> {appt.schedule}
                  </td>
                  <td className="py-4 px-6 text-slate-600">{appt.age}</td>
                  <td className="py-4 px-6 text-slate-600">{appt.gender}</td>
                  <td className="py-4 px-6 text-slate-700 font-medium">{doctorName}</td>
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
