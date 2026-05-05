"use client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("DEBUG: 1. Login form submitted via handleSubmit");
    setLoading(true);
    setError("");

    try {
      console.log("DEBUG: 2. Fetching from: https://medicareai-1.onrender.com/api/auth/login");
      const res = await fetch("https://medicareai-1.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("DEBUG: 3. Response data:", data);

      if (!res.ok) {
        throw new Error(data.message || data.error || "Invalid email or password");
      }

      localStorage.setItem("token", data.token);

      const userRole = (data.user?.role || data.role || "").toLowerCase();
      console.log("DEBUG: 4. Role identified:", userRole);

      if (userRole === "doctor") {
        window.location.href = "/dashboard";
      } else if (userRole === "patient") {
        window.location.href = "/patient-portal";
      } else {
        window.location.href = "/dashboard";
      }

    } catch (err: any) {
      console.error("DEBUG: Login Error:", err);
      setError(err.message === "Failed to fetch" 
        ? "Server is waking up. Please wait 30 seconds." 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-4xl font-black text-blue-600 tracking-tight">Swift MD</h1>
        <p className="mt-2 text-slate-600 font-semibold">Welcome back to your portal</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-10 shadow-2xl rounded-3xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-field" className="block text-sm font-bold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                id="email-field"
                name="email"
                type="email"
                placeholder="doctor@medicareai.com"
                autoComplete="email"
                required
                onChange={handleChange}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-gray-50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password-field" className="block text-sm font-bold text-slate-700 mb-2">
                Password
              </label>
              <input
                id="password-field"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                onChange={handleChange}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-gray-50 transition-all"
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold px-4 py-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-xl shadow-lg shadow-blue-200 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 transition-all transform active:scale-[0.98] disabled:bg-blue-300"
            >
              {loading ? "Authenticating..." : "Login to Account"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{" "}
              <Link href="/signup" className="font-bold text-blue-600 hover:text-blue-800 transition">
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}