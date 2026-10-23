import { NextRequest, NextResponse } from 'next/server';
import { getDbAsync, saveDb, Category } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDbAsync();
    return NextResponse.json({ success: true, categories: db.categories });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await getDbAsync();

    if (!body.nameAr) {
      return NextResponse.json({ success: false, error: 'اسم الفئة مطلوب' }, { status: 400 });
    }

    const nextId = db.categories.length > 0 ? Math.max(...db.categories.map(c => c.id)) + 1 : 1;
    const newCategory: Category = {
      id: nextId,
      nameAr: body.nameAr.trim(),
      nameEn: body.nameEn?.trim() || null,
      icon: body.icon?.trim() || 'Sparkles'
    };

    db.categories.push(newCategory);
    saveDb(db);

    return NextResponse.json({ success: true, category: newCategory });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
