import { NextRequest, NextResponse } from 'next/server';
import { getDbAsync, saveDbAsync } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDbAsync();
    const order = db.orders.find(o => o.id === id || o.orderNumber === id);

    if (!order) {
      return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
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
    const auth = await requireAdmin(req, 'orders');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await req.json();
    const db = await getDbAsync();
    const index = db.orders.findIndex(o => o.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 });
    }

    const oldStatus = db.orders[index].status;
    const newStatus = body.status;

    if (newStatus && newStatus !== oldStatus) {
      db.orders[index].status = newStatus;

      // If order is cancelled, return items to inventory
      if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
        for (const item of db.orders[index].items) {
          const prod = db.products.find(p => p.id === item.productId);
          if (prod) {
            prod.stockQuantity = (prod.stockQuantity ?? 0) + item.quantity;
            if (prod.stockQuantity > 0) {
              prod.inStock = true;
            }
            prod.updatedAt = new Date().toISOString();
          }
        }
      }
      // If order was cancelled and now re-activated
      else if (oldStatus === 'cancelled' && newStatus !== 'cancelled') {
        for (const item of db.orders[index].items) {
          const prod = db.products.find(p => p.id === item.productId);
          if (prod) {
            prod.stockQuantity = Math.max(0, (prod.stockQuantity ?? 50) - item.quantity);
            if (prod.stockQuantity === 0) {
              prod.inStock = false;
            }
            prod.updatedAt = new Date().toISOString();
          }
        }
      }
    }

    db.orders[index].updatedAt = new Date().toISOString();
    await saveDbAsync(db);

    try {
      revalidatePath('/', 'page');
      revalidatePath('/', 'layout');
    } catch {
      // Ignore
    }

    return NextResponse.json({ success: true, order: db.orders[index] });
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
    const auth = await requireAdmin(req, 'orders');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const db = await getDbAsync();
    const initialLen = db.orders.length;

    db.orders = db.orders.filter(o => o.id !== id);
    if (db.orders.length === initialLen) {
      return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 });
    }

    await saveDbAsync(db);
    return NextResponse.json({ success: true, message: 'تم حذف الطلب بنجاح' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
