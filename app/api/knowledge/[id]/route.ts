import { NextRequest, NextResponse } from 'next/server';
import { runAsync, getAsync } from '@/lib/sqlite';
import { ADMIN_SESSIONS } from '@/lib/admin-auth';

// Validate redirect URL - only allow internal routes
function isValidRedirectUrl(url: string): boolean {
  try {
    if (!url) return false;
    if (url.startsWith('/')) return true;
    if (!url.includes('://') && !url.includes('http')) return true;
    return false;
  } catch {
    return false;
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = request.headers.get('authorization') || '';
    const token = auth.replace('Bearer ', '') || null;
    if (!token || !ADMIN_SESSIONS.has(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const question = (body.question || '').toString().trim();
    const answer = (body.answer || '').toString().trim();
    const keywords = (body.keywords || '').toString().trim();
    const department = (body.department || 'General').toString().trim();
    const responseType = (body.response_type || 'text').toString().trim();
    const redirectUrl = (body.redirect_url || '').toString().trim();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }
    if (!keywords) {
      return NextResponse.json({ error: 'At least one keyword is required' }, { status: 400 });
    }

    // Validate response_type
    if (!['text', 'redirect'].includes(responseType)) {
      return NextResponse.json({ error: 'Invalid response_type' }, { status: 400 });
    }

    // Validate based on response_type
    if (responseType === 'text' && !answer) {
      return NextResponse.json({ error: 'Answer is required for text response' }, { status: 400 });
    }
    if (responseType === 'redirect') {
      if (!redirectUrl) {
        return NextResponse.json({ error: 'Redirect URL is required' }, { status: 400 });
      }
      if (!isValidRedirectUrl(redirectUrl)) {
        return NextResponse.json({ error: 'Invalid redirect URL. Only internal routes are allowed.' }, { status: 400 });
      }
    }

    const existing = await getAsync('SELECT * FROM knowledge_base WHERE id = ?', [parseInt(id)]);
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const normalizedKeywords = keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0).join(',');

    await runAsync('UPDATE knowledge_base SET question = ?, answer = ?, keywords = ?, department = ?, response_type = ?, redirect_url = ? WHERE id = ?', [
      question,
      responseType === 'text' ? answer : null,
      normalizedKeywords,
      department,
      responseType,
      responseType === 'redirect' ? redirectUrl : null,
      parseInt(id)
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating knowledge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = request.headers.get('authorization') || '';
    const token = auth.replace('Bearer ', '') || null;
    if (!token || !ADMIN_SESSIONS.has(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getAsync('SELECT * FROM knowledge_base WHERE id = ?', [parseInt(id)]);
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await runAsync('DELETE FROM knowledge_base WHERE id = ?', [parseInt(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting knowledge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
