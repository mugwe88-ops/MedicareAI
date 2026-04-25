"use client";
import { useState } from "react";
import Link from "next/link";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

      alert("Registration Successful!");
      window.location.href = "/login";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-4xl font-extrabold text-blue-600">Swift MD</h1>
        <h2 className="mt-4 text-center text-xl text-gray-600">Create your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
          
          {/* Role Switcher */}
          <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
            <button
              onClick={() => setRole("patient")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${role === 'patient' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Patient
            </button>
            <button
              onClick={() => setRole("doctor")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${role === 'doctor' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Doctor
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              name="name"
              placeholder="Full Name"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
            <input
              name="email"
              type="email"
              placeholder="Email address"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
            
            <div className="grid grid-cols-2 gap-4">
               <input name="phone" placeholder="Phone" onChange={handleChange} className="px-4 py-3 border border-gray-200 rounded-xl text-black" />
               <input name="city" placeholder="City" onChange={handleChange} className="px-4 py-3 border border-gray-200 rounded-xl text-black" />
            </div>

            {/* Doctor Specific Fields */}
            {role === "doctor" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="h-px bg-gray-100 my-4" />
                <input
                  name="specialization"
                  placeholder="Medical Specialization"
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-blue-100 rounded-xl bg-blue-50 text-black"
                />
                <input
                  name="license_number"
                  placeholder="Medical License Number"
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-blue-100 rounded-xl bg-blue-50 text-black"
                />
              </div>
            )}

            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-blue-300 transition"
            >
              {loading ? "Processing..." : `Sign up as ${role}`}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}