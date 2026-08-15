'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DoctorDashboard() {
  const router = useRouter();
  const [doctorName, setDoctorName] = useState('Dr. Provider');
  const [status, setStatus] = useState('Available');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [medicationDetails, setMedicationDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch Dashboard Data
  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.name) setDoctorName(parsed.name);
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
    }

    try {
      const [appRes, prescRes] = await Promise.all([
        fetch('https://medicareai-backend.onrender.com/api/appointments/doctor', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('https://medicareai-backend.onrender.com/api/doctor/prescriptions', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (appRes.ok) {
        const appData = await appRes.json();
        setAppointments(Array.isArray(appData) ? appData : []);
      }
      if (prescRes.ok) {
        const prescData = await prescRes.json();
        setPrescriptions(Array.isArray(prescData) ? prescData : []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Submit Prescription
  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!patientName.trim() || !medicationDetails.trim()) {
      setErrorMessage('Patient name and medication details are required.');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('https://medicareai-backend.onrender.com/api/doctor/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patient_name: patientName,
          medication_details: medicationDetails,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to issue prescription.');
      }

      setPatientName('');
      setMedicationDetails('');
      setIsModalOpen(false);
      fetchData(); // Refresh UI lists
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Lists
  const filteredAppointments = appointments.filter(
    (app) =>
      app.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedCount = appointments.filter((a) => a.status?.toLowerCase() === 'completed').length;
  const totalCount = appointments.length;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-8 space-y-8 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Welcome, {doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`}
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">
            Provider Control Center Workspace
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-lg flex space-x-1">
            {['Available', 'In Visit', 'On Break'].map((item) => (
              <button
                key={item}
                onClick={() => setStatus(item)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  status === item
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              localStorage.clear();
              router.push('/login');
            }}
            className="border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition"
          >
            <span>Exit Panel</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Total Appointments</p>
            <p className="text-3xl font-black text-white mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center font-bold text-lg">
            👥
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">In Queue</p>
            <p className="text-3xl font-black text-white mt-1">0</p>
          </div>
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center font-bold text-lg">
            ⏱️
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Completed</p>
            <p className="text-3xl font-black text-white mt-1">{completedCount}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center font-bold text-lg">
            ✅
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Total Prescriptions</p>
            <p className="text-3xl font-black text-white mt-1">{prescriptions.length}</p>
          </div>
          <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center font-bold text-lg">
            📄
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Search patient by name, reason, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-96 bg-slate-900/80 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        />

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition shadow-lg shadow-blue-600/20"
          >
            + New Prescription
          </button>
          <button className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition shadow-lg shadow-purple-600/20">
            Start Quick Consult
          </button>
        </div>
      </div>

      {/* Incoming Patient Schedule */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 space-y-4">
        <h2 className="text-xs font-bold text-blue-400 tracking-wider uppercase">
          Incoming Patient Schedule ({filteredAppointments.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-xs font-semibold text-slate-400 uppercase">
                <th className="py-3 px-4">Patient Profile</th>
                <th className="py-3 px-4">Time Window</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                    No matching appointments found.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/20 transition">
                    <td className="py-3 px-4 font-semibold text-white">
                      {app.patient_name || 'Anonymous Patient'}
                      <div className="text-[11px] font-normal text-slate-500">📞 N/A</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300">
                      {app.appointment_date} {app.appointment_time || ''}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300">{app.reason}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          app.status?.toLowerCase() === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        • {app.status || 'CONFIRMED'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => router.push(`/telehealth/${app.id}`)}
                        className="bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white px-3 py-1.5 rounded-md text-xs font-semibold transition"
                      >
                        🎥 Join Call
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issued Prescriptions Table */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 space-y-4">
        <h2 className="text-xs font-bold text-purple-400 tracking-wider uppercase">
          Issued Prescriptions & Clinical Notes ({prescriptions.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-xs font-semibold text-slate-400 uppercase">
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Medication & Dosage Details</th>
                <th className="py-3 px-4">Date Issued</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500 text-xs">
                    No issued prescriptions on record.
                  </td>
                </tr>
              ) : (
                prescriptions.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/20 transition">
                    <td className="py-3 px-4 font-semibold text-white">{p.patient_name}</td>
                    <td className="py-3 px-4 text-xs text-slate-300">{p.medication_details}</td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {p.created_at ? new Date(p.created_at).toLocaleString() : 'Aug 15, 2026'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        • {p.status || 'ISSUED'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Prescription Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-white">Issue New Prescription</h2>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Willy Weru"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Medication & Dosage Details
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Amoxicillin 500mg - 1 tablet 3x daily for 7 days"
                  value={medicationDetails}
                  onChange={(e) => setMedicationDetails(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Issuing...' : 'Issue Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}