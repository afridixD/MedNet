import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { doctorId, assistantId } = await request.json();
    await db.execute(
      'UPDATE doctor SET assistant_id = ? WHERE doctor_id = ?',
      [assistantId ? Number(assistantId) : null, Number(doctorId)]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}