import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { getDbAsync, AdminTab, AdminUser, ALL_ADMIN_PERMISSIONS } from '@/lib/db';

const SESSION_SECRET = process.env.SESSION_SECRET || 'ohod_perfumes_super_secret_auth_key_2026_x87123';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AdminSessionPayload {
  adminId: string;
  username: string;
  exp: number;
}

/**
 * Sign a session payload into a cryptographically secured HMAC-SHA256 token.
 */
export function signSessionToken(payload: Omit<AdminSessionPayload, 'exp'>, customDurationMs?: number): string {
  const fullPayload: AdminSessionPayload = {
    ...payload,
    exp: Date.now() + (customDurationMs || SESSION_DURATION_MS),
  };
  const data = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Verify HMAC-SHA256 session token signature and check expiration using constant-time comparison.
 */
export function verifySessionToken(token: string): AdminSessionPayload | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }
  const [data, signature] = token.split('.');
  if (!data || !signature) {
    return null;
  }
  const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  if (signature.length !== expectedSignature.length) {
    return null;
  }
  const match = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  if (!match) {
    return null;
  }

  try {
    const payload: AdminSessionPayload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Helper to strictly authenticate and authorize admin API requests.
 */
export type AuthResult = 
  | { success: true; user: AdminUser }
  | { success: false; error: string; status: number };

export async function requireAdmin(
  req: NextRequest,
  requiredPermission?: AdminTab
): Promise<AuthResult> {
  const sessionCookie = req.cookies.get('admin_session')?.value;
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = sessionCookie || bearerToken;

  if (!token) {
    return { success: false, error: 'غير مصرح: يجب تسجيل الدخول أولاً', status: 401 };
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return { success: false, error: 'انتهت صلاحية الجلسة أو غير صالحة، يرجى تسجيل الدخول مجدداً', status: 401 };
  }

  const db = await getDbAsync();
  const admin = db.admins.find((a) => a.id === payload.adminId && a.username.toLowerCase() === payload.username.toLowerCase());
  if (!admin) {
    return { success: false, error: 'حساب المشرف غير موجود أو تم حذفه', status: 401 };
  }

  if (requiredPermission) {
    const isSuperAdmin = admin.role === 'all' || (admin.permissions && admin.permissions.length === ALL_ADMIN_PERMISSIONS.length);
    const hasPerm = isSuperAdmin || (Array.isArray(admin.permissions) && admin.permissions.includes(requiredPermission));
    if (!hasPerm) {
      return { success: false, error: `ليس لديك صلاحية الوصول إلى قسم (${requiredPermission})`, status: 403 };
    }
  }

  return { success: true, user: admin };
}

/**
 * Hash password using PBKDF2 with SHA-512 and a secure 16-byte random salt.
 * Result format: "<salt_hex>:<hash_hex>"
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a plain password against the stored "<salt>:<hash>" string.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) {
    return false;
  }
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) {
    return false;
  }
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
}
