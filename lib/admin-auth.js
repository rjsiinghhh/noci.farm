import crypto from 'crypto';
import { NextResponse } from 'next/server';

// Server-side admin session: an HMAC-signed, HTTP-only cookie issued on login.
// This is the real auth gate for /api/admin/* — the client localStorage flag in
// app/admin/layout.js only controls UI rendering and protects nothing.
const SESSION_SECRET =
  process.env.ADMIN_SECRET_KEY || 'default-secret-change-in-production';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const ADMIN_SESSION_COOKIE = 'admin_session';

export const ADMIN_SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_TTL_MS / 1000,
};

const sign = payloadString =>
  crypto.createHmac('sha256', SESSION_SECRET).update(payloadString).digest('hex');

export const createAdminSessionToken = () => {
  const payload = { role: 'admin', ts: Date.now() };
  const token = { payload, signature: sign(JSON.stringify(payload)) };
  return Buffer.from(JSON.stringify(token)).toString('base64url');
};

export const verifyAdminSessionToken = token => {
  if (!token) return false;
  try {
    const decoded = JSON.parse(
      Buffer.from(token, 'base64url').toString('utf-8'),
    );
    const { payload, signature } = decoded || {};
    if (!payload || !signature || payload.role !== 'admin') return false;

    const expected = sign(JSON.stringify(payload));
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

    if (Date.now() - (payload.ts || 0) > SESSION_TTL_MS) return false;
    return true;
  } catch {
    return false;
  }
};

// Returns null when the request carries a valid admin session, or a 401
// NextResponse to return immediately when it does not.
export const requireAdmin = request => {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (verifyAdminSessionToken(token)) return null;
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
};
