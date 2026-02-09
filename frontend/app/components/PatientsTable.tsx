export default function PatientsTable() {
  const patients = [
    { name: "John Doe", age: 45, condition: "Diabetes" },
    { name: "Jane Smith", age: 32, condition: "Hypertension" },
  ];

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
      <h3 className="text-xl font-bold mb-4">Recent Patients</h3>

      <table className="w-full text-left">
        <thead className="text-slate-400 border-b border-slate-700">
          <tr>
            <th className="py-2">Name</th>
            <th>Age</th>
            <th>Condition</th>
          </tr>
        </thead>

        <tbody>
          {patients.map((p) => (
            <tr key={p.name} className="border-b border-slate-700 hover:bg-slate-700">
              <td className="py-2">{p.name}</td>
              <td>{p.age}</td>
              <td>{p.condition}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
