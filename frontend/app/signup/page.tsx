"use client";
import { useState } from "react";
import Link from "next/link";

// Ensure the component name is capitalized and exported as default
export default function SignupPage() {
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    specialization: "",
    license_number: "",
  });

  // This fixes the 'handleChange is not defined' error from your terminal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

// Find your handleSubmit function and update the success logic:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const res = await fetch("https://medicareai-1.onrender.com/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, role }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    // SUCCESS LOGIC:
    localStorage.setItem("token", data.token); // Save the login session
    
    // Redirect based on role
    if (data.user.role === "doctor") {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/patient-portal"; // Direct patients to their own portal
    }
    
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-4xl font-black text-blue-600 tracking-tight">Swift MD</h1>
        <p className="mt-2 text-slate-600 font-semibold">Create your practitioner portal</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-10 shadow-2xl rounded-3xl border border-gray-100">
          
          {/* Role Toggle */}
          <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => setRole("patient")}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${role === 'patient' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setRole("doctor")}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${role === 'doctor' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              Doctor
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <input
                name="name"
                placeholder="Full Name"
                required
                onChange={handleChange}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-white transition-all"
              />
            </div>
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                required
                onChange={handleChange}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-white transition-all"
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                placeholder="Create Password"
                required
                onChange={handleChange}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-white transition-all"
              />
            </div>

            {role === "doctor" && (
              <div className="space-y-5 pt-4 border-t border-slate-100 animate-in fade-in duration-500">
                <input
                  name="specialization"
                  placeholder="Specialization (e.g. Dermatology)"
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border border-blue-100 rounded-xl bg-blue-50/50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  name="license_number"
                  placeholder="Medical License Number"
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border border-blue-100 rounded-xl bg-blue-50/50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold px-4 py-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-xl shadow-lg shadow-blue-200 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 transition-all transform active:scale-[0.98] disabled:bg-blue-300 disabled:shadow-none"
            >
              {loading ? "Creating Account..." : `Sign up as ${role}`}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/login" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition">
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}