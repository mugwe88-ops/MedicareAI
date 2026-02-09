import { doctors } from "../data/doctors";
import DoctorCard from "./DoctorCard";

export default function DoctorsList({ query }: { query: string }) {
  const filtered = doctors.filter((d) =>
    d.speciality.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {filtered.map((doc) => (
        <DoctorCard key={doc.id} doctor={doc} />
      ))}
    </div>
  );
}
