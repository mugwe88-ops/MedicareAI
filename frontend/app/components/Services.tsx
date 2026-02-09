export default function Services() {
  const services = [
    { name: "Video Consultation", icon: "🩺" },
    { name: "Order Medicines", icon: "💊" },
    { name: "Lab Tests", icon: "🧪" },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6">
        {services.map((s) => (
          <div
            key={s.name}
            className="bg-white p-8 shadow rounded-xl text-center hover:shadow-xl transition"
          >
            <div className="text-4xl">{s.icon}</div>
            <h3 className="font-bold text-lg mt-2">{s.name}</h3>
            <p className="text-gray-500 mt-1">
              Safe and fast healthcare services
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
