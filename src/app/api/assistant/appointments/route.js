// /api/assistant/appointments/route.js

import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // This query pulls all appointments for any doctor assigned to this assistant
    const [rows] = await db.execute(`
      SELECT a.appointment_id, p.name as patient_name, d.name as doctor_name, 
             a.appointment_date, a.status 
      FROM appointment a
      JOIN patient p ON a.patient_id = p.patient_id
      JOIN doctor d ON a.doctor_id = d.doctor_id
      JOIN assistant ast ON d.assistant_id = ast.assistant_id
      WHERE ast.user_id = ?
      ORDER BY a.appointment_date ASC
    `, [userId]);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { appointmentId, status } = await request.json();

    if (!appointmentId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Force exact status strings to match frontend logic
    const validStatuses = ['Confirmed', 'Rejected', 'Pending'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Perform the update in the database
    const [result] = await db.execute(
      'UPDATE appointment SET status = ? WHERE appointment_id = ?',
      [status, appointmentId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Database PATCH Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}