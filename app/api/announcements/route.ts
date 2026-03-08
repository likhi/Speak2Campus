import { NextRequest, NextResponse } from 'next/server';
import { allAsync, runAsync, getAsync } from '@/lib/sqlite';

// GET /api/announcements
// Optional query params: ?date=YYYY-MM-DD  ?active=true
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const activeOnly = searchParams.get('active') === 'true';

        let query = 'SELECT * FROM announcements';
        const params: any[] = [];
        const conditions: string[] = [];

        if (date) {
            conditions.push('announcement_date = ?');
            params.push(date);
        }
        if (activeOnly) {
            conditions.push('active_status = 1');
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ` ORDER BY
      CASE priority
        WHEN 'high'   THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low'    THEN 3
        ELSE 4
      END,
      announcement_date DESC,
      created_at DESC`;

        const announcements = await allAsync(query, params);
        return NextResponse.json(announcements || []);
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Failed to fetch announcements: ${msg}` }, { status: 500 });
    }
}

// POST /api/announcements  — create a new announcement
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        if (!body.title || !body.announcement_date) {
            return NextResponse.json(
                { error: 'title and announcement_date are required' },
                { status: 400 }
            );
        }

        const activeStatus = body.active_status === false || body.active_status === 0 ? 0 : 1;

        const result = await allAsync(
            `INSERT INTO announcements (title, content, announcement_date, priority, active_status)
       VALUES (?, ?, ?, ?, ?) RETURNING id`,
            [
                body.title.trim(),
                (body.content || '').trim(),
                body.announcement_date,
                body.priority || 'medium',
                activeStatus,
            ]
        );

        if (!result || result.length === 0) throw new Error('Insert failed');

        const newRow = await getAsync('SELECT * FROM announcements WHERE id = ?', [result[0].id]);
        return NextResponse.json(newRow, { status: 201 });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Failed to create announcement: ${msg}` }, { status: 500 });
    }
}

// PATCH /api/announcements?id=X  — toggle active_status
export async function PATCH(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

        const body = await request.json();
        const result = await runAsync(
            'UPDATE announcements SET active_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [body.active_status ? 1 : 0, parseInt(id)]
        );

        if (result.changes === 0)
            return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });

        const updated = await getAsync('SELECT * FROM announcements WHERE id = ?', [parseInt(id)]);
        return NextResponse.json(updated);
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Failed to update announcement: ${msg}` }, { status: 500 });
    }
}

// DELETE /api/announcements?id=X
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

        const result = await runAsync('DELETE FROM announcements WHERE id = ?', [parseInt(id)]);

        if (result.changes === 0)
            return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Failed to delete announcement: ${msg}` }, { status: 500 });
    }
}
