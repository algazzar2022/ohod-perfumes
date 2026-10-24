import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: auth.user.id,
        username: auth.user.username,
        name: auth.user.name,
        role: auth.user.role || 'all',
        permissions: Array.isArray(auth.user.permissions) ? auth.user.permissions : ['orders']
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
