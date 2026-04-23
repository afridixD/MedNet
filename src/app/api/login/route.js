// src/app/api/login/route.js
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { email, password } = await request.json();

  try {
    // 1. Check if the user exists in the User_Account table
    const [users] = await db.execute(
      'SELECT * FROM User_Account WHERE email = ? AND password_hash = ?',
      [email, password] // In a real app, use bcrypt to hash passwords!
    );

    if (users.length > 0) {
      return NextResponse.json({ success: true, user: users[0] });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}