import { NextRequest, NextResponse } from 'next/server';
import { allAsync, runAsync, getAsync } from '@/lib/sqlite';

// PATCH /api/lira/intents/[id] - update intent
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: rawId } = await params;
        const id = parseInt(rawId);
        if (isNaN(id)) return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });

        const body = await request.json();
        const { intent_name, variations, keywords, action_type, action_config, priority, is_active } = body;

        const existing = await getAsync('SELECT * FROM intents WHERE id = ?', [id]);
        if (!existing) return NextResponse.json({ success: false, error: 'Intent not found' }, { status: 404 });

        let variationsStr = existing.variations;
        if (variations !== undefined) {
            try { variationsStr = JSON.stringify(Array.isArray(variations) ? variations : JSON.parse(variations)); } catch { /* keep existing */ }
        }

        let configStr = existing.action_config;
        if (action_config !== undefined) {
            try { configStr = JSON.stringify(typeof action_config === 'object' ? action_config : JSON.parse(action_config)); } catch { /* keep existing */ }
        }

        await runAsync(
            `UPDATE intents SET
        intent_name = ?,
        variations = ?,
        keywords = ?,
        action_type = ?,
        action_config = ?,
        priority = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
            [
                (intent_name ?? existing.intent_name).trim(),
                variationsStr,
                (keywords ?? existing.keywords ?? '').trim(),
                action_type ?? existing.action_type,
                configStr,
                priority !== undefined ? parseInt(priority) : existing.priority,
                is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
                id
            ]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Lira intents PATCH error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update intent' }, { status: 500 });
    }
}

// DELETE /api/lira/intents/[id] - delete intent
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: rawId } = await params;
        const id = parseInt(rawId);
        if (isNaN(id)) return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });

        const existing = await getAsync('SELECT id FROM intents WHERE id = ?', [id]);
        if (!existing) return NextResponse.json({ success: false, error: 'Intent not found' }, { status: 404 });

        await runAsync('DELETE FROM intents WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Lira intents DELETE error:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete intent' }, { status: 500 });
    }
}
