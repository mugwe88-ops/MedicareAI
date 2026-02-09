export default function Speciality() {
  const specs = [
    "General Physician",
    "Dermatologist",
    "Pediatrician",
    "Gynecologist",
    "Dentist",
    "Orthopedic",
  ];

  return (
    <section className="py-16 bg-slate-900 text-white">
      <h2 className="text-2xl font-bold text-center mb-8">
        Book by Speciality
      </h2>

      <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6">
        {specs.map((s) => (
          <div
            key={s}
            className="bg-slate-800 p-6 rounded-lg text-center hover:bg-slate-700 cursor-pointer"
          >
            {s}
          </div>
        ))}
      </div>
    </section>
  );
}
