import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const connection = await db.getConnection();
  try {
    const { appointment_id, notes, medicines } = await request.json();

    if (!appointment_id || !notes) {
      return NextResponse.json({ error: "appointment_id and notes are required" }, { status: 400 });
    }

    await connection.beginTransaction();

    // 1. Insert prescription — 'notes' from frontend maps to 'diagnosis' in DB
    // No doctor_id or clinical_notes column exists in your prescription table
    const [result] = await connection.execute(
      `INSERT INTO prescription (appointment_id, diagnosis) VALUES (?, ?)`,
      [Number(appointment_id), notes]
    );
    const prescriptionId = result.insertId;

    // 2. Insert each medicine into prescription_items
    if (Array.isArray(medicines) && medicines.length > 0) {
      for (const med of medicines) {
        await connection.execute(
          `INSERT INTO prescription_items (prescription_id, medicine_id, dosage_instruction) VALUES (?, ?, ?)`,
          [prescriptionId, Number(med.medicine_id), med.dosage]
        );
      }
    }

    await connection.commit();
    return NextResponse.json({ success: true, prescription_id: prescriptionId });

  } catch (error) {
    await connection.rollback();
    console.error("Prescription Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}