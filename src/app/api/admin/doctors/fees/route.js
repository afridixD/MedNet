import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(request) {
  try {
    const { doctorId, fee } = await request.json();
    await db.execute(
      'UPDATE doctor SET consultation_fee = ? WHERE doctor_id = ?',
      [Number(fee), Number(doctorId)]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}