"use client";
import { useState, useEffect } from "react";

export default function DoctorProfileSettings() {
  const [profile, setProfile] = useState({
    profile_picture: "",
    experience_years: "",
    hospital: "",
    specialization: "",
    city: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchDoctorProfile() {
      try {
        const token = localStorage.getItem("token"); // or your auth cookie
        const res = await fetch("/api/doctors/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.doctor) {
          setProfile({
            profile_picture: data.doctor.profile_picture || "",
            experience_years: data.doctor.experience_years || "",
            hospital: data.doctor.hospital || "",
            specialization: data.doctor.specialization || "",
            city: data.doctor.city || ""
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    }
    fetchDoctorProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/doctor/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Profile updated successfully!");
      } else {
        setMessage(data.error || "Failed to update profile.");
      }
    } catch (err) {
      setMessage("An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <h2 className="text-xl font-black text-slate-900 mb-4">Edit Professional Profile</h2>
      {message && <p className="text-sm mb-4 font-semibold text-blue-600">{message}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Profile Picture URL</label>
          <input
            type="text"
            value={profile.profile_picture}
            onChange={(e) => setProfile({ ...profile, profile_picture: e.target.value })}
            placeholder="https://example.com/avatar.jpg"
            className="w-full p-2.5 border rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Years of Experience</label>
          <input
            type="number"
            value={profile.experience_years}
            onChange={(e) => setProfile({ ...profile, experience_years: e.target.value })}
            placeholder="e.g. 10"
            className="w-full p-2.5 border rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Hospital / Clinic Affiliation</label>
          <input
            type="text"
            value={profile.hospital}
            onChange={(e) => setProfile({ ...profile, hospital: e.target.value })}
            placeholder="e.g. Central Heart Institute"
            className="w-full p-2.5 border rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Specialization</label>
          <input
            type="text"
            value={profile.specialization}
            onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
            placeholder="e.g. Cardiologist"
            className="w-full p-2.5 border rounded-xl text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-sm"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}