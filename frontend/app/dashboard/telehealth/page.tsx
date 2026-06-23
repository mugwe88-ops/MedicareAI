'use client';

import { useRouter } from "next/navigation";

export default function TelehealthLandingPage() {
  const router = useRouter();

  // Example handler to enter a room
  const handleJoinRoom = (appointmentId: string) => {
    // Navigates out to your existing dynamic dynamic folder: app/telehealth/[appointmentId]
    router.push(`/telehealth/${appointmentId}`);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Telehealth Room</h1>
        <p className="text-gray-600 mt-1">Join virtual consultations and connect live with your provider.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Next Virtual Session</h2>
          <p className="text-sm text-gray-500 mb-4">You have a session scheduled today.</p>
          
          {/* Replace 'example-id' with dynamic active appointment ID state if available */}
          <button 
            onClick={() => handleJoinRoom("example-id")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            Enter Video Consultation Room
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Hardware Check</h2>
            <p className="text-sm text-gray-500">Ensure your camera and microphone access are allowed in your browser settings before entering.</p>
          </div>
          <span className="text-xs text-green-600 font-medium mt-4">✓ System Ready</span>
        </div>
      </div>
    </div>
  );
}