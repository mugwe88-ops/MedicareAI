"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { supabase, DoctorAvailability } from "@/lib/supabase";
import { Calendar as CalendarIcon, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";

const DEMO_DOCTOR_ID = "11111111-1111-1111-1111-111111111111";

export default function PatientBookingPage() {
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<DoctorAvailability | null>(null);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial Fetch & Realtime Subscription
  useEffect(() => {
    async function loadAvailability() {
      setIsLoading(true);
      const { data } = await supabase
        .from("doctor_availability")
        .select("*")
        .eq("doctor_id", DEMO_DOCTOR_ID)
        .gte("date", new Date().toISOString().split("T")[0]);

      if (data) setAvailability(data as DoctorAvailability[]);
      setIsLoading(false);
    }

    loadAvailability();

    // Subscribe to realtime updates when doctor changes availability
    const channel = supabase
      .channel("patient-view-schedule")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "doctor_availability",
          filter: `doctor_id=eq.${DEMO_DOCTOR_ID}`,
        },
        (payload) => {
          const updated = payload.new as DoctorAvailability;
          setAvailability((prev) =>
            prev.map((item) => (item.date === updated.date ? updated : item))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleBookSlot = async () => {
    if (!selectedSlot) return;

    // Call stored procedure to prevent double booking race conditions
    const { data, error } = await supabase.rpc("book_appointment_slot", {
      target_doctor_id: DEMO_DOCTOR_ID,
      target_date: selectedSlot.date,
    });

    const result = data as { success?: boolean; message?: string } | null;

    if (error || !result?.success) {
      setBookingStatus(result?.message || error?.message || "Booking failed.");
    } else {
      setBookingStatus("Appointment successfully reserved!");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-xs font-bold text-slate-500">Loading Doctor Availability...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <h1 className="text-xl font-black text-slate-900">Select an Available Consultation Date</h1>

        {bookingStatus && (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" /> {bookingStatus}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availability.map((slot) => {
            const isSelectable = slot.status === "Available" || slot.status === "Nearly Full";

            return (
              <button
                key={slot.date}
                disabled={!isSelectable}
                onClick={() => setSelectedSlot(slot)}
                className={`p-4 rounded-2xl border text-left transition space-y-2 ${
                  selectedSlot?.date === slot.date
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600"
                    : isSelectable
                    ? "border-slate-200 bg-white hover:border-blue-400"
                    : "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{slot.date}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      slot.status === "Available"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {slot.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 space-y-1">
                  <p className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {slot.start_time} - {slot.end_time}
                  </p>
                  <p>Remaining: {slot.max_patients - slot.booked_patients} slots</p>
                </div>
              </button>
            );
          })}
        </div>

        {selectedSlot && (
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleBookSlot}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              Confirm Appointment for {selectedSlot.date}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}