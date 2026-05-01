import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const [doctorRows] = await db.execute(
      'SELECT doctor_id FROM doctor WHERE user_id = ?', 
      [userId]
    );

    if (!doctorRows || doctorRows.length === 0) {
      return NextResponse.json([]);
    }

    const doctorId = doctorRows[0].doctor_id;

    const [appointments] = await db.execute(`
      SELECT 
        a.appointment_id, 
        a.patient_id,
        p.name as patient_name, 
        a.appointment_date, 
        a.status,
        p.blood_group,
        p.gender,
        pr.prescription_id
      FROM appointment a
      JOIN patient p ON a.patient_id = p.patient_id
      LEFT JOIN prescription pr ON a.appointment_id = pr.appointment_id
      WHERE a.doctor_id = ? 
      AND a.status IN ('Confirmed', 'Pending')
      ORDER BY a.appointment_date ASC
    `, [doctorId]);

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Doctor Fetch Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}