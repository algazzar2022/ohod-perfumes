import { NextRequest, NextResponse } from 'next/server';
import { getDbAsync, saveDbAsync } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDbAsync();
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
    const auth = await requireAdmin(req, 'products');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await req.json();
    const db = await getDbAsync();
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
      stockQuantity: body.stockQuantity !== undefined ? Number(body.stockQuantity) : (existing.stockQuantity ?? 50),
      sizes: body.sizes !== undefined ? (Array.isArray(body.sizes) ? body.sizes : undefined) : existing.sizes,
      updatedAt: new Date().toISOString()
    };

    db.products[index] = updated;
    await saveDbAsync(db);

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
    const auth = await requireAdmin(req, 'products');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const db = await getDbAsync();
    const numId = Number(id);
    const initialLen = db.products.length;

    db.products = db.products.filter(p => p.id !== numId);
    if (db.products.length === initialLen) {
      return NextResponse.json({ success: false, error: 'المنتج غير موجود' }, { status: 404 });
    }

    await saveDbAsync(db);
    return NextResponse.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
