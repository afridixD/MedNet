import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {

    const body = await request.json();
    const { fullName, username, email, password } = body;

    const [userResult] = await db.execute(
      'INSERT INTO User_Account (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, password, 'Patient']
    );

    const newUserId = userResult.insertId;

    await db.execute(
      'INSERT INTO Patient (user_id, name) VALUES (?, ?)',
      [newUserId, fullName]
    );

    return NextResponse.json({ 
      userId: newUserId, 
      message: "Account created successfully" 
    });

  } catch (error) {
    console.error("Registration Error:", error);
    
    return NextResponse.json(
      { error: "Could not create account. Username or Email might already exist." }, 
      { status: 500 }
    );
  }
}