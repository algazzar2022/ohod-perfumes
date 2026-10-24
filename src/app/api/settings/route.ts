import { NextRequest, NextResponse } from 'next/server';
import { getDbAsync, saveDbAsync } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const db = await getDbAsync();
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
    const auth = await requireAdmin(req, 'settings');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const db = await getDbAsync();

    // Prevent mass assignment / overwrite of critical password hashes
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { adminPasswordHash: _ignored, ...safeBody } = body;

    db.settings = {
      ...db.settings,
      ...safeBody
    };

    await saveDbAsync(db);

    try {
      revalidatePath('/', 'page');
      revalidatePath('/', 'layout');
      revalidatePath('/sitemap.xml');
      revalidatePath('/robots.txt');
    } catch (e) {
      console.warn('Cache revalidation warning:', e);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { adminPasswordHash, ...safeSettings } = db.settings;
    return NextResponse.json({ success: true, settings: safeSettings });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
