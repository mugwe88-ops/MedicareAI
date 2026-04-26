"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="bg-white w-64 p-4 border-r min-h-screen">
      <h2 className="font-bold mb-4">Dashboard</h2>
      <ul className="space-y-3 text-gray-700">
        <li>
          <Link href="/dashboard" className="hover:text-primary cursor-pointer block">
            Overview
          </Link>
        </li>
        <li>
          <Link href="/dashboard/appointments" className="hover:text-primary cursor-pointer block">
            Appointments
          </Link>
        </li>
        <li>
          <Link href="/dashboard/doctors" className="hover:text-primary cursor-pointer block">
            Doctors
          </Link>
        </li>
        <li>
          <Link href="/dashboard/patients" className="hover:text-primary cursor-pointer block">
            Patients
          </Link>
        </li>
      </ul>
    </aside>
  );
}