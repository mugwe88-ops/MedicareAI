export default function Doctors() {
  const doctors = [
    { name: "Dr. John Doe", spec: "Cardiologist", rating: 4.8 },
    { name: "Dr. Jane Smith", spec: "Dermatologist", rating: 4.6 },
    { name: "Dr. Ahmed Ali", spec: "Pediatrician", rating: 4.9 },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6">
        {doctors.map((d) => (
          <div key={d.name} className="border p-6 rounded-xl shadow">
            <div className="w-16 h-16 bg-gray-200 rounded-full mb-3"></div>
            <h3 className="font-bold">{d.name}</h3>
            <p className="text-gray-500">{d.spec}</p>
            <p className="text-yellow-500">⭐ {d.rating}</p>
            <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded">
              Book Now
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
