"use client";

import { useState, useEffect } from "react";

export default function DoctorSettingsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialization: "",
    phone: "",
    consultation_fee: "",
  });
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Fetch current doctor profile details
    const fetchDoctorProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/doctors/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || "",
            email: data.email || "",
            specialization: data.specialization || "",
            phone: data.phone || "",
            consultation_fee: data.consultation_fee || "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/doctors/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile settings.");

      setSuccessMsg("Profile settings updated successfully!");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-600 font-medium">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
      <h1 className="text-2xl font-black text-slate-900 mb-2">Doctor Profile & Availability</h1>
      <p className="text-xs text-slate-500 mb-6">Manage your professional credentials and practice details.</p>

      {successMsg && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold">{successMsg}</div>}
      {errorMsg && <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Specialization / Department</label>
          <input
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium outline-none focus:border-blue-600"
          />
        </div>

        <button
          type="submit"
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition cursor-pointer"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}