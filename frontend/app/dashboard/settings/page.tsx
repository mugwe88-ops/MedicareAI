"use client";

export default function SettingsPage() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">System Settings</h1>
      <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Portal Name</label>
            <input type="text" value="Swift MD" disabled className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notification Email</label>
            <input type="email" placeholder="admin@swiftmd.com" className="w-full p-2 border border-gray-200 rounded-lg text-black" />
          </div>
          <div className="pt-4 border-t border-gray-100">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}