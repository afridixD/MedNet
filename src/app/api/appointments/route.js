import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      const [rows] = await db.execute(`
        SELECT a.appointment_id, d.name as doctor_name, d.specialization, a.appointment_date, a.status 
        FROM Appointment a
        JOIN Doctor d ON a.doctor_id = d.doctor_id
        JOIN Patient p ON a.patient_id = p.patient_id
        WHERE p.user_id = ?
        ORDER BY a.appointment_date DESC
      `, [userId]);
      return NextResponse.json(rows);
    }

    const [doctors] = await db.execute(`SELECT doctor_id, name, specialization FROM Doctor`);
    return NextResponse.json(doctors);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, doctorId, date } = await request.json(); 

    const [patientRows] = await db.execute('SELECT patient_id FROM Patient WHERE user_id = ?', [userId]);
    if (patientRows.length === 0) return NextResponse.json({ error: "Patient record not found" }, { status: 404 });
    const patientId = patientRows[0].patient_id;

    // --- STRICT DATETIME DUPLICATE CHECK ---
    const [existing] = await db.execute(
      'SELECT appointment_id FROM Appointment WHERE patient_id = ? AND doctor_id = ? AND appointment_date = ?',
      [patientId, doctorId, date]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: "You already have a pending request for this exact time slot." }, { status: 400 });
    }

    await db.execute(
      'INSERT INTO Appointment (patient_id, doctor_id, appointment_date, status) VALUES (?, ?, ?, ?)',
      [patientId, doctorId, date, 'Pending']
    );

    return NextResponse.json({ message: "Appointment booked successfully!" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}