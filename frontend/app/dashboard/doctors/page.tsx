"use client";
import { useState, useEffect } from "react";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetch("https://medicareai-1.onrender.com/api/doctors")
      .then(res => res.json())
      .then(data => setDoctors(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Verified Doctors</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.length === 0 ? (
           <p className="text-gray-500">Loading Swift MD practitioners...</p>
        ) : (
          doctors.map((doc: any) => (
            <div key={doc.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mb-4">
                {doc.name?.charAt(0)}
              </div>
              <h3 className="font-bold text-gray-900">{doc.name}</h3>
              <p className="text-blue-600 text-sm mb-2">{doc.specialization}</p>
              <p className="text-gray-500 text-xs">License: {doc.license_number}</p>
              <button className="mt-4 w-full py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-blue-600 hover:text-white transition">
                View Profile
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}