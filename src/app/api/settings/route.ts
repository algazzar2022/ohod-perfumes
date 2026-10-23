import { NextRequest, NextResponse } from 'next/server';
import { getDbAsync, saveDbAsync } from '@/lib/db';
import { revalidatePath } from 'next/cache';

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
    const body = await req.json();
    const db = await getDbAsync();

    db.settings = {
      ...db.settings,
      ...body
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
