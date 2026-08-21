"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, User, Phone, Stethoscope, FileText, ArrowLeft, Send } from "lucide-react";

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  city?: string;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [reason, setReason] = useState("");
  
  // Doctor & Specialty selection states
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://medicareai-backend.onrender.com";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.name) setFullName(parsed.name);
        if (parsed.phone) setPhone(parsed.phone);
      } catch (e) {
        console.error("Failed parsing stored user", e);
      }
    }

    fetchDoctors(token);
  }, [router]);

  const fetchDoctors = async (token: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/doctors-list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    } catch (err) {
      console.error("Failed loading doctors list:", err);
    } finally {
      setDoctorsLoading(false);
    }
  };

  // Get list of unique specialties from active doctors
  const specialties = Array.from(
    new Set(doctors.map((doc) => doc.specialization).filter(Boolean))
  );

  // Filter doctors based on selected specialty
  const filteredDoctors = selectedSpecialty
    ? doctors.filter((doc) => doc.specialization === selectedSpecialty)
    : doctors;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired. Please log in again.");
      router.push("/login");
      return;
    }

    const selectedDoc = doctors.find((d) => String(d.id) === String(selectedDoctorId));

    const payload = {
      department: selectedSpecialty || "General Medicine",
      doctor_id: selectedDoctorId ? parseInt(selectedDoctorId, 10) : null,
      doctor_name: selectedDoc ? selectedDoc.name : null,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      reason: reason
    };

    try {
      // POST to /api/my-appointments with full Bearer Authorization
      const res = await fetch(`${BACKEND_URL}/api/my-appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to book appointment");
      }

      alert("Appointment booked successfully!");
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message || "Submission failed. Please check clinical logs.");
      console.error("Booking submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="mb-8 border-b border-slate-100 pb-5">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Book Appointment
            </h1>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">
              Secure Clinical Entry
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Name */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0723503988"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Specialty Selection */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Medical Specialty
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <select
                  value={selectedSpecialty}
                  onChange={(e) => {
                    setSelectedSpecialty(e.target.value);
                    setSelectedDoctorId(""); // Reset doctor selection on specialty change
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Specialties</option>
                  {specialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Doctor Selection */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Select Doctor
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  required
                  disabled={doctorsLoading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="">
                    {doctorsLoading ? "Loading doctors..." : "-- Select Doctor --"}
                  </option>
                  {filteredDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.name} ({doc.specialization || "General Medicine"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                  Preferred Time
                </label>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Reason for Visit */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Reason for Visit
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your symptoms or reason for consulting..."
                  rows={3}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm Booking"} <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}