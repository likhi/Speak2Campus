import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';
import { ADMIN_SESSIONS } from '@/lib/admin-auth';

// Only allow internal routes
function isValidInternalUrl(url: string): boolean {
    if (!url) return false;
    return url.startsWith('/') && !url.startsWith('//');
}

export async function POST(request: NextRequest) {
    try {
        // ── Auth ─────────────────────────────────────────────────────────────
        // ADMIN_SESSIONS is in-memory and clears on server restart.
        // If the map is empty (dev mode / cold start), allow the request through.
        // If there ARE active sessions, enforce token check.
        const auth = request.headers.get('authorization') || '';
        const token = auth.replace('Bearer ', '').trim() || null;
        if (ADMIN_SESSIONS.size > 0 && (!token || !ADMIN_SESSIONS.has(token))) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // ── Parse body ──────────────────────────────────────────────────────────
        const body = await request.json();

        const intent = (body.intent ?? '').toString().trim();
        const variations: string[] = Array.isArray(body.variations)
            ? body.variations.map((v: any) => String(v).trim()).filter(Boolean)
            : [];
        const department = (body.department ?? 'General').toString().trim();
        const action_type = (body.action_type ?? 'text').toString().trim();
        const action_config: Record<string, any> = (typeof body.action_config === 'object' && body.action_config !== null)
            ? body.action_config
            : {};
        const keywords: string[] = Array.isArray(body.keywords)
            ? body.keywords.map((k: any) => String(k).trim().toLowerCase()).filter(Boolean)
            : [];
        const match_mode = ['exact', 'contains'].includes(body.match_mode) ? body.match_mode : 'contains';
        const priority = Math.min(10, Math.max(1, Number(body.priority) || 5));

        // ── Validation ──────────────────────────────────────────────────────────
        if (!intent) {
            return NextResponse.json({ success: false, error: 'intent (trigger question) is required.' }, { status: 400 });
        }
        if (!['text', 'redirect'].includes(action_type)) {
            return NextResponse.json({ success: false, error: 'action_type must be "text" or "redirect".' }, { status: 400 });
        }
        if (action_type === 'text') {
            if (!action_config.message || String(action_config.message).trim() === '') {
                return NextResponse.json({ success: false, error: 'action_config.message is required for text action.' }, { status: 400 });
            }
            action_config.message = String(action_config.message).trim();
        }
        if (action_type === 'redirect') {
            if (!action_config.url) {
                return NextResponse.json({ success: false, error: 'action_config.url is required for redirect action.' }, { status: 400 });
            }
            if (!isValidInternalUrl(String(action_config.url))) {
                return NextResponse.json({ success: false, error: 'action_config.url must be an internal route (e.g. /faculty).' }, { status: 400 });
            }
        }
        if (keywords.length === 0) {
            return NextResponse.json({ success: false, error: 'At least one keyword is required.' }, { status: 400 });
        }

        // ── Duplicate check ──────────────────────────────────────────────────────
        const db = getDatabase();
        const existing = db.prepare(
            'SELECT id FROM knowledge_base WHERE LOWER(TRIM(intent)) = LOWER(TRIM(?))'
        ).get([intent]) as { id: number } | undefined;

        if (existing) {
            return NextResponse.json({
                success: false,
                error: `Duplicate detected: an entry with intent "${intent}" already exists (id=${existing.id}).`
            }, { status: 409 });
        }

        // ── Ensure schema supports new columns (migration guard) ─────────────────
        ensureNewColumns(db);

        // ── Inspect existing columns to handle legacy schema ─────────────────────
        const existingCols = (db.prepare('PRAGMA table_info(knowledge_base)').all() as any[]).map((c: any) => c.name);
        const hasQuestionCol = existingCols.includes('question');
        const hasAnswerCol = existingCols.includes('answer');

        const variationsJson = JSON.stringify(variations);
        const actionConfigJson = JSON.stringify(action_config);
        const keywordsStr = keywords.join(',');
        // Derive a plain-text answer for legacy 'answer' column
        const plainAnswer = action_type === 'text'
            ? (action_config.message || '')
            : `Redirecting to ${action_config.url || '/'}`;

        // Build INSERT dynamically to support both old (question/answer) and new (intent) schemas
        const insertCols = ['intent', 'variations', 'department', 'action_type', 'action_config', 'keywords', 'match_mode', 'priority'];
        const insertVals: any[] = [intent, variationsJson, department, action_type, actionConfigJson, keywordsStr, match_mode, priority];

        if (hasQuestionCol && !existingCols.includes('intent')) {
            // Very old schema: only has question/answer
            insertCols.unshift('question');
            insertVals.unshift(intent);
        } else if (hasQuestionCol) {
            // Mixed schema: has both question and intent
            insertCols.push('question');
            insertVals.push(intent);
        }
        if (hasAnswerCol) {
            insertCols.push('answer');
            insertVals.push(plainAnswer);
        }

        const placeholders = insertCols.map(() => '?').join(', ');
        const result = db.prepare(`
            INSERT INTO knowledge_base (${insertCols.join(', ')})
            VALUES (${placeholders})
        `).run(insertVals);

        return NextResponse.json({
            success: true,
            message: 'Knowledge entry saved successfully.',
            id: result.lastInsertRowid,
            data: { intent, variations, department, action_type, action_config, keywords, match_mode, priority }
        });

    } catch (err: any) {
        console.error('[train] Error:', err);
        return NextResponse.json({
            success: false,
            error: err?.message || 'Internal server error'
        }, { status: 500 });
    }
}

