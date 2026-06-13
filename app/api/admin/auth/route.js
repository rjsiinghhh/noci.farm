import crypto from 'crypto';
import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_COOKIE_OPTIONS,
  createAdminSessionToken,
} from '@/lib/admin-auth';

export async function POST(request) {
  try {
    const { secret } = await request.json();

    const adminSecret = process.env.ADMIN_SECRET_KEY;

    if (!adminSecret) {
      console.error('ADMIN_SECRET_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Admin authentication not configured' },
        { status: 500 }
      );
    }

    // Constant-time comparison to avoid leaking the secret via timing.
    const provided = Buffer.from(String(secret ?? ''));
    const expected = Buffer.from(adminSecret);
    const secretMatches =
      provided.length === expected.length &&
      crypto.timingSafeEqual(provided, expected);

    if (secretMatches) {
      const response = NextResponse.json({ success: true });
      response.cookies.set(
        ADMIN_SESSION_COOKIE,
        createAdminSessionToken(),
        ADMIN_SESSION_COOKIE_OPTIONS,
      );
      return response;
    } else {
      return NextResponse.json(
        { error: 'Invalid admin secret' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}

// Logout: clear the admin session cookie.
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    ...ADMIN_SESSION_COOKIE_OPTIONS,
    maxAge: 0,
  });
  return response;
}





