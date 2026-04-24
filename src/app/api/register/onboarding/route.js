import { db } from '@/lib/db';

export async function POST(request) {
  try {
    const { userId, height, weight, dob, bloodGroup, gender } = await request.json();

    await db.execute(
      `UPDATE Patient 
       SET height = ?, weight = ?, date_of_birth = ?, blood_group = ?, gender = ? 
       WHERE user_id = ?`,
      [height, weight, dob, bloodGroup, gender, userId]
    );

    return Response.json({ message: "Onboarding successful" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}