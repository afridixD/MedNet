import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // 1. Get the URL from the request
    const { searchParams } = new URL(request.url);
    
    // 2. Look for 'userId'. If missing, default to 1 for testing.
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