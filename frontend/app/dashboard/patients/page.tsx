"use client";

export default function PatientsPage() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Patient Management</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Swift MD Patient Records</h2>
          <p className="text-gray-500 mt-2">Manage your patient history and clinical notes from here.</p>
          <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg">Import Patient Data</button>
        </div>
      </div>
    </div>
  );
}