// ── GET — list all trained knowledge_base entries ────────────────────────────
export async function GET() {
    try {
        const db = getDatabase();
        ensureNewColumns(db);
        const rows = db.prepare('SELECT * FROM knowledge_base ORDER BY priority DESC, created_at DESC').all();
        return NextResponse.json(rows || []);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || 'Failed to fetch' }, { status: 500 });
    }
}

// ── DELETE — remove a training entry by id ────────────────────────────────────
export async function DELETE(request: NextRequest) {
    try {
        // Auth: same dev-mode bypass as POST
        const auth = request.headers.get('authorization') || '';
        const token = auth.replace('Bearer ', '').trim() || null;
        if (ADMIN_SESSIONS.size > 0 && (!token || !ADMIN_SESSIONS.has(token))) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id || isNaN(Number(id))) {
            return NextResponse.json({ success: false, error: 'Valid numeric id is required' }, { status: 400 });
        }

        const db = getDatabase();
        const exists = db.prepare('SELECT id FROM knowledge_base WHERE id = ?').get([Number(id)]);
        if (!exists) {
            return NextResponse.json({ success: false, error: `Entry ${id} not found` }, { status: 404 });
        }

        db.prepare('DELETE FROM knowledge_base WHERE id = ?').run([Number(id)]);
        console.log(`[train] Deleted knowledge_base entry id=${id}`);
        return NextResponse.json({ success: true, deleted_id: Number(id) });
    } catch (err: any) {
        console.error('[train] DELETE error:', err);
        return NextResponse.json({ success: false, error: err?.message || 'Delete failed' }, { status: 500 });
    }
}



// ── Schema migration helper ───────────────────────────────────────────────────
function ensureNewColumns(db: any) {
    try {
        const cols = (db.prepare('PRAGMA table_info(knowledge_base)').all() as any[]).map((c: any) => c.name);
        const migrations: [string, string][] = [
            ['intent', 'TEXT'],
            ['variations', 'TEXT DEFAULT "[]"'],
            ['action_type', 'TEXT DEFAULT "text"'],
            ['action_config', 'TEXT DEFAULT "{}"'],
            ['match_mode', 'TEXT DEFAULT "contains"'],
            ['priority', 'INTEGER DEFAULT 5'],
            ['department', 'TEXT DEFAULT "General"'],
        ];
        for (const [col, def] of migrations) {
            if (!cols.includes(col)) {
                try {
                    db.exec(`ALTER TABLE knowledge_base ADD COLUMN ${col} ${def}`);
                    console.log(`[train] Migrated: added ${col} column`);
                } catch { /* already exists race */ }
            }
        }
        // Back-fill intent from question if intent is empty
        if (cols.includes('question') && cols.includes('intent')) {
            db.exec(`UPDATE knowledge_base SET intent = question WHERE (intent IS NULL OR intent = '') AND question IS NOT NULL AND question != ''`);
        }
    } catch (e) {
        console.warn('[train] Schema migration warning:', e);
    }
}
