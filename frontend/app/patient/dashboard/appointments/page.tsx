'use client';

import React, { useState, useEffect } from 'react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

export default function BookAppointmentPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form States (Combined Appointment Details + Medical Questionnaire)
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [bodySystem, setBodySystem] = useState('General / Systemic');
  const [symptomSeverity, setSymptomSeverity] = useState('Moderate');
  const [symptomDuration, setSymptomDuration] = useState('1-3 days');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [painScale, setPainScale] = useState(3);
  const [reason, setReason] = useState('');

  // Questionnaire States
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState('');
  const [pastSurgeries, setPastSurgeries] = useState('No');

  const availableSymptoms = ['Fever', 'Fatigue / Weakness', 'Shortness of Breath', 'Dizziness', 'Nausea', 'Acute Pain'];
  const chronicOptions = ['Hypertension', 'Diabetes', 'Asthma', 'Heart Disease', 'Epilepsy', 'None'];

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://medicareai-1.onrender.com'}/api/doctors`);
        if (res.ok) {
          const data = await res.json();
          setDoctors(data);
        }
      } catch (err) {
        console.error('Failed to load doctors', err);
      }
    }
    fetchDoctors();
  }, []);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const toggleChronicCondition = (condition: string) => {
    if (condition === 'None') {
      setChronicConditions(['None']);
      return;
    }
    setChronicConditions(prev => {
      const filtered = prev.filter(c => c !== 'None');
      return filtered.includes(condition) ? filtered.filter(c => c !== condition) : [...filtered, condition];
    });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const token = localStorage.getItem('token');

    const payload = {
      doctorId: selectedDoctor,
      bodySystem,
      symptomSeverity,
      symptomDuration,
      associatedSymptoms: selectedSymptoms,
      painScale,
      reason,
      questionnaire: {
        age: Number(age),
        phone,
        chronicConditions,
        allergies,
        pastSurgeries
      }
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://medicareai-1.onrender.com'}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to book appointment. Please check your inputs.');
      }

      setSuccessMsg('Appointment and medical questionnaire successfully submitted!');
      // Reset form or redirect if needed
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-slate-100">
      <form onSubmit={handleBookingSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Book Appointment</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Secure Clinical Entry & Medical Questionnaire</p>
        </div>

        {successMsg && <div className="p-4 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded-xl text-sm">{successMsg}</div>}
        {errorMsg && <div className="p-4 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl text-sm">{errorMsg}</div>}

        {/* SECTION 1: Doctor & Clinical Info */}
        <div className="space-y-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Select Doctor</label>
          <select 
            value={selectedDoctor} 
            onChange={(e) => setSelectedDoctor(e.target.value)}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">-- Select Doctor --</option>
            {doctors.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</option>
            ))}
          </select>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Body System</label>
              <select value={bodySystem} onChange={(e) => setBodySystem(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white">
                <option>General / Systemic</option>
                <option>Cardiovascular</option>
                <option>Respiratory</option>
                <option>Neurological</option>
                <option>Gastrointestinal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Symptom Severity</label>
              <select value={symptomSeverity} onChange={(e) => setSymptomSeverity(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white">
                <option>Mild</option>
                <option>Moderate</option>
                <option>Severe</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Symptom Duration</label>
              <select value={symptomDuration} onChange={(e) => setSymptomDuration(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white">
                <option>Less than 24 hours</option>
                <option>1-3 days</option>
                <option>1 week+</option>
              </select>
            </div>
          </div>

          {/* Associated Symptoms */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Common Associated Symptoms (Select All That Apply)</label>
            <div className="flex flex-wrap gap-2">
              {availableSymptoms.map(sym => {
                const active = selectedSymptoms.includes(sym);
                return (
                  <button
                    type="button"
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      active ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {active ? `- ${sym}` : `+ ${sym}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pain Scale */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pain Scale (0 = None, 10 = Unbearable)</label>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-2.5 py-0.5 rounded-full">Level: {painScale} / 10</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="10" 
              value={painScale} 
              onChange={(e) => setPainScale(Number(e.target.value))}
              className="w-full accent-blue-600 bg-slate-950" 
            />
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reason for Visit / Detailed Symptoms</label>
            <textarea 
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your symptoms in detail..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <hr className="border-slate-800" />

        {/* SECTION 2: Integrated Patient Medical Questionnaire */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Patient Medical Questionnaire</h2>
            <p className="text-xs text-slate-400">Please complete your health profile details for your doctor</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Age</label>
              <input 
                type="number" 
                value={age} 
                onChange={(e) => setAge(e.target.value)} 
                placeholder="e.g. 30"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="0723503988"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
              />
            </div>
          </div>

          {/* Chronic Conditions */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">1. Do you have any of the following chronic conditions? (Check all that apply)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {chronicOptions.map(cond => {
                const checked = chronicConditions.includes(cond);
                return (
                  <div 
                    key={cond}
                    onClick={() => toggleChronicCondition(cond)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      checked ? 'bg-blue-950/30 border-blue-600 text-blue-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-sm">{cond}</span>
                    <input type="checkbox" checked={checked} readOnly className="accent-blue-600" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">2. Do you have any drug or food allergies? (E.g., Sulphur, penicillin, dust)</label>
            <input 
              type="text" 
              value={allergies} 
              onChange={(e) => setAllergies(e.target.value)} 
              placeholder="Sulphur"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
            />
          </div>

          {/* Past Surgeries */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">3. Have you had any past major surgeries or hospitalizations?</label>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input 
                  type="radio" 
                  name="surgeries" 
                  value="No" 
                  checked={pastSurgeries === 'No'} 
                  onChange={(e) => setPastSurgeries(e.target.value)} 
                /> No
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input 
                  type="radio" 
                  name="surgeries" 
                  value="Yes" 
                  checked={pastSurgeries === 'Yes'} 
                  onChange={(e) => setPastSurgeries(e.target.value)} 
                /> Yes
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/30 disabled:opacity-50"
        >
          {loading ? 'Submitting Appointment & Profile...' : 'Confirm & Book Appointment'}
        </button>
      </form>
    </div>
  );
}
