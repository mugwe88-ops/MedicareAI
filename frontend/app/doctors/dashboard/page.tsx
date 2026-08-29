"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Appointment {
  id: number;
  patient_name: string;
  patient_email?: string;
  phone?: string;
  appointment_date: string;
  reason?: string;
  status: string;
  clinical_notes?: string;
  patient_chronic_conditions?: string;
  patient_allergies?: string;
  medical_history?: string;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activePatient, setActivePatient] = useState<Appointment | null>(null);
  const [modalType, setModalType] = useState<"note" | "quickView" | "quickLab" | null>(null);
  const [quickViewPatient, setQuickViewPatient] = useState<Appointment | null>(null);
  const [quickLabApt, setQuickLabApt] = useState<Appointment | null>(null);
  const [clinicalNote, setClinicalNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>("");
  const [labOrderForm, setLabOrderForm] = useState({ test_name: "", notes: "" });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/doctors/appointments");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || data || []);
      }
    } catch (err) {
      console.error("Failed to load appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const handleSelectPatient = (apt: Appointment) => {
    setActivePatient(apt);
    setClinicalNote(apt.clinical_notes || "");
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    setSubmitting(true);
    setFeedbackMsg("");

    try {
      const res = await fetch(`/api/appointments/${activePatient.id}/clinical-notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinical_notes: clinicalNote }),
      });

      if (res.ok) {
        setFeedbackMsg("Clinical note saved successfully!");
        fetchAppointments();
        setTimeout(() => {
          setModalType(null);
          setFeedbackMsg("");
        }, 1200);
      } else {
        setFeedbackMsg("Failed to save clinical note.");
      }
    } catch {
      setFeedbackMsg("An error occurred while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddLabOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLabApt) return;
    setSubmitting(true);
    setFeedbackMsg("");

    try {
      const res = await fetch("/api/lab-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_id: quickLabApt.id,
          patient_name: quickLabApt.patient_name,
          test_name: labOrderForm.test_name,
          notes: labOrderForm.notes,
        }),
      });

      if (res.ok) {
        setFeedbackMsg("Lab order submitted successfully!");
        setLabOrderForm({ test_name: "", notes: "" });
        setTimeout(() => {
          setModalType(null);
          setFeedbackMsg("");
        }, 1200);
      } else {
        setFeedbackMsg("Failed to submit lab order.");
      }
    } catch {
      setFeedbackMsg("Network error submitting lab order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 font-medium">
        Loading Doctor Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage patient consultations, records, and diagnostic workflows.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/doctors/schedule")}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
            >
              View Schedule
            </button>
            <button
              onClick={() => router.push("/doctors/telehealth")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
            >
              Start Telehealth Room
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Appointments List Panel */}
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">Patient Queue ({appointments.length})</h2>
            
            <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
              {appointments.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No active patient appointments found.</p>
              ) : (
                appointments.map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => handleSelectPatient(apt)}
                    className={`p-4 rounded-xl border transition cursor-pointer ${activePatient?.id === apt.id ? "border-blue-600 bg-blue-50/40 shadow-sm" : "border-slate-200 hover:bg-slate-50"}`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-sm text-slate-900">{apt.patient_name || "Patient"}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{formatDisplayDate(apt.appointment_date)}</p>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-1"><strong>Reason:</strong> {apt.reason || "General Consultation"}</p>
                    
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewPatient(apt);
                          setModalType("quickView");
                        }}
                        className="text-[11px] font-semibold text-blue-600 hover:underline"
                      >
                        Quick View
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickLabApt(apt);
                          setModalType("quickLab");
                        }}
                        className="text-[11px] font-semibold text-slate-600 hover:underline"
                      >
                        Order Lab
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Patient Workspace */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            {activePatient ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{activePatient.patient_name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Appointment: {formatDisplayDate(activePatient.appointment_date)}</p>
                  </div>
                  <button
                    onClick={() => setModalType("note")}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    Edit Clinical Note
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">Contact Details</p>
                    <p className="text-sm text-slate-800"><strong>Phone:</strong> {activePatient.phone || "N/A"}</p>
                    <p className="text-sm text-slate-800"><strong>Email:</strong> {activePatient.patient_email || "N/A"}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">Medical Background</p>
                    <p className="text-sm text-slate-800"><strong>Conditions:</strong> {activePatient.patient_chronic_conditions || "None reported"}</p>
                    <p className="text-sm text-slate-800"><strong>Allergies:</strong> {activePatient.patient_allergies || "None reported"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Clinical Notes</h3>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 min-h-[120px] text-sm text-slate-700 whitespace-pre-wrap">
                    {activePatient.clinical_notes || "No clinical notes documented yet. Click 'Edit Clinical Note' above to add observations."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-24 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-lg">
                  🩺
                </div>
                <h3 className="text-base font-bold text-slate-800">No Patient Selected</h3>
                <p className="text-xs text-slate-500 max-w-sm">Select a patient appointment from the queue on the left to review records, manage charts, and add clinical notes.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Unified Modal Backdrop */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            
            {/* Clinical Note Modal */}
            {modalType === "note" && (
              <form onSubmit={handleSaveNote} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Clinical Documentation</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Patient: {activePatient?.patient_name || "Patient"}
                  </p>
                </div>

                {feedbackMsg && (
                  <div className={`p-3 rounded-lg text-xs font-medium ${feedbackMsg.includes("saved") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {feedbackMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Clinical Notes & Observations</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Enter detailed diagnosis, treatment plan, and consultation notes..."
                    value={clinicalNote}
                    onChange={(e) => setClinicalNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm shadow-sm disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Clinical Note"}
                  </button>
                </div>
              </form>
            )}

            {/* Quick View Record Modal */}
            {modalType === "quickView" && quickViewPatient && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Patient Record Summary</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {quickViewPatient.patient_name || "Anonymous Patient"} • {formatDisplayDate(quickViewPatient.appointment_date)}
                  </p>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">Contact Phone</p>
                    <p className="text-slate-800 font-medium">{quickViewPatient.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">Reason for Visit</p>
                    <p className="text-slate-800 font-medium">{quickViewPatient.reason || "General Consultation"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">Medical History / Questionnaire</p>
                    <p className="text-slate-700 mt-0.5">
                      {quickViewPatient.patient_chronic_conditions || quickViewPatient.patient_allergies ? (
                        <>
                          <strong>Conditions:</strong> {quickViewPatient.patient_chronic_conditions || 'None'}<br />
                          <strong>Allergies:</strong> {quickViewPatient.patient_allergies || 'None'}
                        </>
                      ) : (
                        quickViewPatient.medical_history || "No questionnaire history provided."
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">Clinical Notes</p>
                    <p className="text-slate-700 mt-0.5 italic">
                      {quickViewPatient.clinical_notes || "No clinical notes added yet."}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const apt = quickViewPatient;
                      setModalType(null);
                      setQuickViewPatient(null);
                      handleSelectPatient(apt);
                    }}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm shadow-sm"
                  >
                    Open Full Workspace
                  </button>
                </div>
              </div>
            )}

            {/* Quick Lab Order Modal */}
            {modalType === "quickLab" && (
              <form onSubmit={handleAddLabOrder} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Order Lab Test</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For: {quickLabApt?.patient_name || "Patient"}
                  </p>
                </div>

                {feedbackMsg && (
                  <div className={`p-3 rounded-lg text-xs font-medium ${feedbackMsg.includes("success") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {feedbackMsg}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Test Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Complete Blood Count (CBC)"
                      value={labOrderForm.test_name}
                      onChange={(e) => setLabOrderForm({ ...labOrderForm, test_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Lab Instructions / Notes</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Fasting required for 8 hours prior"
                      value={labOrderForm.notes}
                      onChange={(e) => setLabOrderForm({ ...labOrderForm, notes: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm shadow-sm disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Lab Order"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}