import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Get patient_id from user_id
    const [patientRows] = await db.execute(
      'SELECT patient_id FROM patient WHERE user_id = ?',
      [userId]
    );

    if (!patientRows || patientRows.length === 0) {
      return NextResponse.json([]);
    }

    const patientId = patientRows[0].patient_id;

    const [rows] = await db.execute(`
      SELECT 
        pr.prescription_id,
        pr.appointment_id,
        pr.diagnosis,
        pr.created_at,
        d.name as doctor_name,
        d.specialization,
        pi.medicine_id,
        pi.dosage_instruction,
        m.name as medicine_name,
        m.category,
        m.price_per_unit
      FROM prescription pr
      JOIN appointment a ON pr.appointment_id = a.appointment_id
      JOIN doctor d ON a.doctor_id = d.doctor_id
      LEFT JOIN prescription_items pi ON pr.prescription_id = pi.prescription_id
      LEFT JOIN medicine m ON pi.medicine_id = m.medicine_id
      WHERE a.patient_id = ?
      ORDER BY pr.created_at DESC
    `, [patientId]);

    // Group medicines under each prescription
    const prescriptionsMap = {};
    rows.forEach(row => {
      if (!prescriptionsMap[row.prescription_id]) {
        prescriptionsMap[row.prescription_id] = {
          prescription_id: row.prescription_id,
          appointment_id: row.appointment_id,
          diagnosis: row.diagnosis,
          created_at: row.created_at,
          doctor_name: row.doctor_name,
          specialization: row.specialization,
          medicines: []
        };
      }
      if (row.medicine_id) {
        prescriptionsMap[row.prescription_id].medicines.push({
          medicine_id: row.medicine_id,
          medicine_name: row.medicine_name,
          dosage_instruction: row.dosage_instruction,
          category: row.category,
          price_per_unit: row.price_per_unit
        });
      }
    });

    return NextResponse.json(Object.values(prescriptionsMap));
  } catch (error) {
    console.error("Prescriptions Fetch Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}