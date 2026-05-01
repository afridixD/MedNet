import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const connection = await db.getConnection();
  try {
    const { appointmentId, userId, notes, medicines } = await request.json();
    await connection.beginTransaction();

    // 1. Find Doctor ID
    const [docRows] = await connection.execute('SELECT doctor_id FROM doctor WHERE user_id = ?', [userId]);
    const doctorId = docRows[0].doctor_id;

    // 2. Create Prescription
    const [result] = await connection.execute(
      `INSERT INTO prescription (appointment_id, doctor_id, clinical_notes, issued_date) 
       VALUES (?, ?, ?, NOW())`,
      [appointmentId, doctorId, notes]
    );
    const prescriptionId = result.insertId;

    // 3. Add Medicines and Update Admin Inventory
    for (const med of medicines) {
      await connection.execute(
        `INSERT INTO prescription_items (prescription_id, medicine_id, dosage) VALUES (?, ?, ?)`,
        [prescriptionId, med.id, med.dosage]
      );
      await connection.execute(`UPDATE inventory SET stock = stock - 1 WHERE id = ?`, [med.id]);
    }

    await connection.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    await connection.rollback();
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}