type Doctor = {
  name: string;
  speciality: string;
  location: string;
  rating: number;
};

export default function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <div className="border p-6 rounded-xl shadow hover:shadow-xl transition bg-white">
      <div className="w-16 h-16 bg-gray-200 rounded-full mb-3"></div>

      <h3 className="font-bold text-lg">{doctor.name}</h3>
      <p className="text-gray-600">{doctor.speciality}</p>
      <p className="text-sm text-gray-500">{doctor.location}</p>
      <p className="text-yellow-500">⭐ {doctor.rating}</p>

      <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded">
        Book Now
      </button>
    </div>
  );
}
