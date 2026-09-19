"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, Calendar, Star, ShieldCheck, Video } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Doctor {
  id: string | number;
  display_name?: string;
  name?: string;
  specialization?: string;
  department?: string;
  email: string;
  phone?: string;
  availability?: string;
  profile_picture?: string;
  rating?: number;
}

export default function DoctorDirectoryPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctorsFromSupabase() {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*');

        if (data && data.length > 0) {
          setDoctors(data);
        } else {
          // Fallback doctors list including Dr. Makena
          setDoctors([
            { id: 1, name: "Dr. Sarah Jenkins", department: "Cardiology", email: "sarah.jenkins@swiftmd.com", availability: "Mon - Fri (09:00 - 16:00)" },
            { id: 2, name: "Dr. Michael Mugwe", department: "General Medicine", email: "michael.mugwe@swiftmd.com", availability: "Daily (08:00 - 18:00)" },
            { id: 3, name: "Dr. Elena Rostova", department: "Pediatrics", email: "elena.rostova@swiftmd.com", availability: "Tue, Thu, Sat (10:00 - 15:00)" },
            { id: 4, name: "Dr. James Ochieng", department: "Neurology", email: "james.ochieng@swiftmd.com", availability: "Mon, Wed, Fri (13:00 - 17:00)" },
            { id: "a1b2c3d4-5555-0005-0000-000000000005", display_name: "Dr. Makena", department: "Women's Health & General Care", email: "makena@swiftmd.com", availability: "Daily (08:00 - 18:00)" },
          ]);
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setDoctors([
          { id: 1, name: "Dr. Sarah Jenkins", department: "Cardiology", email: "sarah.jenkins@swiftmd.com", availability: "Mon - Fri (09:00 - 16:00)" },
          { id: 2, name: "Dr. Michael Mugwe", department: "General Medicine", email: "michael.mugwe@swiftmd.com", availability: "Daily (08:00 - 18:00)" },
          { id: "a1b2c3d4-5555-0005-0000-000000000005", display_name: "Dr. Makena", department: "Women's Health & General Care", email: "makena@swiftmd.com", availability: "Daily (08:00 - 18:00)" },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchDoctorsFromSupabase();
  }, []);

  // Filter safely supporting both name / display_name and department / specialization
  const filteredDoctors = doctors.filter((doc) => {
    const docName = doc.display_name || doc.name || "";
    const dept = doc.specialization || doc.department || "General Practice";
    const query = searchQuery.toLowerCase();
    
    return docName.toLowerCase().includes(query) || dept.toLowerCase().includes(query);
  });

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
              Browse qualified medical specialists, book visits, or launch live video consultations
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or department..."
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
            {filteredDoctors.map((doc) => {
              const docName = doc.display_name || doc.name || "Specialist";
              const docDept = doc.specialization || doc.department || "General Practice";

              return (
                <div
                  key={doc.id}
                  className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-sm hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-lg shadow-inner border border-blue-500/20">
                        {doc.profile_picture ? (
                          <img src={doc.profile_picture} alt={docName} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(docName)
                        )}
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck size={12} /> Verified
                      </span>
                    </div>

                    <h3 className="font-black text-white text-lg">{docName}</h3>
                    <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mt-0.5 mb-3">
                      {docDept}
                    </p>

                    <div className="space-y-2 text-xs text-slate-400 mb-6 bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
                      <p className="flex justify-between">
                        <span className="font-semibold">Email:</span>
                        <span className="text-slate-300">{doc.email}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="font-semibold">Availability:</span>
                        <span className="text-slate-300">{doc.availability || "Daily"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          router.push(
                            `/patient/dashboard/appointments?doctorId=${doc.id}&doctorName=${encodeURIComponent(
                              docName
                            )}&department=${encodeURIComponent(docDept)}`
                          )
                        }
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5"
                      >
                        <Calendar size={13} /> Book Visit
                      </button>
                      <button
                        onClick={() => {
                          alert(`Leave a review for ${docName}`);
                        }}
                        className="p-2.5 bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-xl transition"
                        title="Leave a Review"
                      >
                        <Star size={15} fill="currentColor" />
                      </button>
                    </div>

                    {/* Direct Launch Video Consultation Button with Doctor ID Query Param */}
                    <button
                      onClick={() =>
                        router.push(
                          `/patient/dashboard/consultations?doctorId=${doc.id}&doctorName=${encodeURIComponent(
                            docName
                          )}`
                        )
                      }
                      className="w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Video size={14} /> Join Video Consultation
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}