import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(req, 'categories');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await req.json();
    const db = getDb();
    const index = db.categories.findIndex(c => c.id === Number(id));

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'الفئة غير موجودة' }, { status: 404 });
    }

    db.categories[index] = {
      ...db.categories[index],
      nameAr: body.nameAr ? body.nameAr.trim() : db.categories[index].nameAr,
      nameEn: body.nameEn !== undefined ? body.nameEn : db.categories[index].nameEn,
      icon: body.icon !== undefined ? body.icon : db.categories[index].icon
    };

    saveDb(db);
    return NextResponse.json({ success: true, category: db.categories[index] });
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
    const auth = await requireAdmin(req, 'categories');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const db = getDb();
    const numId = Number(id);

    const initialLen = db.categories.length;
    db.categories = db.categories.filter(c => c.id !== numId);

    if (db.categories.length === initialLen) {
      return NextResponse.json({ success: false, error: 'الفئة غير موجودة' }, { status: 404 });
    }

    saveDb(db);
    return NextResponse.json({ success: true, message: 'تم حذف الفئة بنجاح' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
