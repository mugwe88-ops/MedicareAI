"use client";
import { useState, useEffect } from "react";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("https://medicareai-1.onrender.com/api/appointments", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm">
          + New Booking
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-gray-600 font-semibold">Patient</th>
              <th className="p-4 text-gray-600 font-semibold">Date</th>
              <th className="p-4 text-gray-600 font-semibold">Time</th>
              <th className="p-4 text-gray-600 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-10 text-center text-gray-400">Loading...</td></tr>
            ) : appointments.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-gray-400">No appointments found.</td></tr>
            ) : (
              appointments.map((app: any) => (
                <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-800 font-medium">{app.patient_name || "Guest"}</td>
                  <td className="p-4 text-gray-600">{new Date(app.appointment_date).toLocaleDateString()}</td>
                  <td className="p-4 text-gray-600">{app.appointment_time}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                      {app.status || "Pending"}
                    </span>
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