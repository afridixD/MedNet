import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT 
        a.appointment_id, 
        d.name as doctor_name, 
        d.specialization, 
        a.appointment_date, 
        a.status 
      FROM Appointment a
      JOIN Doctor d ON a.doctor_id = d.doctor_id
    `);

    return Response.json(rows);
  } catch (error) {
    console.error(error);
    return Response.json([]); 
  }
}