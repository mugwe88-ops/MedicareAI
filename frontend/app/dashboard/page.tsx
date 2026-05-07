"use client";
import { useState, useEffect } from "react";
import { Users, CheckCircle2, Trash2, Search, Bell, Filter } from "lucide-react";

export default function ClinicalConsole() {
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndData = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        // 1. Fetch Profile
        const userRes = await fetch("https://medicareai-1.onrender.com/api/auth/me", {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!userRes.ok) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        const userData = await userRes.json();
        
        // Fix: Backend usually returns { user: {...} } or the user object directly.
        // We ensure we get the nested user if it exists.
        const activeUser = userData.user || userData;
        setUser(activeUser);

        // 2. Role Protection: If NOT a doctor, send to patient portal
        if (activeUser.role?.toLowerCase() === "patient") {
          window.location.href = "/patient-portal";
          return;
        }

        // 3. Fetch Appointments only after confirming doctor role
        const apptRes = await fetch("https://medicareai-1.onrender.com/api/appointments", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (apptRes.ok) {
          const apptData = await apptRes.json();
          setAppointments(apptData);
        }

      } catch (err) {
        console.error("Dashboard sync error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-500 font-bold">Verifying MedicareAI Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] min-h-screen">
      <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-12 sticky top-0 z-10">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search patients..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none" />
        </div>
        
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-black text-slate-900 leading-tight">{user?.name}</p>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{user?.role}</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black">
              {user?.name?.split(' ').map((n:any) => n[0]).join('').toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="p-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black text-slate-900">Clinical Console</h1>
          <p className="text-slate-500 font-semibold mt-2">
            Status: <span className="text-blue-600">{appointments.length} active records</span>
          </p>

          <div className="mt-10 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase">Patient</th>
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase">Timing</th>
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.map((apt: any) => (
                  <tr key={apt.id} className="hover:bg-blue-50/30 transition-all">
                    <td className="px-10 py-8 font-black text-slate-900">{apt.patient_name || "New Patient"}</td>
                    <td className="px-10 py-8 text-sm text-slate-600">{apt.appointment_date_str || "TBD"}</td>
                    <td className="px-10 py-8">
                       <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black rounded-full border border-orange-100">
                        {apt.status?.toUpperCase()}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}