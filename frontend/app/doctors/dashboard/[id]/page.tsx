'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AppointmentDetailsPage() {
  const params = useParams();
  const appointmentId = params?.id;
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => router.back()}
            className="text-xs text-gray-400 hover:text-white mb-2 inline-block"
          >
            ← Back to Appointments List
          </button>
          <h1 className="text-xl font-bold">Appointment Details #{appointmentId}</h1>
        </div>
        <div className="flex gap-3">
          <Link href={`/doctors/dashboard/telehealth/${appointmentId}`}>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm">
              Start Video Consultation
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Questionnaire Column */}
        <div className="lg:col-span-2 bg-[#131926] border border-gray-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Patient Medical Questionnaire & History</h2>
          <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
            <p><strong className="text-gray-200">Patient Name:</strong> Lucy Catherine</p>
            <p><strong className="text-gray-200">Chief Complaint:</strong> General Consultation</p>
            <p><strong className="text-gray-200">Phone:</strong> 0794398158</p>
            <p><strong className="text-gray-200">Visit Timing:</strong> 30 Aug 2026 at 9:00 AM</p>
            <p><strong className="text-gray-200">Chronic Conditions:</strong> None</p>
            <p><strong className="text-gray-200">Allergies:</strong> None</p>
          </div>
        </div>

        {/* Clinical Notes Column */}
        <div className="bg-[#131926] border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Clinical Documentation</h2>
            <p className="text-xs text-gray-500 italic">No clinical notes recorded yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
