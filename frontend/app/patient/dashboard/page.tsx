"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Video, FileText, LogOut, UserCheck } from "lucide-react";

interface Appointment {
  id: number;
  doctor_name?: string;
  department?: string;
  appointment_date: string;
  appointment_time: string;
  reason?: string;
  status: string;
}

export default function PatientDashboard() {
  const [userName, setUserName] = useState("Patient");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile form states
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  
  // Questionnaire states
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState("");
  const [hasSurgeries, setHasSurgeries] = useState("no");
  const [surgeryDetails, setSurgeryDetails] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const router = useRouter();

  const commonConditions = [
    "Hypertension",
    "Diabetes",
    "Asthma",
    "Heart Disease",
    "Epilepsy",
    "None"
  ];

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
        if (parsed.name) setUserName(parsed.name);
        if (parsed.age) setAge(parsed.age.toString());
        if (parsed.phone) setPhone(parsed.phone);
        
        // Parse compiled medical history back into individual states if present
        if (parsed.medical_history) {
          const hist = parsed.medical_history;
          
          // Extract Conditions
          const condMatch = hist.match(/Conditions: ([^|]+)/);
          if (condMatch && condMatch[1]) {
            const conds = condMatch[1].trim().split(", ").map((c: string) => c.trim());
            setSelectedConditions(conds);
          }

          // Extract Allergies
          const allergyMatch = hist.match(/Allergies: ([^|]+)/);
          if (allergyMatch && allergyMatch[1]) {
            const alg = allergyMatch[1].trim();
            if (alg !== "None") setAllergies(alg);
          }

          // Extract Surgeries
          const surgMatch = hist.match(/Surgeries: (.+)/);
          if (surgMatch && surgMatch[1]) {
            const surg = surgMatch[1].trim();
            if (surg !== "None") {
              setHasSurgeries("yes");
              setSurgeryDetails(surg);
            }
          }
        }
      } catch (e) {
        console.error("Failed parsing profile", e);
      }
    }

    fetchAppointments(token);
  }, [router]);

  const fetchAppointments = async (token: string) => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://medicareai-1.onrender.com";
      const res = await fetch(`${backendUrl}/api/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error("Failed loading appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConditionToggle = (condition: string) => {
    if (condition === "None") {
      setSelectedConditions(["None"]);
      return;
    }
    
    const filtered = selectedConditions.filter(c => c !== "None");

    if (filtered.includes(condition)) {
      setSelectedConditions(filtered.filter(c => c !== condition));
    } else {
      setSelectedConditions([...filtered, condition]);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const compiledMedicalHistory = `Conditions: ${selectedConditions.join(", ") || "None"} | Allergies: ${allergies.trim() || "None"} | Surgeries: ${hasSurgeries === "yes" && surgeryDetails.trim() ? surgeryDetails.trim() : "None"}`;

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://medicareai-1.onrender.com";
      
      const res = await fetch(`${backendUrl}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          age: age ? parseInt(age, 10) : null,
          phone: phone.trim() || null,
          medical_history: compiledMedicalHistory
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfileMessage("Questionnaire submitted successfully!");

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          parsed.age = age ? parseInt(age, 10) : parsed.age;
          parsed.phone = phone || parsed.phone;
          parsed.medical_history = compiledMedicalHistory;
          localStorage.setItem("user", JSON.stringify(parsed));
        } catch (err) {}
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setProfileMessage(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    const s = status ? status.toLowerCase() : "pending";
    if (s === "confirmed") {
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
          Confirmed
        </span>
      );
    }
    if (s === "completed") {
      return (
        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">
          Completed
        </span>
      );
    }
    if (s === "cancelled" || s === "rejected") {
      return (
        <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-bold uppercase tracking-wider">
          {s}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-bold uppercase tracking-wider">
        Pending
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Content Body */}
      <main className="max-w-6xl mx-auto p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              Welcome Back, {userName}
            </h2>
            <p className="text-slate-400 font-bold mt-1">
              Assigned Records: {appointments.length}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-200">
              {getInitials(userName)}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-none">
                {userName}
              </p>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">
                PATIENT
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div
            onClick={() => router.push("/patient/dashboard/appointments")}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <Calendar size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Schedule Visit</h3>
              <p className="text-slate-400 text-xs">Schedule new visit</p>
            </div>
          </div>

          <div
            onClick={() => router.push("/patient/dashboard/telehealth")}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
              <Video size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Telehealth Portal</h3>
              <p className="text-slate-400 text-xs">Join virtual room</p>
            </div>
          </div>

          <div
            onClick={() => router.push("/patient/dashboard/prescriptions")}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">View Prescriptions</h3>
              <p className="text-slate-400 text-xs">View issued meds</p>
            </div>
          </div>
        </div>

        {/* Patient Profile & Clinical Questionnaire */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <UserCheck size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Patient Medical Questionnaire</h3>
              <p className="text-xs text-slate-400 font-semibold">Please complete your health profile details for your doctors</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Personal Data Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Age</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., +254700000000"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* Questionnaire Section: Chronic Conditions */}
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
                1. Do you have any of the following chronic conditions? (Check all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonConditions.map((cond) => (
                  <button
                    type="button"
                    key={cond}
                    onClick={() => handleConditionToggle(cond)}
                    className={`px-4 py-3 rounded-xl border text-sm font-bold text-left transition flex items-center justify-between ${
                      selectedConditions.includes(cond)
                        ? "bg-blue-50 border-blue-600 text-blue-700"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{cond}</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                      selectedConditions.includes(cond) ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300"
                    }`}>
                      {selectedConditions.includes(cond) ? "✓" : ""}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Questionnaire Section: Allergies */}
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                2. Do you have any drug or food allergies? (e.g., Sulphur, Penicillin, Dust)
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="List allergies or type 'None'"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800 font-medium"
              />
            </div>

            {/* Questionnaire Section: Past Surgeries */}
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                3. Have you had any past major surgeries or hospitalizations?
              </label>
              <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                  <input
                    type="radio"
                    name="surgeries"
                    value="no"
                    checked={hasSurgeries === "no"}
                    onChange={() => setHasSurgeries("no")}
                    className="accent-blue-600"
                  />
                  No
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                  <input
                    type="radio"
                    name="surgeries"
                    value="yes"
                    checked={hasSurgeries === "yes"}
                    onChange={() => setHasSurgeries("yes")}
                    className="accent-blue-600"
                  />
                  Yes
                </label>
              </div>

              {hasSurgeries === "yes" && (
                <input
                  type="text"
                  value={surgeryDetails}
                  onChange={(e) => setSurgeryDetails(e.target.value)}
                  placeholder="Please specify surgeries and approximate dates..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800 font-medium animate-fadeIn"
                />
              )}
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                {savingProfile ? "Submitting..." : "Save Questionnaire Details"}
              </button>
              {profileMessage && (
                <p className={`text-sm font-bold ${profileMessage.includes("successfully") ? "text-emerald-600" : "text-rose-600"}`}>
                  {profileMessage}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Consultations List */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-900 text-lg">
              Your Consultations
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 font-bold">
              Loading records...
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">
              No appointments scheduled yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-8">Doctor / Dept</th>
                    <th className="py-4 px-6">Visit Timing</th>
                    <th className="py-4 px-6">Medical Reason</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {appointments.map((apt) => (
                    <tr
                      key={apt.id}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="py-5 px-8">
                        <p className="font-bold text-slate-900">
                          {apt.doctor_name || "General Practitioner"}
                        </p>
                        <p className="text-xs text-slate-400 font-semibold">
                          {apt.department || "General Health"}
                        </p>
                      </td>
                      <td className="py-5 px-6">
                        <p className="font-bold text-slate-900">
                          {new Date(apt.appointment_date).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                        <p className="text-xs text-blue-600 font-bold">
                          {apt.appointment_time}
                        </p>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg italic">
                          "{apt.reason || "General Checkup"}"
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        {getStatusBadge(apt.status)}
                      </td>
                      <td className="py-5 px-8 text-right">
                        <button
                          onClick={() =>
                            router.push(`/patient/dashboard/telehealth/${apt.id}`)
                          }
                          className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition inline-flex items-center justify-center"
                          title="Join Call"
                        >
                          <Video size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}