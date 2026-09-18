export type AppointmentStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Rescheduled';
export type ConsultationType = 'Telehealth' | 'Physical';

export interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
  hospital_affiliation: string;
  avatar_url?: string;
  rating: number;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  consultation_type: ConsultationType;
  status: AppointmentStatus;
  body_system?: string;
  symptoms?: string[];
  pain_level?: number;
  reason?: string;
  ref_code?: string;
  notes?: string;
  doctor?: Doctor;
}

export interface ActivityFeedItem {
  id: string;
  title: string;
  timestamp: string;
  type: 'appointment' | 'prescription' | 'lab' | 'message';
  description: string;
}

export interface HealthReminder {
  id: string;
  title: string;
  due_date: string;
  type: 'medication' | 'vaccine' | 'lab' | 'followup';
  urgency: 'low' | 'medium' | 'high';
}