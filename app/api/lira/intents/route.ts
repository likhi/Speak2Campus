import { NextRequest, NextResponse } from 'next/server';
import { allAsync, runAsync } from '@/lib/sqlite';

// GET /api/lira/intents - list all intents
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;

        const intents = await allAsync(
            'SELECT * FROM intents ORDER BY priority DESC, created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        const [{ total }] = await allAsync('SELECT COUNT(*) as total FROM intents') as any[];

        return NextResponse.json({ success: true, intents, total, page, limit });
    } catch (error) {
        console.error('Lira intents GET error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch intents' }, { status: 500 });
    }
}

// POST /api/lira/intents - create intent
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { intent_name, variations, keywords, action_type, action_config, priority } = body;

        if (!intent_name || !action_type) {
            return NextResponse.json({ success: false, error: 'intent_name and action_type are required' }, { status: 400 });
        }

        // Validate action_type
        if (!['text', 'redirect', 'system'].includes(action_type)) {
            return NextResponse.json({ success: false, error: 'action_type must be text, redirect, or system' }, { status: 400 });
        }

        // Validate JSON fields
        let variationsStr = '[]';
        try { variationsStr = JSON.stringify(Array.isArray(variations) ? variations : JSON.parse(variations || '[]')); } catch { /* default */ }

        let configStr = '{}';
        try { configStr = JSON.stringify(typeof action_config === 'object' ? action_config : JSON.parse(action_config || '{}')); } catch { /* default */ }

        const result = await runAsync(
            `INSERT INTO intents (intent_name, variations, keywords, action_type, action_config, priority, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [intent_name.trim(), variationsStr, (keywords || '').trim(), action_type, configStr, parseInt(priority) || 0]
        );

        return NextResponse.json({ success: true, id: (result as any).lastInsertRowid });
    } catch (error: any) {
        if (error?.message?.includes('UNIQUE constraint')) {
            return NextResponse.json({ success: false, error: 'Intent name already exists' }, { status: 409 });
        }
        console.error('Lira intents POST error:', error);
        return NextResponse.json({ success: false, error: 'Failed to create intent' }, { status: 500 });
    }
}
