"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Stethoscope, Calendar, FileText, AlertCircle, CheckCircle2, ArrowLeft, LogOut } from "lucide-react";

export default function AppointmentBookingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");

  const [formData, setFormData] = useState({
    doctorId: "",
    bodySystem: "General / Systemic",
    symptomSeverity: "Moderate",
    symptomDuration: "1-3 days",
    reasonForVisit: "",
    painScale: 3,
    patient_chronic_conditions: "",
    patient_allergies: "",
    patient_surgeries: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    setIsLoggedIn(!!token);
    if (!token) {
      router.push("/login");
      return;
    }
    
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserName(parsed.name || "Account");
        setUserRole(parsed.role?.toLowerCase() || "patient");
      } catch (e) {
        console.error("Hydration profile parsing error:", e);
      }
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const patientId = user?.id || user?.patient_id;

      const response = await fetch("https://your-backend-url.onrender.com/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: formData.doctorId,
          patient_id: patientId,
          bodySystem: formData.bodySystem,
          symptomSeverity: formData.symptomSeverity,
          symptomDuration: formData.symptomDuration,
          reasonForVisit: formData.reasonForVisit,
          painScale: formData.painScale,
          patient_chronic_conditions: formData.patient_chronic_conditions,
          patient_allergies: formData.patient_allergies,
          patient_surgeries: formData.patient_surgeries
        })
      });

      if (!response.ok) {
        throw new Error("Failed to submit appointment booking. Please check your details.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    router.push("/login");
  };

  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-sm font-bold tracking-wide uppercase">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* NAVBAR */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="text-slate-900 font-black text-lg tracking-tighter">SWIFT MD</span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="text-slate-700 hover:text-blue-600 font-bold text-sm bg-slate-100 px-4 py-2 rounded-xl transition-all"
            >
              {userName.toUpperCase()}&apos;S DASHBOARD
            </Link>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 p-2 rounded-xl transition-colors"
              title="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-3xl mx-auto px-6 py-12 w-full">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-xs font-bold uppercase tracking-wider mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Book Clinical Appointment</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Provide your symptoms and medical history details for the physician review.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl font-medium flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Appointment successfully booked! Redirecting to dashboard...</span>
            </div>
          )}

          <form onSubmit={handleBookAppointment} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Doctor ID / Specialist Reference</label>
              <input 
                type="text" 
                name="doctorId" 
                value={formData.doctorId} 
                onChange={handleChange}
                required
                placeholder="Enter assigned doctor ID"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Body System / Category</label>
                <select 
                  name="bodySystem"
                  value={formData.bodySystem}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-blue-600"
                >
                  <option value="General / Systemic">General / Systemic</option>
                  <option value="Cardiovascular">Cardiovascular</option>
                  <option value="Respiratory">Respiratory</option>
                  <option value="Neurological">Neurological</option>
                  <option value="Musculoskeletal">Musculoskeletal</option>
                  <option value="Dermatological">Dermatological</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Symptom Severity</label>
                <select 
                  name="symptomSeverity"
                  value={formData.symptomSeverity}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-blue-600"
                >
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Reason For Visit / Detailed Symptoms</label>
              <textarea 
                name="reasonForVisit" 
                value={formData.reasonForVisit} 
                onChange={handleChange}
                rows={3}
                required
                placeholder="Describe your current symptoms or purpose of visit..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-blue-600 resize-none"
              />
            </div>

            {/* QUESTIONNAIRE SECTION */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Patient Clinical History Questionnaire</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Chronic Conditions</label>
                <input 
                  type="text" 
                  name="patient_chronic_conditions" 
                  value={formData.patient_chronic_conditions} 
                  onChange={handleChange}
                  placeholder="e.g., Hypertension, Asthma, Diabetes (or None)"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Known Allergies</label>
                <input 
                  type="text" 
                  name="patient_allergies" 
                  value={formData.patient_allergies} 
                  onChange={handleChange}
                  placeholder="e.g., Penicillin, Peanuts, Sulphur (or None)"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Past Surgeries or Major Hospitalizations</label>
                <input 
                  type="text" 
                  name="patient_surgeries" 
                  value={formData.patient_surgeries} 
                  onChange={handleChange}
                  placeholder="e.g., Appendectomy, None"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || success}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/10 disabled:opacity-50 mt-6"
            >
              {loading ? "Confirming Booking..." : "Confirm & Book Appointment"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
