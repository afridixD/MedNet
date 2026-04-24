import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // 1. Extract the identifier (Email/Username) and password from the request
    const { identifier, password } = await request.json();

    // 2. Query the database
    // This checks if the input matches EITHER the email column OR the username column
    const [users] = await db.execute(
      'SELECT * FROM User_Account WHERE (email = ? OR username = ?) AND password_hash = ?',
      [identifier, identifier, password]
    );

    // 3. Logic for matching user
    if (users.length > 0) {
      const user = users[0];
      
      // We return success and basic user info (excluding the password for security)
      return NextResponse.json({ 
        success: true, 
        user: {
          id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role
        } 
      });
    } else {
      // 4. Return unauthorized if no match is found
      return NextResponse.json(
        { success: false, message: 'Invalid username/email or password' }, 
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}