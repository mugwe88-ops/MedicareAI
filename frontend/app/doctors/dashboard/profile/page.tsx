"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Award, Clock, Save, CheckCircle2 } from "lucide-react";

export default function DoctorProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: "Dr. Pressy Phides",
    email: "pressy.phides@swiftmd.com",
    specialization: "General Practitioner",
    bio: "Experienced medical practitioner dedicated to patient-centered telehealth care.",
    availability: "Mon - Fri: 9:00 AM - 5:00 PM",
  });
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    // Simulate save or connect to your backend API endpoint if available
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg("Profile and availability updated successfully!");
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-4 border-b border-gray-100 pb-6 mb-6">
          <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            PP
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Profile & Availability</h1>
            <p className="text-xs text-gray-500">Manage your public practitioner credentials and consultation hours.</p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <User size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="w-full bg-transparent text-xs text-gray-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <Mail size={16} className="text-gray-400 mr-2" />
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="w-full bg-transparent text-xs text-gray-900 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Specialization</label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <Award size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="specialization"
                  value={profile.specialization}
                  onChange={handleChange}
                  className="w-full bg-transparent text-xs text-gray-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Working Hours / Availability</label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <Clock size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="availability"
                  value={profile.availability}
                  onChange={handleChange}
                  className="w-full bg-transparent text-xs text-gray-900 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Professional Bio</label>
            <textarea
              name="bio"
              rows={4}
              value={profile.bio}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={16} /> {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}