"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="bg-white w-64 p-4 border-r min-h-screen">
      <h2 className="font-bold mb-4">Dashboard</h2>
      <ul className="space-y-3 text-gray-700">
        <li className="hover:text-primary cursor-pointer">Overview</li>
        <li className="hover:text-primary cursor-pointer">Appointments</li>
        <li className="hover:text-primary cursor-pointer">Doctors</li>
        <li className="hover:text-primary cursor-pointer">Patients</li>
      </ul>
    </aside>
  );
}

