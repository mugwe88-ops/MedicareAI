// lib/supabase.ts

import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://placeholder.supabase.co";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseKey);

/* ==========================================
   Shared Types
========================================== */

export type AvailabilityStatus =
  | "Available"
  | "Few slots left"
  | "Nearly Full"
  | "Fully Booked"
  | "Off Duty"
  | "Leave"
  | "Holiday";

/* ==========================================
   Doctor
========================================== */

export interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
  hospital_affiliation: string;
  consultation_fee: number;
  rating: number;
  is_online: boolean;
  sha_covered: boolean;
  created_at?: string;
  updated_at?: string;
}

/* ==========================================
   Doctor Availability
========================================== */

export interface DoctorAvailability {
  id?: string;
  doctor_id: string;
  date: string;
  status: AvailabilityStatus;
  location_id?: string;
  clinic_location: string;
  start_time: string;
  end_time: string;
  morning_enabled: boolean;
  afternoon_enabled: boolean;
  buffer_minutes: number;
  slot_duration: number;
  max_patients: number;
  booked_patients: number;
  emergency_enabled: boolean;
  notes?: string;
  updated_at?: string;
}

/* ==========================================
   Appointment
========================================== */

export interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  patient_name: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  consultation_type: "Telehealth" | "Physical";
  status: "Scheduled" | "Completed" | "Cancelled";
  ref_code?: string;
  created_at?: string;
}

/* ==========================================
   Doctor Location
========================================== */

export interface DoctorLocation {
  id: string;
  doctor_id: string;
  name: string;
  address: string;
  type: "physical" | "telehealth" | "hybrid";
  is_default: boolean;
}