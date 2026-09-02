'use client';

import { useState } from 'formik' or 'react'; // using standard React hooks
import React, { useState } from 'react';

export default function RegisterDoctorPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    specialization: '',
    licenseNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Replace with your actual backend URL if different (e.g., http://localhost:5000/api/admin/register-doctor)
      const response = await fetch('http://localhost:5000/api/admin/register-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register doctor');
      }

      setMessage({ type: 'success', text: 'Doctor registered successfully in Supabase!' });
      // Reset form
      setFormData({
        email: '',
        password: '',
        displayName: '',
        specialization: '',
        licenseNumber: '',
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Register New Doctor</h1>

      {message.text && (
        <div className={`p-3 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name (Display Name)</label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            placeholder="Dr. Jane Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            placeholder="doctor@medicare.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Specialization</label>
          <input
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            placeholder="Pediatrics, Cardiology, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">License Number</label>
          <input
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            placeholder="DOC-123456"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register Doctor'}
        </button>
      </form>
    </div>
  );
}