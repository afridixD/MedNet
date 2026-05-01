import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Get all medicine stock levels
export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT 
        medicine_id as id, 
        name, 
        category, 
        stock_quantity as stock 
      FROM medicine
    `);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete a medicine resource
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await db.execute('DELETE FROM medicine WHERE medicine_id = ?', [id]);
    return NextResponse.json({ message: "Resource deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}