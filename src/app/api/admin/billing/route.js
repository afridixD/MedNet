import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [invoices] = await db.execute(`
      SELECT 
        i.invoice_id,
        i.appointment_id,
        i.patient_id,
        p.name as patient_name,
        i.consultation_total,
        i.medicine_total,
        i.grand_total,
        i.payment_status,
        i.issued_at,
        COALESCE(d2.name, d1.name) as doctor_name,
        a.appointment_date
      FROM invoice i
      LEFT JOIN patient p ON i.patient_id = p.patient_id
      LEFT JOIN appointment a ON i.appointment_id = a.appointment_id
      LEFT JOIN doctor d1 ON a.doctor_id = d1.doctor_id
      LEFT JOIN doctor d2 ON i.doctor_id = d2.doctor_id
      ORDER BY i.issued_at DESC
    `);
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // ── ADMIN MANUAL INVOICE (no appointment needed) ──────────────────────
    if (body.patientId && body.doctorId !== undefined) {
      const { patientId, doctorId, items = [], consultFee, medicineTot, grandTotal } = body;

      // Look up the real patient_id from user_id
      const [[patientRow]] = await db.execute(
        `SELECT patient_id FROM patient WHERE user_id = ?`,
        [Number(patientId)]
      );

      if (!patientRow) {
        return NextResponse.json({ error: 'Patient not found in patient table' }, { status: 400 });
      }

      const realPatientId = patientRow.patient_id;

      const [result] = await db.execute(
        `INSERT INTO invoice 
           (patient_id, doctor_id, consultation_total, medicine_total, grand_total, payment_status)
         VALUES (?, ?, ?, ?, ?, 'Unpaid')`,
        [realPatientId, Number(doctorId), Number(consultFee), Number(medicineTot), Number(grandTotal)]
      );

      const invoiceId = result.insertId;

      // Deduct stock for each medicine item
      for (const item of items) {
        await db.execute(
          `UPDATE medicine SET stock_quantity = stock_quantity - ? WHERE medicine_id = ? AND stock_quantity >= ?`,
          [Number(item.qty), Number(item.id), Number(item.qty)]
        );
      }

      return NextResponse.json({ success: true, invoice_id: invoiceId, grand_total: grandTotal });
    }

    // ── APPOINTMENT-BASED INVOICE (existing flow) ─────────────────────────
    const { appointment_id } = body;
    const [[appt]] = await db.execute(`
      SELECT a.appointment_id, a.patient_id, a.doctor_id, d.consultation_fee
      FROM appointment a
      JOIN doctor d ON a.doctor_id = d.doctor_id
      WHERE a.appointment_id = ?
    `, [Number(appointment_id)]);

    if (!appt) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });

    const [[medTotal]] = await db.execute(`
      SELECT COALESCE(SUM(m.price_per_unit * pi.quantity_prescribed), 0) as medicine_total
      FROM prescription pr
      JOIN prescription_items pi ON pr.prescription_id = pi.prescription_id
      JOIN medicine m ON pi.medicine_id = m.medicine_id
      WHERE pr.appointment_id = ?
    `, [Number(appointment_id)]);

    const consultation_total = Number(appt.consultation_fee);
    const medicine_total = Number(medTotal.medicine_total);
    const grand_total = consultation_total + medicine_total;

    await db.execute(
      `INSERT INTO invoice (appointment_id, patient_id, consultation_total, medicine_total, grand_total, payment_status)
       VALUES (?, ?, ?, ?, ?, 'Unpaid')
       ON DUPLICATE KEY UPDATE 
         consultation_total=VALUES(consultation_total), 
         medicine_total=VALUES(medicine_total), 
         grand_total=VALUES(grand_total)`,
      [Number(appointment_id), Number(appt.patient_id), consultation_total, medicine_total, grand_total]
    );

    return NextResponse.json({ success: true, grand_total, consultation_total, medicine_total });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { invoice_id, payment_status } = await request.json();
    await db.execute(
      'UPDATE invoice SET payment_status = ? WHERE invoice_id = ?',
      [payment_status, Number(invoice_id)]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}