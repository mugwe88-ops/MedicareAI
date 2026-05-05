export default function Doctors() {
  const doctors = [
    { id: 1, name: "Dr. John Doe", spec: "Cardiologist", rating: 4.8 }, // Use real IDs from your users table
    { id: 2, name: "Dr. Jane Smith", spec: "Dermatologist", rating: 4.6 },
    { id: 3, name: "Dr. Ahmed Ali", spec: "Pediatrician", rating: 4.9 },
  ];

  const handleBook = async (doctorId) => {
    const payload = {
      patient_id: 1, // Your ID from the Neon screenshot
      doctor_id: doctorId,
      appointment_time: "2026-05-23 09:40:00",
      phone: "0723503988",
      reason: "Consultation"
    };

    try {
      const res = await fetch("https://medicareai-1.onrender.com/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) alert("Appointment Booked!");
    } catch (err) {
      console.error("Booking failed", err);
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6">
        {doctors.map((d) => (
          <div key={d.id} className="p-4 border rounded-xl">
             {/* ... your existing UI ... */}
             <button 
               onClick={() => handleBook(d.id)}
               className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
             >
               Book Now
             </button>
          </div>
        ))}
      </div>
    </section>
  );
}