import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';

/**
 * GET /api/gallery/albums
 * Returns all albums with their media items grouped inside.
 */
export async function GET() {
    try {
        const db = getDatabase();

        const albums = db.prepare(`
      SELECT * FROM gallery_albums ORDER BY created_at DESC
    `).all() as any[];

        // For each album, attach its media items
        const mediaStmt = db.prepare(`
      SELECT * FROM gallery WHERE album_id = ? ORDER BY uploaded_at ASC
    `);

        const result = albums.map(album => ({
            ...album,
            media: mediaStmt.all(album.id),
        }));

        return NextResponse.json({ success: true, data: result });
    } catch (err) {
        console.error('[v0] gallery/albums GET error:', err);
        return NextResponse.json({ success: false, error: 'Failed to fetch albums' }, { status: 500 });
    }
}

/**
 * POST /api/gallery/albums
 * Body: { title, description }
 * Creates an album and returns it.
 */
export async function POST(request: NextRequest) {
    try {
        const { title, description } = await request.json();
        if (!title?.trim()) {
            return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
        }

        const db = getDatabase();
        const result = db.prepare(`
      INSERT INTO gallery_albums (title, description) VALUES (?, ?) RETURNING *
    `).get([title.trim(), description?.trim() || null]) as any;

        return NextResponse.json({ success: true, data: { ...result, media: [] } }, { status: 201 });
    } catch (err) {
        console.error('[v0] gallery/albums POST error:', err);
        return NextResponse.json({ success: false, error: 'Failed to create album' }, { status: 500 });
    }
}

/**
 * DELETE /api/gallery/albums?id=<albumId>
 * Deletes album and cascades to all its gallery items.
 */
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

        const db = getDatabase();
        db.prepare('DELETE FROM gallery WHERE album_id = ?').run(id);
        db.prepare('DELETE FROM gallery_albums WHERE id = ?').run(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[v0] gallery/albums DELETE error:', err);
        return NextResponse.json({ success: false, error: 'Failed to delete album' }, { status: 500 });
    }
}
