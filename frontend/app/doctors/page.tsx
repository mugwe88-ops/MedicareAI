"use client";

import { useSearchParams } from "next/navigation";
import DoctorsList from "../components/DoctorsList";

export default function DoctorsPage() {
  const params = useSearchParams();
  const query = params.get("q") || "";

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">
        Search Results for: {query}
      </h1>

      <DoctorsList query={query} />
    </div>
  );
}
