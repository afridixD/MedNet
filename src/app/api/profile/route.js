import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 1; 

    const [rows] = await db.execute(`
      SELECT 
        p.user_id as userId,
        p.name, 
        u.email, 
        p.date_of_birth as dob, 
        p.weight, 
        p.height, 
        p.gender, 
        p.blood_group as bloodGroup, 
        p.address, 
        p.phone 
      FROM Patient p
      JOIN User_Account u ON p.user_id = u.user_id
      WHERE p.user_id = ? 
    `, [userId]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "No user found with ID " + userId }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { userId, name, email, phone, dob, weight, height } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 1. Update the Patient table (name, phone, dob, weight, height)
    const patientQuery = `
      UPDATE Patient 
      SET name = ?, phone = ?, date_of_birth = ?, weight = ?, height = ?
      WHERE user_id = ?
    `;
    const patientValues = [name, phone, dob, weight, height, userId];

    // 2. Update the User_Account table (email)
    const accountQuery = `
      UPDATE User_Account 
      SET email = ?
      WHERE user_id = ?
    `;
    const accountValues = [email, userId];

    // Execute both updates
    await db.execute(patientQuery, patientValues);
    await db.execute(accountQuery, accountValues);

    return NextResponse.json({ message: "Profile updated successfully" });

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}