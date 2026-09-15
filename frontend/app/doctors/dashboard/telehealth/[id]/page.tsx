'use client';

import React, { useState, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MessageSquare, 
  FileText, 
  Settings, 
  ShieldAlert, 
  PhoneOff, 
  Sparkles, 
  Lock, 
  Wifi, 
  Circle, 
  Globe, 
  Download, 
  AlertTriangle, 
  Pill, 
  Activity, 
  Layers
} from 'lucide-react';

interface PageProps {
  params: {
    id: string;
  };
}

export default function TelehealthConsultationPage({ params }: PageProps) {
  const consultationId = params.id;

  // Call State
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(true);
  const [callDuration, setCallDuration] = useState('14:32');
  const [activeTab, setActiveTab] = useState<'soap' | 'history' | 'medications' | 'orders'>('soap');

  // Interactive Clinical Workspace States
  const [soapNotes, setSoapNotes] = useState({
    subjective: 'Patient reports persistent lower back pain radiating to the left leg for 3 weeks, aggravated by prolonged sitting.',
    objective: 'Mild tenderness over L4-L5 vertebrae. Straight leg raise test positive on left at 45 degrees.',
    assessment: 'Lumbar radiculopathy secondary to suspected disc bulge.',
    plan: '1. Prescribe NSAIDs and muscle relaxants.\n2. Order lumbar spine MRI.\n3. Physiotherapy referral.\n4. Follow-up in 2 weeks.'
  });

  const [prescriptionInput, setPrescriptionInput] = useState('');
  const [prescriptions, setPrescriptions] = useState([
    { name: 'Ibuprofen 400mg', dosage: '1 tab t.i.d. for 7 days', status: 'e-Sent' },
    { name: 'Cyclobenzaprine 10mg', dosage: '1 tab at bedtime for 5 days', status: 'e-Sent' }
  ]);

  const [translationActive, setTranslationActive] = useState(false);

  // Timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      // timer background tick
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddPrescription = () => {
    if (!prescriptionInput) return;
    setPrescriptions([...prescriptions, { name: prescriptionInput, dosage: 'As directed', status: 'Pending e-Sign' }]);
    setPrescriptionInput('');
  };

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
      
      {/* TOP BAR: Encryption, Call Stats, Recording, & Network Quality */}
      <header className="px-6 py-2.5 bg-[#0b101b]/90 backdrop-blur border-b border-slate-800/80 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-400">
            <Lock className="w-3 h-3" /> 256-bit Encrypted
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-xs font-medium text-slate-300">
            <Wifi className="w-3 h-3 text-emerald-400" /> Excellent (14ms)
          </div>
          {isRecording && (
            <div className="flex items-center gap-1.5 bg-rose-950/60 border border-rose-900/60 px-2.5 py-1 rounded-full text-xs font-medium text-rose-400">
              <Circle className="w-2.5 h-2.5 fill-rose-500 animate-pulse" /> Recording Active
            </div>
          )}
        </div>

        {/* Call Duration & Dynamic Session ID */}
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-slate-300">Consultation ID: #SWIFT-{consultationId}</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-blue-400 font-bold">{callDuration}</span>
        </div>
      </header>

      {/* ABOVE-VIDEO PATIENT SUMMARY CARD */}
      <div className="px-6 py-2 bg-[#0c121e] border-b border-slate-800/60 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-slate-400">Patient:</span> <strong className="text-white text-sm ml-1">James Mwangi</strong> <span className="text-slate-400">(34M)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-400">Blood Group:</span> <strong className="text-blue-400">O Positive</strong>
            </div>
            <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-900/60 px-2.5 py-1 rounded-lg text-rose-300 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" /> Allergies: Penicillin, Sulfa drugs
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-400">Meds:</span> <span className="text-slate-200">Metformin 500mg</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Last Visit: <strong className="text-slate-200">Aug 12, 2026</strong></span>
            <span>Primary Dx: <strong className="text-amber-400">Lumbar Radiculopathy</strong></span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID (70% Video Area vs 30% Clinical Workspace) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* LEFT: Video Stage (70% width -> col-span-8) */}
        <div className="lg:col-span-8 bg-[#05070b] relative flex flex-col justify-between p-4 overflow-hidden">
          
          {/* Patient Video (Big View ~70% screen) */}
          <div className="relative flex-1 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-2xl flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-24 h-24 rounded-full bg-blue-600/20 border-2 border-blue-500/40 mx-auto flex items-center justify-center text-3xl font-bold text-blue-400 shadow-inner">
                  JM
                </div>
                <h3 className="text-lg font-semibold text-slate-200">James Mwangi</h3>
                <p className="text-xs text-slate-400">Connected via Secure WebRTC (HD 1080p)</p>
              </div>
            </div>

            {/* Floating Doctor Video (Picture-in-Picture in bottom-right) */}
            <div className="absolute bottom-4 right-4 w-44 h-32 rounded-xl bg-slate-900 border-2 border-slate-700 overflow-hidden shadow-2xl flex items-center justify-center">
              {isVideoOff ? (
                <div className="text-xs text-slate-500 font-medium">Camera Off</div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <span className="text-xs font-semibold text-slate-300">Dr. William W. (You)</span>
                </div>
              )}
              <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur px-1.5 py-0.5 rounded text-[10px] text-slate-200">
                {isMuted ? 'Muted' : 'Mic Active'}
              </div>
            </div>

            {/* Live Swahili ↔ English Translation Floating Overlay Banner */}
            {translationActive && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-950/80 backdrop-blur border border-blue-700/60 px-4 py-2 rounded-2xl text-xs text-blue-200 max-w-lg text-center shadow-lg">
                <span className="font-bold uppercase text-[10px] text-blue-400 block mb-0.5">Real-time Swahili Translation Active</span>
                "Maumivu ya chini ya mgongo yalianza wiki tatu zilizopita..." → "Lower back pain started three weeks ago..."
              </div>
            )}
          </div>

          {/* FLOATING CALL CONTROLS BAR (Blurred background) */}
          <div className="mt-3 py-3 px-6 bg-slate-950/70 backdrop-blur-md border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl shrink-0">
            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full transition shadow-lg ${isMuted ? 'bg-rose-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'}`}
                title="Mute / Unmute"
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <button 
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3 rounded-full transition shadow-lg ${isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'}`}
                title="Camera On / Off"
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button 
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-3 rounded-full transition shadow-lg ${isScreenSharing ? 'bg-blue-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'}`}
                title="Screen Share"
              >
                <Monitor className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setTranslationActive(!translationActive)}
                className={`p-3 rounded-full transition shadow-lg ${translationActive ? 'bg-indigo-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'}`}
                title="Real-time Translation (Swahili ↔ English)"
              >
                <Globe className="w-5 h-5" />
              </button>

              <button className="p-3 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition shadow-lg" title="Live Chat">
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button className="p-3 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition shadow-lg" title="Settings">
                <Settings className="w-5 h-5" />
              </button>

              <button className="px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs flex items-center gap-2 transition shadow-lg" title="Emergency SOS">
                <ShieldAlert className="w-4 h-4 text-rose-400" /> Emergency SOS
              </button>

              <button 
                onClick={() => alert(`Ending consultation #${consultationId} and saving SOAP notes...`)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg shadow-rose-600/30 flex items-center gap-2"
              >
                <PhoneOff className="w-4 h-4" /> End Session
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT: Clinical Workspace Panel (Tabbed: SOAP Notes, Patient History, Medications, Orders) */}
        <div className="lg:col-span-4 bg-[#0d121c] border-l border-slate-800 flex flex-col h-full overflow-hidden">
          
          {/* Tabs Navigation */}
          <div className="grid grid-cols-4 bg-[#090d16] border-b border-slate-800 text-xs font-semibold text-slate-400 shrink-0">
            <button 
              onClick={() => setActiveTab('soap')}
              className={`py-3 text-center border-b-2 transition ${activeTab === 'soap' ? 'border-blue-500 text-blue-400 bg-slate-900/50' : 'border-transparent hover:text-slate-200'}`}
            >
              SOAP
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`py-3 text-center border-b-2 transition ${activeTab === 'history' ? 'border-blue-500 text-blue-400 bg-slate-900/50' : 'border-transparent hover:text-slate-200'}`}
            >
              History
            </button>
            <button 
              onClick={() => setActiveTab('medications')}
              className={`py-3 text-center border-b-2 transition ${activeTab === 'medications' ? 'border-blue-500 text-blue-400 bg-slate-900/50' : 'border-transparent hover:text-slate-200'}`}
            >
              Meds
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`py-3 text-center border-b-2 transition ${activeTab === 'orders' ? 'border-blue-500 text-blue-400 bg-slate-900/50' : 'border-transparent hover:text-slate-200'}`}
            >
              Orders
            </button>
          </div>

          {/* Workspace Body Content */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            
            {activeTab === 'soap' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" /> SOAP Clinical Notes
                  </h4>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">Auto-saved</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Subjective</label>
                    <textarea 
                      value={soapNotes.subjective}
                      onChange={(e) => setSoapNotes({...soapNotes, subjective: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 h-20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Objective</label>
                    <textarea 
                      value={soapNotes.objective}
                      onChange={(e) => setSoapNotes({...soapNotes, objective: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 h-20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Assessment</label>
                    <input 
                      type="text" 
                      value={soapNotes.assessment}
                      onChange={(e) => setSoapNotes({...soapNotes, assessment: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Plan & Orders</label>
                    <textarea 
                      value={soapNotes.plan}
                      onChange={(e) => setSoapNotes({...soapNotes, plan: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 h-24 resize-none"
                    />
                  </div>

                  {/* AI Assistant Generator */}
                  <button 
                    onClick={() => alert('AI Assistant generated draft SOAP notes successfully based on live call transcription.')}
                    className="w-full py-2 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/80 text-blue-300 font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-blue-400" /> Draft SOAP Notes with AI
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-400" /> Patient Clinical Timeline
                </h4>
                
                <div className="space-y-2">
                  <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl space-y-1">
                    <span className="text-[10px] text-blue-400 font-mono">August 12, 2026</span>
                    <h5 className="font-bold text-slate-200">General Checkup & Lab Review</h5>
                    <p className="text-slate-400 text-[11px]">Metformin dosage adjusted. Blood glucose stable at 6.2 mmol/L.</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl space-y-1">
                    <span className="text-[10px] text-blue-400 font-mono">May 04, 2025</span>
                    <h5 className="font-bold text-slate-200">Hypertension Screening</h5>
                    <p className="text-slate-400 text-[11px]">BP recorded at 130/85 mmHg. Lifestyle modifications recommended.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'medications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-amber-400" /> ePrescriptions
                  </h4>
                  <span className="text-[10px] text-emerald-400">Drug Interaction Checked ✓</span>
                </div>

                <div className="space-y-2">
                  {prescriptions.map((rx, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-200 block">{rx.name}</span>
                        <span className="text-[10px] text-slate-400">{rx.dosage}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">{rx.status}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="text-slate-400 font-semibold block">Prescribe New Medication</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. Amoxicillin 500mg"
                      value={prescriptionInput}
                      onChange={(e) => setPrescriptionInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                    <button 
                      onClick={handleAddPrescription}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" /> Lab & Imaging Requisitions
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => alert('Lab test order sent to Central Pathology.')} className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left transition space-y-1">
                    <span className="font-bold text-blue-400 block">+ Order Lab Test</span>
                    <span className="text-[10px] text-slate-400">Blood chemistry, CBC, HbA1c</span>
                  </button>

                  <button onClick={() => alert('Imaging requisition generated for Radiology.')} className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left transition space-y-1">
                    <span className="font-bold text-teal-400 block">+ Request Imaging</span>
                    <span className="text-[10px] text-slate-400">X-Ray, MRI Spine, Ultrasound</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="font-bold text-slate-200 block">Specialist Referral</span>
                  <p className="text-[10px] text-slate-400">Generate referral letter for Orthopedic / Physiotherapy evaluation.</p>
                  <button onClick={() => alert('Referral letter generated successfully.')} className="mt-2 w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-medium text-center transition">
                    Generate Referral
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* BOTTOM QUICK ACTIONS BAR */}
          <div className="p-3 bg-[#090d16] border-t border-slate-800 flex items-center justify-between gap-1.5 shrink-0">
            <button onClick={() => setActiveTab('medications')} className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 font-medium transition text-[11px]">
              Prescription
            </button>
            <button onClick={() => setActiveTab('orders')} className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 font-medium transition text-[11px]">
              Lab Test
            </button>
            <button onClick={() => setActiveTab('orders')} className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 font-medium transition text-[11px]">
              Imaging
            </button>
            <button onClick={() => alert('Download consultation summary package.')} className="px-2.5 py-1.5 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 rounded-lg text-blue-300 font-medium transition text-[11px] flex items-center gap-1">
              <Download className="w-3 h-3" /> Summary
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}