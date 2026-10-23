import { NextRequest, NextResponse } from 'next/server';
import { getDbAsync } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    const db = await getDbAsync();
    const cleanUsername = String(username).trim().toLowerCase();
    const admin = db.admins.find(
      (a) => a.username.toLowerCase() === cleanUsername
    );

    if (!admin || !verifyPassword(String(password), admin.passwordHash)) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role || 'all',
        permissions: Array.isArray(admin.permissions) ? admin.permissions : ['orders']
      }
    });

    // Set secure auth cookie
    const token = `admin_${admin.id}_${Date.now()}`;
    response.cookies.set('admin_session', token, {
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
