'use client';

import { useState, useEffect } from 'react';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [medicationDetails, setMedicationDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch Dashboard Data
  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [appRes, prescRes] = await Promise.all([
        fetch('https://medicareai-backend.onrender.com/api/appointments/doctor', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('https://medicareai-backend.onrender.com/api/doctor/prescriptions', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (appRes.ok) setAppointments(await appRes.json());
      if (prescRes.ok) setPrescriptions(await prescRes.json());
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Submit Prescription Handler
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

      // Reset form & close modal
      setPatientName('');
      setMedicationDetails('');
      setIsModalOpen(false);
      fetchData(); // Refresh table list
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Action Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Provider Control Center Workspace</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            + New Prescription
          </button>
        </div>
      </div>

      {/* Prescription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-white">Issue New Prescription</h2>

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
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
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
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded transition disabled:opacity-50"
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