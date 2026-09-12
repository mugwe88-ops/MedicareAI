"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Upload, RefreshCw } from "lucide-react";

export default function DoctorSettingsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialization: "",
    phone: "",
    consultation_fee: "",
    avatar_url: "",
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Avatar states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medicareai-1.onrender.com";

        const res = await fetch(`${API_URL}/api/doctors/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const profileData = data.doctor || data;
          
          setFormData({
            name: profileData.name || "",
            email: profileData.email || "",
            specialization: profileData.specialization || "",
            phone: profileData.phone || "",
            consultation_fee: profileData.consultation_fee || "",
            avatar_url: profileData.avatar_url || "",
          });

          if (profileData.avatar_url) {
            setPreviewUrl(profileData.avatar_url);
            localStorage.setItem("doctor_avatar", profileData.avatar_url);
          }
        }
      } catch (err) {
        console.error("Failed to load profile", err);
        setErrorMsg("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medicareai-1.onrender.com";

      let currentAvatarUrl = formData.avatar_url;

      // 1. If a new file was chosen, convert to Base64 and post to the avatar endpoint
      if (selectedFile) {
        const base64data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(selectedFile);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });

        const avatarRes = await fetch(`${API_URL}/api/doctors/avatar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatar: base64data }),
        });

        if (avatarRes.ok) {
          const avatarData = await avatarRes.json();
          currentAvatarUrl = avatarData.avatar || avatarData.avatar_url || currentAvatarUrl;
        } else {
          throw new Error("Failed to upload profile picture.");
        }
      }

      // 2. Submit general text profile settings (PUT /api/doctors/profile)
      const res = await fetch(`${API_URL}/api/doctors/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          avatar_url: currentAvatarUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to update profile settings.");

      setFormData((prev) => ({ ...prev, avatar_url: currentAvatarUrl }));
      setSelectedFile(null);

      if (currentAvatarUrl) {
        localStorage.setItem("doctor_avatar", currentAvatarUrl);
      }
      window.dispatchEvent(new Event("doctorAvatarUpdated"));

      setSuccessMsg("Profile settings and picture updated successfully!");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .replace(/^Dr\.\s+/i, "")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "MD";
  };

  if (loading) {
    return <div className="p-6 text-slate-600 font-medium">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
      <h1 className="text-2xl font-black text-slate-900 mb-2">Doctor Profile & Availability</h1>
      <p className="text-xs text-slate-500 mb-6">Manage your professional credentials, profile picture, and practice details.</p>

      {successMsg && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold">{successMsg}</div>}
      {errorMsg && <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* PROFILE PICTURE SECTION */}
        <div className="flex items-center gap-6 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl">
          <div className="relative">
            {previewUrl ? (
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm bg-white">
                <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                {getInitials(formData.name)}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center shadow transition cursor-pointer"
              title="Upload Photo"
            >
              <Camera size={12} />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="space-y-1">
            <h2 className="text-xs font-black text-slate-900 uppercase">Profile Picture</h2>
            <p className="text-xs text-slate-500 font-medium">PNG, JPG, or WEBP up to 5MB.</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Upload size={12} className="text-blue-600" />
              <span>Choose Photo</span>
            </button>
          </div>
        </div>

        {/* INPUT FIELDS */}
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

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Consultation Fee ($)</label>
          <input
            type="number"
            name="consultation_fee"
            value={formData.consultation_fee}
            onChange={handleChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium outline-none focus:border-blue-600"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs uppercase px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition cursor-pointer flex items-center gap-2"
        >
          {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
}