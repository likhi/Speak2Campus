import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSIONS } from '@/lib/admin-auth';

// In-memory session storage (replace with database in production)
const SESSIONS = new Map<string, { email: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    const session = ADMIN_SESSIONS.get(token);

    if (!session) {
      return NextResponse.json(
        { valid: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (session.expiresAt < Date.now()) {
      ADMIN_SESSIONS.delete(token);
      return NextResponse.json(
        { valid: false, error: 'Token expired' },
        { status: 401 }
      );
    }

    return NextResponse.json({ valid: true, email: session.email });
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export function POST_HANDLER(request: NextRequest) {
  // Handle logout
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (token) {
    ADMIN_SESSIONS.delete(token);
  }
  return NextResponse.json({ success: true });
}
