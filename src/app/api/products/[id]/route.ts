import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const product = db.products.find(p => p.id === Number(id));

    if (!product) {
      return NextResponse.json({ success: false, error: 'المنتج غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const db = getDb();
    const index = db.products.findIndex(p => p.id === Number(id));

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'المنتج غير موجود' }, { status: 404 });
    }

    const existing = db.products[index];
    const updated = {
      ...existing,
      ...body,
      id: existing.id,
      price: body.price !== undefined ? Number(body.price) : existing.price,
      priceAfterDiscount: body.priceAfterDiscount !== undefined ? Number(body.priceAfterDiscount) : existing.priceAfterDiscount,
      categoryId: body.categoryId !== undefined ? Number(body.categoryId) : existing.categoryId,
      available: body.available !== undefined ? Boolean(body.available) : existing.available,
      inStock: body.inStock !== undefined ? Boolean(body.inStock) : existing.inStock,
      updatedAt: new Date().toISOString()
    };

    db.products[index] = updated;
    saveDb(db);

    return NextResponse.json({ success: true, product: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const numId = Number(id);
    const initialLen = db.products.length;

    db.products = db.products.filter(p => p.id !== numId);
    if (db.products.length === initialLen) {
      return NextResponse.json({ success: false, error: 'المنتج غير موجود' }, { status: 404 });
    }

    saveDb(db);
    return NextResponse.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
