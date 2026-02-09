// frontend/lib/api.ts

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getAppointments() {
  const res = await fetch(`${API_URL}/appointments`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch appointments");
  }

  return res.json();
}
