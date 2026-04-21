"use client";
import { useState } from "react";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        
        // Redirect based on role returned from backend auth controller
        window.location.href = data.role === "doctor" ? "/dashboard" : "/doctors";
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Welcome Back</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-3 border border-slate-200 rounded-xl outline-blue-500" 
            required
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 border border-slate-200 rounded-xl outline-blue-500" 
            required
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account? <Link href="/signup" className="text-blue-600 font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}