"use client";

import { useState, useEffect } from "react";
import { 
  Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Share2, 
  FileText, MessageSquare, ShieldCheck, Clock, User, Activity, 
  Maximize2, ChevronRight, AlertCircle, Heart, Thermometer 
} from "lucide-react";

export default function TelehealthRoom() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "vitals" | "chat">("notes");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [secondsElapsed, setSecondsElapsed] = useState(13);

  // Live consultation timer
  useEffect(() => {
    const timer = setInterval(() => setSecondsElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
      
      {/* 1. TOP BAR: Session Status & Badges */}
      <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
            <ShieldCheck size={14} className="animate-pulse" />
            256-BIT ENCRYPTED TELEHEALTH
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <User size={14} className="text-blue-400" />
            <span>Patient: <strong className="text-white">Alex Morgan</strong></span>
            <span className="text-xs text-slate-500">(ID: #PX-8829)</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-200">
            <Clock size={14} className="text-emerald-400" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>
          <button 
            onClick={() => window.location.href = "/doctors/dashboard"}
            className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-1.5 rounded-xl transition-all border border-slate-700"
          >
            Leave Room
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE: Video Feeds + Clinical Drawer */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4 relative">
        
        {/* Left Video Area */}
        <div className="flex-1 flex flex-col gap-4 relative">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            
            {/* Patient Stream (Remote) */}
            <div className="relative bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center group">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-20 h-20 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-2xl font-black text-blue-400 shadow-inner">
                  P
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">Alex Morgan (Remote)</h3>
                  <p className="text-xs text-slate-500 animate-pulse mt-0.5">Waiting for video stream stabilization...</p>
                </div>
              </div>

              {/* Feed Overlay Info */}
              <div className="absolute top-4 left-4 bg-slate-950/70 backdrop-blur-md border border-slate-800 px-3 py-1 rounded-lg text-[11px] font-semibold text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>HD 1080p • 24ms</span>
              </div>
            </div>

            {/* Doctor Stream (Local Self View) */}
            <div className="relative bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center">
              {isVideoOff ? (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <VideoOff size={32} />
                  <span className="text-xs font-bold">Your Camera is Off</span>
                </div>
              ) : (
                <div className="w-full h-full bg-slate-800/40 flex items-center justify-center relative">
                  <div className="w-16 h-16 rounded-full bg-slate-700/60 border border-slate-600 flex items-center justify-center text-xl font-bold text-slate-300">
                    Dr
                  </div>
                </div>
              )}

              {/* Feed Overlay Info */}
              <div className="absolute top-4 left-4 bg-slate-950/70 backdrop-blur-md border border-slate-800 px-3 py-1 rounded-lg text-[11px] font-semibold text-slate-300">
                Dr. Pressy Phides (You) {isMuted && <span className="text-rose-400 font-bold ml-1">(Muted)</span>}
              </div>
            </div>
          </div>

          {/* 3. FLOATING GLASS CONTROL DOCK */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl z-20">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3.5 rounded-xl transition-all cursor-pointer ${
                isMuted 
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" 
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-3.5 rounded-xl transition-all cursor-pointer ${
                isVideoOff 
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" 
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
              title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
            >
              {isVideoOff ? <VideoOff size={20} /> : <VideoIcon size={20} />}
            </button>

            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-3.5 rounded-xl transition-all cursor-pointer ${
                isScreenSharing 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
              title="Share Screen"
            >
              <Share2 size={20} />
            </button>

            <div className="w-px h-8 bg-slate-800"></div>

            {/* End Call Button */}
            <button
              onClick={() => window.location.href = "/doctors/dashboard"}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-rose-600/20 cursor-pointer"
            >
              <PhoneOff size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">End Session</span>
            </button>
          </div>
        </div>

        {/* Right Side Drawer: Clinical Workspace */}
        <aside className="w-80 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col overflow-hidden backdrop-blur-md">
          {/* Workspace Tabs */}
          <div className="flex border-b border-slate-800 p-1 bg-slate-950/50">
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "notes" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText size={14} /> Notes
            </button>
            <button
              onClick={() => setActiveTab("vitals")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "vitals" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity size={14} /> Vitals
            </button>
          </div>

          {/* Workspace Tab Content */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {activeTab === "notes" && (
              <div className="space-y-3 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Consultation Notes</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Auto-saving...</span>
                </div>
                <textarea
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Record patient symptoms, diagnosis summary, or prescription requirements..."
                  className="flex-1 w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            )}

            {activeTab === "vitals" && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pre-Consult Vitals</span>
                
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400">
                    <Heart size={16} />
                    <span className="text-xs text-slate-300 font-medium">Heart Rate</span>
                  </div>
                  <span className="text-xs font-bold text-white">72 BPM</span>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Thermometer size={16} />
                    <span className="text-xs text-slate-300 font-medium">Temperature</span>
                  </div>
                  <span className="text-xs font-bold text-white">36.8 °C</span>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Activity size={16} />
                    <span className="text-xs text-slate-300 font-medium">Blood Pressure</span>
                  </div>
                  <span className="text-xs font-bold text-white">120/80 mmHg</span>
                </div>
              </div>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
}
