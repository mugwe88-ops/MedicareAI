"use client";

import { useState, useEffect } from 'react';
import { User, Lock, CheckCircle, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DoctorSettingsPage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    specialization: '',
    phone: '',
    bio: '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const API_BASE = "https://medicareai-1.onrender.com";
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchDoctorProfile(token);
  }, []);

  const fetchDoctorProfile = async (token: string) => {
    try {
      // Assuming you have an endpoint for the logged-in doctor's profile
      const res = await fetch(`${API_BASE}/api/doctors/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.name || data.doctor_name || "",
          email: data.email || "",
          specialization: data.specialization || "",
          phone: data.phone || "",
          bio: data.bio || "",
        });
      } else {
        // Fallback to local storage user object if API route isn't set up yet
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setProfile({
            name: parsed.name || "",
            email: parsed.email || "",
            specialization: parsed.specialization || "General Practice",
            phone: parsed.phone || "",
            bio: parsed.bio || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/doctors/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error("Failed to update profile settings.");

      setMessage("Profile settings updated successfully.");
    } catch (err: any) {
      setErrorMsg(err.message || "Error updating profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setSaving(true);
    setMessage(null);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/auth/update-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwords.currentPassword,
          new_password: passwords.newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update password.");
      }

      setMessage('Password changed securely.');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setErrorMsg(err.message || "Error updating password.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm italic">
        Loading account settings...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-slate-50 min-h-screen text-slate-900">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your practitioner profile and security credentials.</p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle size={18} /> {message}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Profile Settings Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <User className="text-blue-600" size={20} />
          <h3 className="font-bold text-slate-800 text-base">Practitioner Profile</h3>
        </div>

        <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={profile.email}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Medical Specialization</label>
            <input
              type="text"
              value={profile.specialization}
              onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Bio</label>
            <textarea
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm disabled:opacity-50"
            >
              <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <Lock className="text-blue-600" size={20} />
          <h3 className="font-bold text-slate-800 text-base">Security & Password</h3>
        </div>

        <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              required
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}