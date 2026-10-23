import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    // Exclude password hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { adminPasswordHash, ...safeSettings } = db.settings;
    return NextResponse.json({ success: true, settings: safeSettings });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDb();

    db.settings = {
      ...db.settings,
      ...body
    };

    saveDb(db);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { adminPasswordHash, ...safeSettings } = db.settings;
    return NextResponse.json({ success: true, settings: safeSettings });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
