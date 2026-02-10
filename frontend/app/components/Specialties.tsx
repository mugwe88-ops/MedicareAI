"use client";

export default function Speciality() {
  const specs = [
    "General Physician",
    "Dermatologist",
    "Pediatrician",
    "Gynecologist",
    "Dentist",
    "Orthopedic Surgeon",
  ];

  return (
    <section className="py-12 md:py-16 bg-slate-900 text-white">
      <h2 className="text-xl md:text-2xl font-bold text-center mb-8">
        Book by Speciality
      </h2>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {specs.map((s) => (
            <div
              key={s}
              className="bg-slate-800 p-4 rounded-xl text-center hover:bg-slate-700 cursor-pointer transition
                         text-sm md:text-base font-medium break-words"
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
