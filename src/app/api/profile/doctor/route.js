import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const [rows] = await db.execute(`
      SELECT 
        d.doctor_id,
        d.user_id,
        d.name,
        d.specialization,
        d.email,
        d.phone
      FROM doctor d
      WHERE d.user_id = ?
    `, [userId]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Doctor Profile Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}