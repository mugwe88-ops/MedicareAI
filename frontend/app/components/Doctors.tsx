import React, { useState } from 'react';

export default function Doctors() {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState("");

  const doctors = [
    { id: 1, name: "Dr. John Doe", spec: "Cardiologist", rating: 4.8 }, 
    { id: 2, name: "Dr. Jane Smith", spec: "Dermatologist", rating: 4.6 },
    { id: 3, name: "Dr. Ahmed Ali", spec: "Pediatrician", rating: 4.9 },
  ];

  const handleBook = async () => {
    if (!selectedDoctor || !bookingDate) {
      alert("Please select a doctor and a date.");
      return;
    }

    const payload = {
      patient_id: 1, // William Weru's ID from Neon
      doctor_id: selectedDoctor.id, 
      appointment_time: bookingDate,
      phone: "0723503988",
      reason: "General Consultation"
    };

    try {
      const res = await fetch("https://medicareai-1.onrender.com/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(`Appointment with ${selectedDoctor.name} Booked!`);
        setSelectedDoctor(null);
      } else {
        const errorData = await res.json();
        console.error("Server Error:", errorData);
      }
    } catch (err) {
      console.error("Booking failed", err);
    }
  };

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Available Specialists</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {doctors.map((d) => (
            <div key={d.id} className="p-6 bg-white border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full mb-4 flex items-center justify-center text-blue-600 font-bold text-xl">
                {d.name.charAt(4)}
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{d.name}</h3>
              <p className="text-blue-600 font-medium">{d.spec}</p>
              <p className="text-yellow-500 text-sm mt-1">★ {d.rating}</p>
              
              <button 
                onClick={() => setSelectedDoctor(d)}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Book Appointment
              </button>
          </div>
          ))}
        </div>

        {/* Simple Booking Modal */}
        {selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4">Confirm Booking</h3>
              <p className="text-gray-600 mb-6">Booking with <strong>{selectedDoctor.name}</strong></p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date & Time</label>
              <input 
                type="datetime-local" 
                className="w-full border rounded-lg p-2 mb-6"
                onChange={(e) => setBookingDate(e.target.value)}
              />

              <div className="flex gap-4">
                <button 
                  onClick={() => setSelectedDoctor(null)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBook}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}