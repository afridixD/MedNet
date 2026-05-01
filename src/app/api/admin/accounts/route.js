import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [rows] = await db.execute(
      'SELECT user_id as id, username as name, email, role, created_at FROM user_account ORDER BY created_at DESC'
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { username, email, password, role } = await request.json();
    const [result] = await db.execute(
      'INSERT INTO user_account (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, password, role]
    );
    const userId = result.insertId;

    if (role === 'Doctor') {
      await db.execute(
        'INSERT INTO doctor (user_id, name, specialization, consultation_fee) VALUES (?, ?, ?, ?)',
        [userId, username, 'General', 0]
      );
    }
    if (role === 'Assistant') {
      await db.execute(
        'INSERT INTO assistant (user_id, name) VALUES (?, ?)',
        [userId, username]
      );
    }

    return NextResponse.json({ success: true, id: userId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await db.execute('DELETE FROM user_account WHERE user_id = ?', [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}