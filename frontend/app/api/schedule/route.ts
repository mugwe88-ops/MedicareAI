import { NextResponse } from 'next/server';
import sql from '@/lib/db';

// GET: Fetch all schedule rows for a doctor
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get('doctor_id') || '1';

  try {
    const schedule = await sql`
      SELECT * FROM doctor_availability 
      WHERE doctor_id = ${parseInt(doctorId, 10)}
    `;
    return NextResponse.json({ success: true, schedule });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Upsert (insert or update) shift availability
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { doctor_id, day_of_week, start_time, end_time } = body;

    const result = await sql`
      INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, created_at)
      VALUES (${parseInt(doctor_id, 10)}, ${day_of_week}, ${start_time}, ${end_time}, NOW())
      ON CONFLICT (doctor_id, day_of_week)
      DO UPDATE SET 
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time
      RETURNING *;
    `;

    return NextResponse.json({ success: true, data: result[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}