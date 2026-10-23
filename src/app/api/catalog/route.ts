import { NextResponse } from 'next/server';
import { getDbAsync } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDbAsync();
    return NextResponse.json({
      success: true,
      products: db.products,
      categories: db.categories,
      governorates: db.governorates,
      settings: db.settings
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
