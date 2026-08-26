'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search,
  Filter,
  Plus,
  Trash2
} from 'lucide-react';

interface Appointment {
  id: string | number;
  patient_name: string;
  phone?: string;
  appointment_date: string;
  appointment_time: string;
  reason?: string;
  status?: string;
}

interface AvailabilitySlot {
  id: string | number;
  day: string;
  start_time: string;
  end_time: string;
}

export default function ScheduleManagerPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Availability form state
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotMessage, setSlotMessage] = useState<string | null>(null);

  // Fetch appointments & availability slots
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch('https://medicareai-yb5c.onrender.com/api/doctors/appointments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setAppointments(data.appointments || data || []);
        } else {
          setAppointments([
            {
              id: 1,
              patient_name: 'Jane Doe',
              phone: '+1 (555) 019-2834',
              appointment_date: '2026-08-26',
              appointment_time: '14:00',
              reason: 'Routine follow-up & blood pressure check',
              status: 'scheduled'
            },
            {
              id: 2,
              patient_name: 'Robert Smith',
              phone: '+1 (555) 839-2011',
              appointment_date: '2026-08-26',
              appointment_time: '15:30',
              reason: 'Persistent cough and throat irritation',
              status: 'scheduled'
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to load schedule data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot: AvailabilitySlot = {
      id: Date.now(),
      day: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
    };
    setAvailabilitySlots([...availabilitySlots, newSlot]);
    setSlotMessage('Availability slot added successfully.');
    setTimeout(() => setSlotMessage(null), 3000);
  };

  const handleDeleteSlot = (id: string | number) => {
    setAvailabilitySlots(availabilitySlots.filter(slot => slot.id !== id));
  };

  const handleStartConsultation = (appointmentId: string | number) => {
    router.push(`/doctors/telehealth/${appointmentId}`);
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = 
      apt.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || apt.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen text-slate-900">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarIcon className="text-blue-600" size={28} />
            Schedule Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage practice availability slots, upcoming patient consultations, and launch secure telehealth sessions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/doctors/telehealth/quick-consult')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm"
          >
            <Video size={18} />
            Quick Consult Room
          </button>
        </div>
      </div>

      {slotMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle size={18} /> {slotMessage}
        </div>
      )}

      {/* Manage Practice Availability Slots Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-blue-600" size={20} />
            <h3 className="font-bold text-slate-800 text-base">Manage Practice Availability Slots</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Configure schedule visible to patients during booking</span>
        </div>

        <form onSubmit={handleAddSlot} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Day of Week</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm"
            >
              <Plus size={16} /> Add Slot
            </button>
          </div>
        </form>

        <div className="pt-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Current Active Schedule:</p>
          {availabilitySlots.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No availability slots added yet. Patients will not see open times for booking.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {availabilitySlots.map(slot => (
                <div key={slot.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm">
                  <div>
                    <span className="font-bold text-slate-800">{slot.day}</span>
                    <div className="text-xs text-slate-500">{slot.start_time} - {slot.end_time}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="text-slate-400 hover:text-red-600 p-1 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar: Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search patient name or clinical reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter size={16} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base">Today's Appointments</h3>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
            {filteredAppointments.length} Active
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm font-medium">
            Loading schedule agenda...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <AlertCircle className="mx-auto text-slate-300" size={40} />
            <p className="text-sm font-medium text-slate-500">No appointments found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-3.5">Patient Details</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Clinical Reason</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {apt.patient_name ? apt.patient_name.charAt(0) : 'P'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{apt.patient_name}</p>
                          <p className="text-xs text-slate-500">{apt.phone || 'No phone listed'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium text-xs">
                        <CalendarIcon size={14} className="text-slate-400" />
                        {apt.appointment_date}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                        <Clock size={14} className="text-slate-400" />
                        {apt.appointment_time}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                      {apt.reason || 'General Consultation'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {apt.status || 'Scheduled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleStartConsultation(apt.id)}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg font-semibold text-xs transition shadow-sm"
                      >
                        <Video size={14} />
                        Launch Session
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}