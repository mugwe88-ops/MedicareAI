"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Shield, Stethoscope, Save, Camera } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

  // Clinical questionnaire states
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState("");
  const [hasSurgeries, setHasSurgeries] = useState("no");
  const [surgeryDetails, setSurgeryDetails] = useState("");

  const commonConditions = [
    "Hypertension",
    "Diabetes",
    "Asthma",
    "Heart Disease",
    "Epilepsy",
    "None"
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          "https://medicareai-1.onrender.com";

        // Fetch fresh profile data from backend API
        const res = await fetch(`${backendUrl}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await res.json();
        const user = data.user || data;

        if (user.name) setName(user.name);
        if (user.email) setEmail(user.email);
        if (user.age !== null && user.age !== undefined) setAge(user.age.toString());
        if (user.phone) setPhone(user.phone);
        if (user.profile_picture) setProfilePicture(user.profile_picture);

        // Parse existing medical history if present
        const hist = user.medical_history || "";
        if (hist) {
          const condMatch = hist.match(/Conditions: ([^|]+)/);
          if (condMatch && condMatch[1]) {
            setSelectedConditions(condMatch[1].trim().split(", ").map((c: string) => c.trim()));
          }

          const allergyMatch = hist.match(/Allergies: ([^|]+)/);
          if (allergyMatch && allergyMatch[1]) {
            const alg = allergyMatch[1].trim();
            if (alg !== "None") setAllergies(alg);
          }

          const surgMatch = hist.match(/Surgeries: (.+)/);
          if (surgMatch && surgMatch[1]) {
            const surg = surgMatch[1].trim();
            if (surg !== "None") {
              setHasSurgeries("yes");
              setSurgeryDetails(surg);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load profile from backend, falling back to local storage", err);
        // Fallback to local storage if API fetch fails
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed.name) setName(parsed.name);
            if (parsed.email) setEmail(parsed.email);
            if (parsed.age) setAge(parsed.age.toString());
            if (parsed.phone) setPhone(parsed.phone);
            if (parsed.profile_picture) setProfilePicture(parsed.profile_picture);
          } catch (e) {
            console.error("Failed to parse stored user profile", e);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

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
          name: name.trim(),
          age: age ? parseInt(age, 10) : null,
          phone: phone.trim() || null,
          profile_picture: profilePicture.trim() || null,
          medical_history: compiledMedicalHistory
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile settings");
      }

      setMessage("Account settings updated successfully!");

      // Update local storage user snapshot
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          parsed.name = name;
          parsed.age = age ? parseInt(age, 10) : parsed.age;
          parsed.phone = phone;
          parsed.profile_picture = profilePicture;
          parsed.medical_history = compiledMedicalHistory;
          localStorage.setItem("user", JSON.stringify(parsed));
        } catch (err) {}
      }
    } catch (err: any) {
      console.error("Error saving settings:", err);
      setMessage(err.message || "Failed to save profile settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-bold min-h-screen bg-slate-950">
        Loading account settings...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">Account Settings</h1>
          <p className="text-slate-400 text-sm font-semibold mt-1">
            Manage your personal profile details and clinical history records
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-8">
          {/* Personal Information Card */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Personal Profile</h2>
                <p className="text-xs text-slate-400 font-medium">Update your core account details and picture</p>
              </div>
            </div>

            {/* Profile Picture Section */}
            <div className="mb-6 flex items-center gap-6 p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center border-2 border-slate-700 shrink-0">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <User size={28} className="text-slate-500" />
                )}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Profile Picture URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={profilePicture}
                    onChange={(e) => setProfilePicture(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-100 font-medium text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-100 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Email Address (Read-only)</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-500 font-medium text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Age</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-100 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., +254700000000"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-100 font-medium text-sm"
                />
              </div>
            </div>
          </div>

          {/* Clinical Medical Questionnaire Card */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
                <Stethoscope size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Clinical & Medical History</h2>
                <p className="text-xs text-slate-400 font-medium">Provided to doctors during consultations</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Chronic Conditions */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                  Chronic Conditions (Check all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {commonConditions.map((cond) => (
                    <button
                      type="button"
                      key={cond}
                      onClick={() => handleConditionToggle(cond)}
                      className={`px-4 py-3 rounded-xl border text-sm font-bold text-left transition flex items-center justify-between ${
                        selectedConditions.includes(cond)
                          ? "bg-blue-600/20 border-blue-500 text-blue-300"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span>{cond}</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                        selectedConditions.includes(cond) ? "bg-blue-600 border-blue-600 text-white" : "border-slate-700"
                      }`}>
                        {selectedConditions.includes(cond) ? "✓" : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                  Drug or Food Allergies
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g., Penicillin, Sulphur, Dust or None"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-100 font-medium text-sm"
                />
              </div>

              {/* Surgeries */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                  Past Major Surgeries / Hospitalizations
                </label>
                <div className="flex gap-6 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-300">
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
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-300">
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
                    placeholder="Describe surgeries and approximate dates..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-100 font-medium text-sm"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Save Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving Changes..." : "Save Account Settings"}
            </button>
            {message && (
              <p className={`text-sm font-bold ${message.includes("successfully") ? "text-emerald-400" : "text-rose-400"}`}>
                {message}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
