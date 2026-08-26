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
  Trash2,
  ChevronLeft,
  ChevronRight
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
  type: 'recurring' | 'specific';
  day_or_date: string;
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

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // Availability form state
  const [slotType, setSlotType] = useState<'recurring' | 'specific'>('specific');
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

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot: AvailabilitySlot = {
      id: Date.now(),
      type: slotType,
      day_or_date: slotType === 'specific' ? selectedDate : dayOfWeek,
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
            Manage practice availability slots via monthly calendar, review appointments, and launch secure telehealth sessions.
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

      {/* Monthly Calendar Grid & Slot Management */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-blue-600" size={20} />
            <h3 className="font-bold text-slate-800 text-base">Monthly Practice Calendar & Availability</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white rounded-lg transition text-slate-600">
                <ChevronLeft size={18} />
              </button>
              <span className="px-3 text-sm font-bold text-slate-800">{monthName} {year}</span>
              <button onClick={handleNextMonth} className="p-1.5 hover:bg-white rounded-lg transition text-slate-600">
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSlotType('specific')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${slotType === 'specific' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Specific Date
              </button>
              <button
                type="button"
                onClick={() => setSlotType('recurring')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${slotType === 'recurring' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Recurring Day
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid View */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 p-4">
          <div className="grid grid-cols-7 gap-2 text-center font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {/* Blank padding for start of month */}
            {Array.from({ length: firstDayIndex }).map((_, index) => (
              <div key={`empty-${index}`} className="h-20 bg-transparent" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: totalDaysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
              const formattedMonth = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
              const dateString = `${year}-${formattedMonth}-${formattedDay}`;
              const isSelected = selectedDate === dateString;
              const hasSlots = availabilitySlots.some(s => s.day_or_date === dateString);

              return (
                <div
                  key={dateString}
                  onClick={() => {
                    setSelectedDate(dateString);
                    setSlotType('specific');
                  }}
                  className={`h-20 p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition ${isSelected ? 'bg-blue-50 border-blue-500 shadow-sm ring-2 ring-blue-400/20' : 'bg-white border-slate-200 hover:border-blue-300'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>{dayNum}</span>
                    {hasSlots && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Has Active Slots" />}
                  </div>
                  {hasSlots && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded truncate">
                      Slots Active
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Slot Form for Selected Date/Recurring */}
        <form onSubmit={handleAddSlot} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {slotType === 'specific' ? `Selected Date: ${selectedDate}` : 'Day of Week'}
            </label>
            {slotType === 'specific' ? (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              />
            ) : (
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{slot.day_or_date}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${slot.type === 'specific' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                        {slot.type === 'specific' ? 'Date' : 'Weekly'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{slot.start_time} - {slot.end_time}</div>
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