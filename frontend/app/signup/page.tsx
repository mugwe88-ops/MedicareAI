"use client";
import { useState } from "react";
import Link from "next/link";

export default function Signup() {
  const [role, setRole] = useState("patient");
  const [formData, setFormData] = useState({
    email: "", password: "", name: "", 
    specialization: "", license_number: "", city: ""
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });

      if (res.ok) {
        alert("Registration successful! Please login.");
        window.location.href = "/login";
      } else {
        const error = await res.json();
        alert(error.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Join MedicareAI</h2>
        
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button 
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${role === 'patient' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            onClick={() => setRole("patient")}
          >Patient</button>
          <button 
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${role === 'doctor' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            onClick={() => setRole("doctor")}
          >Doctor</button>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <input type="text" placeholder="Full Name" className="w-full p-3 border border-slate-200 rounded-xl outline-blue-500" required
            onChange={(e) => setFormData({...formData, name: e.target.value})} />
          
          <input type="email" placeholder="Email" className="w-full p-3 border border-slate-200 rounded-xl outline-blue-500" required
            onChange={(e) => setFormData({...formData, email: e.target.value})} />
          
          <input type="password" placeholder="Password" className="w-full p-3 border border-slate-200 rounded-xl outline-blue-500" required
            onChange={(e) => setFormData({...formData, password: e.target.value})} />

          {role === "doctor" && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Professional Info</p>
              <input type="text" placeholder="Specialization (e.g. Dermatologist)" className="w-full p-3 border border-slate-200 rounded-xl outline-blue-500" required
                onChange={(e) => setFormData({...formData, specialization: e.target.value})} />
              <input type="text" placeholder="License Number (KMLTTB-...)" className="w-full p-3 border border-slate-200 rounded-xl outline-blue-500" required
                onChange={(e) => setFormData({...formData, license_number: e.target.value})} />
              <input type="text" placeholder="City" className="w-full p-3 border border-slate-200 rounded-xl outline-blue-500" required
                onChange={(e) => setFormData({...formData, city: e.target.value})} />
            </div>
          )}

          <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Create Account
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}