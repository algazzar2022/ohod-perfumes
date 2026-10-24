import { NextRequest, NextResponse } from 'next/server';
import { getDbAsync, saveDb, AdminUser, AdminTab, ALL_ADMIN_PERMISSIONS } from '@/lib/db';
import { hashPassword, requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req, 'admins');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const db = await getDbAsync();
    // Exclude password hashes from response
    const safeAdmins = db.admins.map((a) => ({
      id: a.id,
      username: a.username,
      name: a.name,
      role: a.role || 'all',
      permissions: Array.isArray(a.permissions) && a.permissions.length > 0
        ? a.permissions
        : (a.role === 'orders_only' ? ['orders'] : ALL_ADMIN_PERMISSIONS),
      createdAt: a.createdAt
    }));
    return NextResponse.json({ success: true, admins: safeAdmins });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req, 'admins');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { username, name, password, permissions } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim().toLowerCase();
    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم يجب أن يكون ٣ أحرف على الأقل' },
        { status: 400 }
      );
    }

    if (String(password).length < 4) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور يجب أن تكون ٤ خانات على الأقل' },
        { status: 400 }
      );
    }

    const db = await getDbAsync();
    const exists = db.admins.some(
      (a) => a.username.toLowerCase() === cleanUsername
    );
    if (exists) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم هذا مسجل بالفعل لمشرف آخر' },
        { status: 400 }
      );
    }

    const validPermissions: AdminTab[] = Array.isArray(permissions) && permissions.length > 0
      ? permissions
      : ['orders'];

    const role = validPermissions.length >= ALL_ADMIN_PERMISSIONS.length ? 'all' : 'custom';

    const newAdmin: AdminUser = {
      id: 'admin-' + Date.now(),
      username: cleanUsername,
      name: String(name || cleanUsername).trim(),
      passwordHash: hashPassword(String(password)),
      role,
      permissions: validPermissions,
      createdAt: new Date().toISOString()
    };

    db.admins.push(newAdmin);
    saveDb(db);

    return NextResponse.json({
      success: true,
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        name: newAdmin.name,
        role: newAdmin.role,
        permissions: newAdmin.permissions,
        createdAt: newAdmin.createdAt
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdmin(req, 'admins');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'المعرف مطلوب' }, { status: 400 });
    }

    const db = await getDbAsync();
    if (db.admins.length <= 1) {
      return NextResponse.json(
        { success: false, error: 'لا يمكن حذف المشرف الأخير في النظام' },
        { status: 400 }
      );
    }

    const initialLen = db.admins.length;
    db.admins = db.admins.filter((a) => a.id !== id);

    if (db.admins.length === initialLen) {
      return NextResponse.json({ success: false, error: 'المشرف غير موجود' }, { status: 404 });
    }

    saveDb(db);
    return NextResponse.json({ success: true, message: 'تم حذف المشرف بنجاح' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAdmin(req, 'admins');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { id, name, password, permissions } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'المعرف مطلوب' }, { status: 400 });
    }

    const db = await getDbAsync();
    const index = db.admins.findIndex((a) => a.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'المشرف غير موجود' }, { status: 404 });
    }

    if (name) {
      db.admins[index].name = String(name).trim();
    }
    if (password && String(password).trim().length >= 4) {
      db.admins[index].passwordHash = hashPassword(String(password));
    }
    if (Array.isArray(permissions) && permissions.length > 0) {
      db.admins[index].permissions = permissions;
      db.admins[index].role = permissions.length >= ALL_ADMIN_PERMISSIONS.length ? 'all' : 'custom';
    }

    saveDb(db);
    return NextResponse.json({
      success: true,
      admin: {
        id: db.admins[index].id,
        username: db.admins[index].username,
        name: db.admins[index].name,
        role: db.admins[index].role || 'all',
        permissions: db.admins[index].permissions,
        createdAt: db.admins[index].createdAt
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
