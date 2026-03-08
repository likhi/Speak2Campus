import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { ADMIN_USERS, ADMIN_SESSIONS, hashPassword } from '@/lib/admin-auth';

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = ADMIN_USERS.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const passwordHash = hashPassword(password);
    if (passwordHash !== user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate session token
    const token = generateSessionToken();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    ADMIN_SESSIONS.set(token, { email: user.email, expiresAt });

    return NextResponse.json(
      {
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name },
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': `adminToken=${token}; Path=/; HttpOnly; Max-Age=${24 * 60 * 60}`,
        },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
