import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [doctors] = await db.execute(`
      SELECT 
        d.doctor_id, d.name, d.specialization, d.consultation_fee,
        d.assistant_id, a.name as assistant_name
      FROM doctor d
      LEFT JOIN assistant a ON d.assistant_id = a.assistant_id
      ORDER BY d.name
    `);
    const [assistants] = await db.execute(
      'SELECT assistant_id, name, phone FROM assistant ORDER BY name'
    );
    return NextResponse.json({ doctors, assistants });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}