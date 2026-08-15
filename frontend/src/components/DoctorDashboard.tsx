'use client';

import { useState, useEffect } from 'react';

interface Appointment {
  id: number;
  patient_name: string;
  phone?: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string;
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorName, setDoctorName] = useState('Provider');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://medicareai-1.onrender.com';

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.name) setDoctorName(parsed.name);
      } catch (e) {
        console.error('Failed to parse user profile', e);
      }
    }
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Try backend base API first, fall back to relative route
      let res = await fetch(`${API_BASE}/api/appointments/doctor`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        res = await fetch('/api/appointments/doctor', {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setAppointments(data);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      
      let res = await fetch(`${API_BASE}/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        res = await fetch(`/api/appointments/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });
      }

      if (res.ok) {
        fetchAppointments();
      } else {
        alert('Failed to update appointment status.');
      }
    } catch (err) {
      console.error('Status Update Error:', err);
    }
  };

  const totalAppointments = appointments.length;
  const inQueueCount = appointments.filter(
    (a) => a.status?.toLowerCase() === 'confirmed' || a.status?.toLowerCase() === 'pending'
  ).length;
  const completedCount = appointments.filter(
    (a) => a.status?.toLowerCase() === 'completed'
  ).length;

  const filteredAppointments = appointments.filter(
    (apt) =>
      apt.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`}</h1>
          <p className="text-gray-400 text-sm">Provider Control Center Workspace</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs rounded-md">
            Available
          </span>
          <span className="px-3 py-1 bg-gray-800 text-gray-400 text-xs rounded-md">
            In Visit
          </span>
          <span className="px-3 py-1 bg-gray-800 text-gray-400 text-xs rounded-md">
            On Break
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#131926] border border-gray-800 p-5 rounded-xl">
          <p className="text-xs text-gray-400 mb-1">Total Appointments</p>
          <p className="text-2xl font-bold">{totalAppointments}</p>
        </div>
        <div className="bg-[#131926] border border-gray-800 p-5 rounded-xl">
          <p className="text-xs text-gray-400 mb-1">In Queue</p>
          <p className="text-2xl font-bold">{inQueueCount}</p>
        </div>
        <div className="bg-[#131926] border border-gray-800 p-5 rounded-xl">
          <p className="text-xs text-gray-400 mb-1">Completed</p>
          <p className="text-2xl font-bold text-emerald-400">{completedCount}</p>
        </div>
        <div className="bg-[#131926] border border-gray-800 p-5 rounded-xl">
          <p className="text-xs text-gray-400 mb-1">Total Prescriptions</p>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex justify-between items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search patient by name, reason, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/3 bg-[#131926] border border-gray-800 text-sm px-4 py-2.5 rounded-lg text-white focus:outline-none focus:border-indigo-500"
        />
        <div className="flex gap-3">
          <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium">
            + New Prescription
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium">
            Start Quick Consult
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#131926] border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            INCOMING PATIENT SCHEDULE ({filteredAppointments.length})
          </h2>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-[#0f1420] text-gray-400 text-xs uppercase border-b border-gray-800">
            <tr>
              <th className="px-6 py-4">PATIENT PROFILE</th>
              <th className="px-6 py-4">TIME WINDOW</th>
              <th className="px-6 py-4">REASON</th>
              <th className="px-6 py-4">STATUS</th>
              <th className="px-6 py-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Loading schedule...
                </td>
              </tr>
            ) : filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No appointments found.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-[#182030] transition-colors">
                  <td className="px-6 py-4 font-semibold">
                    {apt.patient_name}
                    <div className="text-xs text-gray-500 font-normal">
                      📞 {apt.phone || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {apt.appointment_date ? new Date(apt.appointment_date).toLocaleDateString() : 'Today'}, {apt.appointment_time || '9:00 AM'}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{apt.reason}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase border ${
                        apt.status?.toLowerCase() === 'completed'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                          : 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      • {apt.status || 'CONFIRMED'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      {apt.status?.toLowerCase() !== 'completed' && (
                        <>
                          <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md">
                            🎥 Join Call
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'completed')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors"
                          >
                            ✓ Complete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}