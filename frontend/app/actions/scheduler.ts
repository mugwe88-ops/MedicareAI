"use server";

import { createClient } from "@supabase/supabase-js";
import { DoctorAvailability, ShiftTemplate } from "@/lib/supabase";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function fetchDoctorSchedule(doctorId: string) {
  const { data, error } = await supabase
    .from("doctor_availability")
    .select("*")
    .eq("doctor_id", doctorId);

  if (error) throw new Error(error.message);
  return data as DoctorAvailability[];
}

export async function fetchShiftTemplates(doctorId: string) {
  const { data, error } = await supabase
    .from("doctor_shift_templates")
    .select("*")
    .eq("doctor_id", doctorId);

  if (error) throw new Error(error.message);
  return data as ShiftTemplate[];
}

export async function upsertAvailabilityRecord(record: Partial<DoctorAvailability>) {
  if (!record.doctor_id || !record.date) {
    throw new Error("Missing required doctor_id or date");
  }

  // Calculate status dynamically based on capacity if active
  let computedStatus = record.status || "Available";
  if (computedStatus !== "Leave" && computedStatus !== "Holiday") {
    const booked = record.booked_patients || 0;
    const max = record.max_patients || 15;
    if (booked >= max) computedStatus = "Fully Booked";
    else if (booked >= max * 0.8) computedStatus = "Nearly Full";
  }

  const payload = {
    ...record,
    status: computedStatus,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("doctor_availability")
    .upsert(payload, { onConflict: "doctor_id,date" })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DoctorAvailability;
}

export async function bulkUpsertAvailabilityRecords(records: Partial<DoctorAvailability>[]) {
  const formattedRecords = records.map((rec) => {
    let computedStatus = rec.status || "Available";
    if (computedStatus !== "Leave" && computedStatus !== "Holiday") {
      const booked = rec.booked_patients || 0;
      const max = rec.max_patients || 15;
      if (booked >= max) computedStatus = "Fully Booked";
      else if (booked >= max * 0.8) computedStatus = "Nearly Full";
    }
    return {
      ...rec,
      status: computedStatus,
      updated_at: new Date().toISOString(),
    };
  });

  const { data, error } = await supabase
    .from("doctor_availability")
    .upsert(formattedRecords, { onConflict: "doctor_id,date" })
    .select();

  if (error) throw new Error(error.message);
  return data as DoctorAvailability[];
}

export async function saveShiftTemplate(template: ShiftTemplate) {
  const { data, error } = await supabase
    .from("doctor_shift_templates")
    .upsert(template)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ShiftTemplate;
}