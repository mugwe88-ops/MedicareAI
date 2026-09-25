// lib/supabase.ts

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://placeholder.supabase.co";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "placeholder-key";

// SSR-compatible browser client that writes session tokens to Cookies (allowing Server Actions access)
export const supabase = createBrowserClient(supabaseUrl, supabaseKey);

/* ==========================================
   Shared Types
========================================== */

// Updated union type to account for UI variant labels and canonical database statuses
export type AvailabilityStatus =
  | "Available"
  | "Available (Green)"
  | "Few slots left"
  | "Nearly Full"
  | "Fully Booked"
  | "Off Duty"
  | "Off"
  | "Leave"
  | "Holiday";

/* ==========================================
   Doctor
========================================== */

export interface Doctor {
  id: string;
  full_name: string;
  display_name?: string;
  name?: string;
  specialty?: string;
  specialization?: string;
  hospital_affiliation?: string;
  consultation_fee: number;
  rating: number;
  is_online?: boolean;
  sha_covered?: boolean;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

/* ==========================================
   Doctor Availability
========================================== */

export interface DoctorAvailability {
  id?: string;
  doctor_id: string;
  date: string; // ISO format string: YYYY-MM-DD
  status?: AvailabilityStatus;
  location_id?: string;
  clinic_location?: string;
  start_time: string; // "08:00:00" or "08:00 AM"
  end_time: string;   // "17:00:00" or "05:00 PM"
  morning_enabled?: boolean;
  afternoon_enabled?: boolean;
  buffer_minutes?: number;
  slot_duration?: number; // Duration per consultation in minutes (e.g. 30)
  slot_duration_minutes?: number;
  max_patients?: number;
  booked_patients?: number;
  emergency_enabled?: boolean;
  is_available?: boolean;
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
  patient_name?: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  consultation_type?: "Telehealth" | "Physical" | "In-Clinic";
  status: "Scheduled" | "Completed" | "Cancelled" | string;
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

/* ==========================================
   Time & Status Formatting Utilities
========================================== */

/**
 * Normalizes UI status strings into standard canonical statuses.
 */
export function normalizeAvailabilityStatus(status: string): AvailabilityStatus {
  if (!status) return "Available";
  if (status.includes("Available")) return "Available";
  if (status.includes("Nearly Full")) return "Nearly Full";
  if (status.includes("Few")) return "Few slots left";
  if (status.includes("Full")) return "Fully Booked";
  if (status.includes("Off")) return "Off Duty";
  if (status.includes("Leave")) return "Leave";
  return "Available";
}

/**
 * Converts standard time inputs ("08:00 AM", "05:00 PM", "8:00") to 24-hour SQL TIME format ("08:00:00").
 */
export function formatTo24HourTime(timeStr: string): string {
  if (!timeStr) return "08:00:00";
  
  const trimmed = timeStr.trim().toLowerCase();
  
  // If string already lacks am/pm, format as HH:mm:ss
  if (!trimmed.includes("am") && !trimmed.includes("pm")) {
    const parts = trimmed.split(":");
    const hrs = parts[0].padStart(2, "0");
    const mins = (parts[1] || "00").padStart(2, "0");
    return `${hrs}:${mins}:00`;
  }

  const [time, period] = trimmed.split(/\s+/);
  let [hours, minutes] = time.split(":");
  let hrs = parseInt(hours, 10);

  if (period === "pm" && hrs < 12) hrs += 12;
  if (period === "am" && hrs === 12) hrs = 0;

  const formattedHours = hrs.toString().padStart(2, "0");
  const formattedMinutes = (minutes || "00").padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:00`;
}

/**
 * Converts a 24-hour string or total minutes past midnight into a readable 12-hour format ("08:00 AM").
 */
export function formatTo12HourTime(timeStr: string | number): string {
  let totalMinutes = 0;

  if (typeof timeStr === "number") {
    totalMinutes = timeStr;
  } else {
    if (!timeStr) return "12:00 AM";
    if (timeStr.toLowerCase().includes("am") || timeStr.toLowerCase().includes("pm")) {
      return timeStr;
    }
    const [h, m] = timeStr.split(":").map(Number);
    totalMinutes = (h || 0) * 60 + (m || 0);
  }

  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const period = hrs >= 12 ? "PM" : "AM";
  const displayHours = hrs % 12 === 0 ? 12 : hrs % 12;
  const displayMins = mins.toString().padStart(2, "0");

  return `${displayHours.toString().padStart(2, "0")}:${displayMins} ${period}`;
}