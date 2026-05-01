import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [[patientCount]] = await db.execute(
      `SELECT COUNT(*) as count FROM patient`
    );
    const [[doctorCount]] = await db.execute(
      `SELECT COUNT(*) as count FROM doctor`
    );
    const [[assistantCount]] = await db.execute(
      `SELECT COUNT(*) as count FROM assistant`
    );
    const [[revenueData]] = await db.execute(
      `SELECT COALESCE(SUM(grand_total), 0) as total_revenue FROM invoice WHERE payment_status = 'Paid'`
    );
    const [[paidCount]] = await db.execute(
      `SELECT COUNT(*) as count FROM invoice WHERE payment_status = 'Paid'`
    );
    const [[unpaidCount]] = await db.execute(
      `SELECT COUNT(*) as count FROM invoice WHERE payment_status = 'Unpaid'`
    );

    return NextResponse.json({
      patients: Number(patientCount.count),
      doctors: Number(doctorCount.count),
      assistants: Number(assistantCount.count),
      total_revenue: Number(revenueData.total_revenue),
      paid_invoices: Number(paidCount.count),
      unpaid_invoices: Number(unpaidCount.count),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}