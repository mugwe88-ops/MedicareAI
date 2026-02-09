const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window === "undefined"
    ? "http://localhost:5000"
    : "");

export async function getAppointments() {
  const res = await fetch(`${API_BASE}/api/appointments`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch appointments");
  }

  return res.json();
}
