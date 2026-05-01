import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// 1. GET: Fetches user appointments including prescription_id for visit counting
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    // Added LEFT JOIN on prescription to check for generated records
    const [rows] = await db.execute(`
      SELECT a.appointment_id, d.name as doctor_name, d.specialization, 
             a.appointment_date, a.status, pr.prescription_id
      FROM appointment a
      JOIN patient p ON a.patient_id = p.patient_id
      JOIN doctor d ON a.doctor_id = d.doctor_id
      LEFT JOIN prescription pr ON a.appointment_id = pr.appointment_id
      WHERE p.user_id = ?
      ORDER BY a.appointment_date DESC
    `, [userId]);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. POST: API RELIABILITY - Forces 'Pending' status on creation
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, doctorId, date } = body;

    if (!userId || !doctorId || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [patientRows] = await db.execute('SELECT patient_id FROM patient WHERE user_id = ?', [userId]);
    if (patientRows.length === 0) return NextResponse.json({ error: "Patient profile not found" }, { status: 404 });

    const patientId = patientRows[0].patient_id;

    // Explicitly forcing 'Pending' status to prevent empty strings in the database
    const [result] = await db.execute(
      `INSERT INTO appointment (patient_id, doctor_id, appointment_date, status) 
       VALUES (?, ?, ?, 'Pending')`, 
      [patientId, doctorId, date]
    );

    return NextResponse.json({ 
      success: true, 
      message: "Appointment created", 
      appointmentId: result.insertId 
    });

  } catch (error) {
    console.error("Database POST Error:", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}