"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, Calendar, Video, ShieldCheck, Star } from "lucide-react";

interface Doctor {
  id: number;
  name: string;
  department: string;
  email: string;
  phone?: string;
  availability?: string;
}

export default function DoctorDirectoryPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch doctor records from your backend or use default fallback mock data
    const fetchDoctors = async () => {
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          "https://medicareai-1.onrender.com";
        const res = await fetch(`${backendUrl}/api/doctors`);
        if (res.ok) {
          const data = await res.json();
          setDoctors(data);
        } else {
          // Fallback mock doctors if endpoint is unavailable
          setDoctors([
            { id: 1, name: "Dr. Sarah Jenkins", department: "Cardiology", email: "sarah.jenkins@swiftmd.com", availability: "Mon - Fri (09:00 - 16:00)" },
            { id: 2, name: "Dr. Michael Mugwe", department: "General Medicine", email: "michael.mugwe@swiftmd.com", availability: "Daily (08:00 - 18:00)" },
            { id: 3, name: "Dr. Elena Rostova", department: "Pediatrics", email: "elena.rostova@swiftmd.com", availability: "Tue, Thu, Sat (10:00 - 15:00)" },
            { id: 4, name: "Dr. James Ochieng", department: "Neurology", email: "james.ochieng@swiftmd.com", availability: "Mon, Wed, Fri (13:00 - 17:00)" },
          ]);
        }
      } catch (err) {
        setDoctors([
          { id: 1, name: "Dr. Sarah Jenkins", department: "Cardiology", email: "sarah.jenkins@swiftmd.com", availability: "Mon - Fri (09:00 - 16:00)" },
          { id: 2, name: "Dr. Michael Mugwe", department: "General Medicine", email: "michael.mugwe@swiftmd.com", availability: "Daily (08:00 - 18:00)" },
          { id: 3, name: "Dr. Elena Rostova", department: "Pediatrics", email: "elena.rostova@swiftmd.com", availability: "Tue, Thu, Sat (10:00 - 15:00)" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.department && doc.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getInitials = (name: string) => {
    return name
      .replace("Dr. ", "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-4 sm:p-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Users className="text-blue-500" size={32} />
              Doctor Directory
            </h1>
            <p className="text-slate-400 text-sm font-semibold mt-1">
              Browse qualified medical specialists and book consultations
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or dept..."
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-100 font-medium text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold">
            Loading doctor directory...
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium bg-slate-900 rounded-3xl border border-slate-800">
            No doctors found matching "{searchQuery}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-sm hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-lg shadow-inner">
                      {getInitials(doc.name)}
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  </div>

                  <h3 className="font-black text-white text-lg">{doc.name}</h3>
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mt-0.5 mb-3">
                    {doc.department || "General Practice"}
                  </p>

                  <div className="space-y-2 text-xs text-slate-400 mb-6 bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
                    <p className="flex justify-between">
                      <span className="font-semibold">Email:</span>
                      <span className="text-slate-300">{doc.email}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold">Availability:</span>
                      <span className="text-slate-300">{doc.availability || "Mon-Fri"}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                  <button
                    onClick={() => router.push(`/dashboard/appointments`)}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    <Calendar size={14} /> Book Visit
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/telehealth`)}
                    className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition"
                    title="Telehealth Room"
                  >
                    <Video size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}