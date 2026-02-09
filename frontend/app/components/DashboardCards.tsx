export default function DashboardCards() {
  const cards = [
    { title: "Total Patients", value: 120 },
    { title: "Appointments Today", value: 15 },
    { title: "Revenue", value: "$4,200" },
    { title: "Doctors", value: 8 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {cards.map((c) => (
        <div
          key={c.title}
          className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700"
        >
          <p className="text-slate-400">{c.title}</p>
          <h2 className="text-3xl font-bold mt-2">{c.value}</h2>
        </div>
      ))}
    </div>
  );
}
