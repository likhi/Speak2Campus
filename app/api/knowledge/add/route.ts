import { NextRequest, NextResponse } from 'next/server';
import { runAsync } from '@/lib/sqlite';
import { ADMIN_SESSIONS } from '@/lib/admin-auth';

// Validate redirect URL - only allow internal routes
function isValidRedirectUrl(url: string): boolean {
  try {
    if (!url) return false;
    // Allow relative paths starting with / (internal routes)
    if (url.startsWith('/')) return true;
    // Allow relative paths without protocol
    if (!url.includes('://') && !url.includes('http')) return true;
    return false;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Simple admin check
    const auth = request.headers.get('authorization') || '';
    const token = auth.replace('Bearer ', '') || null;
    if (!token || !ADMIN_SESSIONS.has(token)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    // Safe destructure and trim
    const question = (body.question ?? '').toString().trim();
    const answer = (body.answer ?? '').toString().trim();
    const keywords = (body.keywords ?? '').toString().trim();
    const department = (body.department ?? 'General').toString().trim();
    const responseType = (body.response_type ?? 'text').toString().trim();
    const redirectUrl = (body.redirect_url ?? '').toString().trim();

    // Validation
    if (!question || !keywords) {
      return NextResponse.json({ success: false, message: 'Validation failed' }, { status: 400 });
    }
    if (!['text', 'redirect'].includes(responseType)) {
      return NextResponse.json({ success: false, message: 'Validation failed' }, { status: 400 });
    }
    if (responseType === 'text') {
      if (!answer) {
        return NextResponse.json({ success: false, message: 'Validation failed' }, { status: 400 });
      }
    }
    if (responseType === 'redirect') {
      if (!redirectUrl) {
        return NextResponse.json({ success: false, message: 'Validation failed' }, { status: 400 });
      }
      if (!isValidRedirectUrl(redirectUrl)) {
        return NextResponse.json({ success: false, message: 'Validation failed' }, { status: 400 });
      }
    }

    // Sanitize keywords
    const normalizedKeywords = keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0).join(',');


    // Always store null for empty string for answer and redirect_url
    const safeAnswer = (responseType === 'text' && answer.trim() !== '') ? answer : null;
    const safeRedirectUrl = (responseType === 'redirect' && redirectUrl.trim() !== '') ? redirectUrl : null;

    const res = await runAsync(
      'INSERT INTO knowledge_base (question, answer, keywords, department, response_type, redirect_url) VALUES (?, ?, ?, ?, ?, ?)',
      [
        question,
        safeAnswer,
        normalizedKeywords,
        department,
        responseType,
        safeRedirectUrl
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Knowledge saved successfully'
    });
  } catch (error: any) {
    console.error('Error adding knowledge:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error',
      error: error.message || String(error)
    }, { status: 500 });
  }
}

