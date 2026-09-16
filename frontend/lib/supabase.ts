import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DoctorAvailability {
  id?: string;
  doctor_id: string;
  date: string;
  status: "Available" | "Leave" | "Holiday" | "Fully Booked" | "Nearly Full";
  clinic_location: string;
  start_time: string;
  end_time: string;
  max_patients: number;
  booked_patients: number;
  buffer_minutes: number;
  emergency_enabled: boolean;
  updated_at?: string;
}

export interface ShiftTemplate {
  id?: string;
  doctor_id: string;
  name: string;
  morning_start: string;
  morning_end: string;
  afternoon_start: string;
  afternoon_end: string;
  clinic_location: string;
}