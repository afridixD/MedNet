import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const assistantUserId = searchParams.get('assistantId');

    if (assistantUserId) {
      const [doctors] = await db.execute(`
        SELECT d.doctor_id, d.name, d.specialization, d.is_available 
        FROM doctor d
        JOIN assistant a ON d.assistant_id = a.assistant_id
        WHERE a.user_id = ?
      `, [assistantUserId]);
      return NextResponse.json(doctors);
    }

    const [allDoctors] = await db.execute(`
      SELECT doctor_id, name, specialization, is_available 
      FROM doctor
    `);
    return NextResponse.json(allDoctors);

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}