import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT 
        medicine_id as id, 
        name, 
        category, 
        price_per_unit,
        stock_quantity as stock, 
        reorder_level 
      FROM medicine 
      ORDER BY name
    `);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, category, price_per_unit, stock_quantity, reorder_level } = await request.json();
    const [result] = await db.execute(
      'INSERT INTO medicine (name, category, price_per_unit, stock_quantity, reorder_level) VALUES (?, ?, ?, ?, ?)',
      [name, category, Number(price_per_unit), Number(stock_quantity), Number(reorder_level || 20)]
    );
    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, name, category, price_per_unit, stock_quantity, reorder_level } = await request.json();

    // Always update name/category/price/reorder
    // Only ADD to stock if stock_quantity was provided and is > 0
    if (stock_quantity && Number(stock_quantity) > 0) {
      await db.execute(
        `UPDATE medicine 
         SET name=?, category=?, price_per_unit=?, 
             stock_quantity = stock_quantity + ?, 
             reorder_level=? 
         WHERE medicine_id=?`,
        [name, category, Number(price_per_unit), Number(stock_quantity), Number(reorder_level), Number(id)]
      );
    } else {
      await db.execute(
        `UPDATE medicine 
         SET name=?, category=?, price_per_unit=?, reorder_level=? 
         WHERE medicine_id=?`,
        [name, category, Number(price_per_unit), Number(reorder_level), Number(id)]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    await db.execute('DELETE FROM medicine WHERE medicine_id = ?', [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}