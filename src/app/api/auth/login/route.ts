import { NextRequest, NextResponse } from 'next/server';
import { getDbAsync } from '@/lib/db';
import { verifyPassword, signSessionToken } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rateLimit = checkRateLimit(`login:${ip}`, 5, 5 * 60 * 1000); // 5 attempts per 5 minutes

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'تم تجاوز عدد محاولات الدخول المسموح بها. يرجى الانتظار ٥ دقائق والمحاولة مجدداً لأسباب أمنية.'
        },
        { status: 429 }
      );
    }

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

    // Generate cryptographically signed HMAC-SHA256 session token
    const token = signSessionToken({
      adminId: admin.id,
      username: admin.username,
    });

    // Set secure, httpOnly session cookie
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
