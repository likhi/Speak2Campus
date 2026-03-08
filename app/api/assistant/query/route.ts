import { NextRequest, NextResponse } from 'next/server';
import { allAsync, runAsync } from '@/lib/sqlite';

const FALLBACK = "I could not get you.. ask me other questions dear";

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface MatchResult {
  id: number | null;
  intentId: number | null;
  confidence: number;
  answer: string;
  response_type: string;
  redirect_url?: string;
  action_config?: any;
}

async function matchIntent(query: string): Promise<MatchResult | null> {
  const normalized = normalizeText(query);

  // ─── 1. Check intents table (priority-ordered) ────────────────────────────
  const intents: any[] = await allAsync(
    'SELECT * FROM intents WHERE is_active = 1 ORDER BY priority DESC'
  );

  let bestIntentMatch: any = null;
  let bestIntentScore = 0;

  for (const intent of intents) {
    let score = 0;

    // Exact match on variations
    try {
      const variations: string[] = JSON.parse(intent.variations || '[]');
      for (const v of variations) {
        const vNorm = normalizeText(v);
        if (normalized === vNorm) { score = 1.0; break; }
        if (normalized.includes(vNorm) || vNorm.includes(normalized)) { score = Math.max(score, 0.85); }
      }
    } catch { /* malformed json */ }

    // Keyword scoring
    if (score < 0.85) {
      const kws = (intent.keywords || '').split(',').map((k: string) => normalizeText(k)).filter(Boolean);
      let kwMatches = 0;
      for (const kw of kws) {
        if (kw && normalized.includes(kw)) kwMatches++;
      }
      if (kws.length > 0) {
        const kwScore = kwMatches / kws.length;
        score = Math.max(score, kwScore * 0.75);
      }
    }

    if (score > bestIntentScore && score > 0.1) {
      bestIntentScore = score;
      bestIntentMatch = intent;
    }
  }

  if (bestIntentMatch && bestIntentScore >= 0.3) {
    let cfg: any = {};
    try { cfg = JSON.parse(bestIntentMatch.action_config || '{}'); } catch { /* skip */ }

    if (bestIntentMatch.action_type === 'system') {
      return {
        id: null,
        intentId: bestIntentMatch.id,
        confidence: bestIntentScore,
        answer: cfg.message || 'System action executed.',
        response_type: 'system',
        action_config: cfg
      };
    }
    if (bestIntentMatch.action_type === 'redirect') {
      return {
        id: null,
        intentId: bestIntentMatch.id,
        confidence: bestIntentScore,
        answer: cfg.message || `Redirecting you now.`,
        response_type: 'redirect',
        redirect_url: cfg.url
      };
    }
    return {
      id: null,
      intentId: bestIntentMatch.id,
      confidence: bestIntentScore,
      answer: cfg.message || bestIntentMatch.intent_name,
      response_type: 'text'
    };
  }

  // ─── 2. Check knowledge_base (supports both old & new schema) ────────────
  const entries: any[] = await allAsync('SELECT * FROM knowledge_base ORDER BY COALESCE(priority,5) DESC');
  let bestKb: any = null;
  let bestKbScore = 0;

  for (const e of entries) {
    let score = 0;
    const matchMode: string = e.match_mode || 'contains';

    // ── New schema: intent + variations ──────────────────────────────────────
    const intentText: string = e.intent || e.question || '';
    const intentNorm = normalizeText(intentText);

    if (matchMode === 'exact') {
      if (normalized === intentNorm) score = 1.0;
    } else {
      if (normalized === intentNorm) { score = 1.0; }
      else if (normalized.includes(intentNorm) || intentNorm.includes(normalized)) { score = 0.8; }
    }

    // Check variations (new schema)
    if (score < 0.8) {
      try {
        const vars: string[] = JSON.parse(e.variations || '[]');
        for (const v of vars) {
          const vn = normalizeText(v);
          if (matchMode === 'exact') {
            if (normalized === vn) { score = Math.max(score, 1.0); break; }
          } else {
            if (normalized === vn) { score = Math.max(score, 1.0); break; }
            if (normalized.includes(vn) || vn.includes(normalized)) { score = Math.max(score, 0.85); }
          }
        }
      } catch { /* malformed json */ }
    }

    // Keyword scoring
    if (score < 0.8) {
      const kws = (e.keywords || '').split(',').map((k: string) => normalizeText(k)).filter(Boolean);
      let kwMatches = 0;
      for (const kw of kws) { if (kw && normalized.includes(kw)) kwMatches++; }
      if (kws.length > 0) score = Math.max(score, (kwMatches / kws.length) * 0.7);
    }

    if (score > bestKbScore && score > 0.1) {
      bestKbScore = score;
      bestKb = e;
    }
  }

  if (bestKb && bestKbScore >= 0.3) {
    // ── Resolve answer from new or old schema ─────────────────────────────
    let resolvedAnswer = FALLBACK;
    let resolvedType = 'text';
    let resolvedRedirect: string | undefined;

    // New schema
    if (bestKb.action_type) {
      resolvedType = bestKb.action_type;
      try {
        const cfg = JSON.parse(bestKb.action_config || '{}');
        if (resolvedType === 'text') {
          resolvedAnswer = cfg.message || FALLBACK;
        } else if (resolvedType === 'redirect') {
          resolvedRedirect = cfg.url;
          resolvedAnswer = `I'll take you to the right page now.`;
        }
      } catch { /* skip */ }
    } else {
      // Old schema fallback
      resolvedType = bestKb.response_type || 'text';
      resolvedAnswer = bestKb.answer || FALLBACK;
      resolvedRedirect = bestKb.redirect_url;
    }

    return {
      id: bestKb.id,
      intentId: null,
      confidence: bestKbScore,
      answer: resolvedAnswer,
      response_type: resolvedType,
      redirect_url: resolvedRedirect
    };
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = (body.query || '').toString().trim();
    const sessionId = (body.sessionId || '').toString().trim() || null;

    if (!query) {
      return NextResponse.json({ success: false, type: 'text', message: FALLBACK });
    }

    const match = await matchIntent(query);

    if (!match) {
      // Log unmatched
      await runAsync(
        'INSERT INTO assistant_logs (query, matched_answer_id, matched_intent_id, confidence, state, response_text, session_id) VALUES (?, NULL, NULL, 0, ?, ?, ?)',
        [query.toLowerCase(), 'PROCESSED', FALLBACK, sessionId]
      );
      return NextResponse.json({ success: false, type: 'text', message: FALLBACK });
    }

    // Log matched
    await runAsync(
      'INSERT INTO assistant_logs (query, matched_answer_id, matched_intent_id, confidence, state, response_text, session_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [query.toLowerCase(), match.id, match.intentId, match.confidence, 'PROCESSED', match.answer, sessionId]
    );

    if (match.response_type === 'redirect') {
      return NextResponse.json({
        success: true,
        type: 'redirect',
        message: match.answer,
        redirect: match.redirect_url,
        confidence: match.confidence
      });
    }

    if (match.response_type === 'system') {
      return NextResponse.json({
        success: true,
        type: 'system',
        message: match.answer,
        action: match.action_config,
        confidence: match.confidence
      });
    }

    return NextResponse.json({
      success: true,
      type: 'text',
      message: match.answer,
      confidence: match.confidence
    });

  } catch (error) {
    console.error('Assistant query error:', error);
    return NextResponse.json({ success: false, type: 'text', message: FALLBACK }, { status: 500 });
  }
}
