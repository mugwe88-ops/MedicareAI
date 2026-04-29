"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookAppointment() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    patient_name: "",
    phone: "",
    appointment_time: "",
    reason: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting to Render...", formData);

    try {
      const res = await fetch("https://medicareai-1.onrender.com/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Success! Your appointment is secured.");
        router.push("/doctor/dashboard");
      } else {
        alert("Submission failed. Please check the clinical logs.");
      }
    } catch (err) {
      console.error("Connection Error:", err);
      alert("Could not reach the server.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 p-10 border border-slate-100">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Book Appointment</h2>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-8">Secure Clinical Entry</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-2">Full Name</label>
            <input 
              required
              className="w-full mt-1 px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="John Doe"
              onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-2">Phone Number</label>
            <input 
              required
              className="w-full mt-1 px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="+254..."
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-2">Preferred Date/Time</label>
            <input 
              required
              type="datetime-local"
              className="w-full mt-1 px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
              onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
            />
          </div>

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
            Create one here
          </button>
        </form>
      </div>
    </div>
  );
}