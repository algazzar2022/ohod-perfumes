import { NextRequest, NextResponse } from 'next/server';
import { getDbAsync, saveDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const db = await getDbAsync();
    return NextResponse.json({ success: true, governorates: db.governorates });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAdmin(req, 'shipping');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const db = await getDbAsync();

    if (Array.isArray(body)) {
      // Bulk update
      db.governorates = body;
    } else if (body.id !== undefined && body.shippingFee !== undefined) {
      const idx = db.governorates.findIndex(g => g.id === Number(body.id));
      if (idx !== -1) {
        db.governorates[idx].shippingFee = Number(body.shippingFee);
      }
    }

    saveDb(db);
    return NextResponse.json({ success: true, governorates: db.governorates });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
