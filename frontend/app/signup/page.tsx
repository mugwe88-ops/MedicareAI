"use client";
import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [role, setRole] = useState("patient"); // Default role
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    specialization: "",
    license_number: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("https://medicareai-1.onrender.com/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      setMessage({ type: "success", text: "Account created! Redirecting to login..." });
      setTimeout(() => (window.location.href = "/login"), 2000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Swift MD</h1>
          <p className="text-gray-500 mt-2">Create your practitioner or patient account</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex mb-8 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setRole("patient")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              role === "patient" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
            }`}
          >
            Signup as Patient
          </button>
          <button
            onClick={() => setRole("doctor")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              role === "doctor" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
            }`}
          >
            Signup as Doctor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-xl text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-xl text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-xl text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <input
              name="phone"
              placeholder="Phone Number"
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-xl text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <input
            name="city"
            placeholder="City"
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-xl text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* Conditional Doctor Fields */}
          {role === "doctor" && (
            <div className="space-y-4 pt-2 animate-in fade-in duration-300">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-600 font-bold uppercase mb-2">Professional Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="specialization"
                    placeholder="Specialization (e.g. Surgeon)"
                    onChange={handleChange}
                    className="p-2 border border-blue-200 rounded-lg text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <input
                    name="license_number"
                    placeholder="Medical License #"
                    onChange={handleChange}
                    className="p-2 border border-blue-200 rounded-lg text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {message.text && (
            <div className={`p-3 rounded-xl text-center text-sm font-medium ${
              message.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            }`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg disabled:bg-blue-300"
          >
            {loading ? "Creating Account..." : `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-500 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}