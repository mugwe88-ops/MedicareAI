export type AppointmentStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Rescheduled' | 'Confirmed';
export type ConsultationType = 'Telehealth' | 'Physical';

export interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
  hospital_affiliation: string;
  avatar_url?: string;
  rating: number;
  years_of_experience: number;
  consultation_fee: number;
  sha_covered: boolean;
  is_online: boolean;
  next_available_slot?: string;
}

export interface DoctorAvailability {
  id: string;
  doctor_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  status: 'Available' | 'Nearly Full' | 'Fully Booked' | 'Off Duty' | 'Leave';
  max_slots: number;
  booked_slots: number;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string; // YYYY-MM-DD
  start_time: string;
  end_time: string;
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