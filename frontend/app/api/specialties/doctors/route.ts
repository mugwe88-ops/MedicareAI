import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q) return NextResponse.json([]);

  try {
    const result = await pool.query(
      `
      SELECT id, name, specialty, city
      FROM doctors
      WHERE name ILIKE $1 OR specialty ILIKE $1
      LIMIT 10
      `,
      [`%${q}%`]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 });
  }
}
