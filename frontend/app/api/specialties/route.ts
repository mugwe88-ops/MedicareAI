import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM specialties ORDER BY name ASC");
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("DB ERROR:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
