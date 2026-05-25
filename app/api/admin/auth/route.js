import { NextResponse } from 'next/server';

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

    if (secret === adminSecret) {
      return NextResponse.json({ success: true });
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





