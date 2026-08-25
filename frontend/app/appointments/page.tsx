"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BookAppointment() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    reason: ""
  });

  // Fetch doctors list on mount
  useEffect(() => {
    fetch("https://medicareai-1.onrender.com/api/doctors-list")
      .then((res) => res.json())
      .then((data) => setDoctors(data))
      .catch((err) => console.error("Error fetching doctors:", err));
  }, []);

  // Fetch doctor availability slots when a doctor is chosen
  const handleDoctorChange = async (doctorId: string) => {
    setFormData({ ...formData, doctor_id: doctorId });
    if (!doctorId) {
      setAvailability([]);
      return;
    }

    try {
      const res = await fetch(`https://medicareai-1.onrender.com/api/doctors/${doctorId}/availability`);
      const data = await res.json();
      setAvailability(data);
    } catch (err) {
      console.error("Error fetching availability slots:", err);
      setAvailability([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch("https://medicareai-1.onrender.com/api/my-appointments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Success! Your appointment is secured.");
        router.push("/doctor/dashboard");
      } else {
        const errorData = await res.json();
        alert(`Submission failed: ${errorData.error || "Please check details."}`);
      }
    } catch (err) {
      console.error("Connection Error:", err);
      alert("Could not reach the server.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 p-10 border border-slate-100">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Book Appointment</h2>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-8">Secure Clinical Entry</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Select Doctor */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-2">Select Doctor</label>
            <select 
              required
              className="w-full mt-1 px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
              value={formData.doctor_id}
              onChange={(e) => handleDoctorChange(e.target.value)}
            >
              <option value="">-- Choose a Medical Professional --</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.name} ({doc.specialization})
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Availability Preview Banner */}
          {formData.doctor_id && (
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-xs font-black uppercase tracking-wider text-blue-900 mb-2">Doctor's Schedule Guidelines:</p>
              {availability.length > 0 ? (
                <ul className="space-y-1">
                  {availability.map((slot, index) => (
                    <li key={index} className="text-xs font-bold text-blue-700">
                      • {slot.day_of_week}: {slot.start_time} - {slot.end_time}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 font-medium">No custom schedule rules found. Standard hours apply.</p>
              )}
            </div>
          )}

          {/* Appointment Date */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-2">Appointment Date</label>
            <input 
              required
              type="date"
              className="w-full mt-1 px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
              onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
            />
          </div>

          {/* Appointment Time */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-2">Appointment Time</label>
            <input 
              required
              type="time"
              className="w-full mt-1 px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
              onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
            />
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-2">Reason for Visit</label>
            <textarea 
              required
              className="w-full mt-1 px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all h-24"
              placeholder="Primary symptoms..."
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 mt-4"
          >
            Confirm & Secure Appointment
          </button>
        </form>
      </div>
    </div>
  );
}