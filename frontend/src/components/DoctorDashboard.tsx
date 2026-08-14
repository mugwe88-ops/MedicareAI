"use client";

import React, { useState } from "react";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  FileText, 
  Search, 
  Video, 
  Calendar, 
  Activity,
  Plus
} from "lucide-react";

export default function DoctorDashboard() {
  const [providerStatus, setProviderStatus] = useState("Available");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-6 space-y-6">
      
      {/* 1. Header & Status Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome, Dr. Fibian Nyorita
          </h1>
          <p className="text-sm text-slate-400">Provider Control Center Workspace</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-medium">
            {["Available", "In Visit", "On Break"].map((status) => (
              <button
                key={status}
                onClick={() => setProviderStatus(status)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  providerStatus === status
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 transition">
            Exit Panel
          </button>
        </div>
      </div>

      {/* 2. Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Appointments</p>
            <p className="text-xl font-semibold text-white">12</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">In Queue</p>
            <p className="text-xl font-semibold text-white">0</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Completed</p>
            <p className="text-xl font-semibold text-white">8</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Pending Lab Reviews</p>
            <p className="text-xl font-semibold text-white">3</p>
          </div>
        </div>
      </div>

      {/* 3. Action Bar: Patient Search & Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search patient by name, MRN, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            <Plus className="w-4 h-4" /> New Prescription
          </button>
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 transition">
            <Video className="w-4 h-4" /> Start Quick Consult
          </button>
        </div>
      </div>

      {/* 4. Main Incoming Queue Container */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Incoming Patient Schedule (0)</span>
          </div>
        </div>

        {/* Empty State / Active Queue */}
        <div className="p-16 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-500 mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">NO PENDING CHECK-INS</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            Your confirmed virtual clinical queues will appear here in real-time.
          </p>
        </div>
      </div>

    </div>
  );
}