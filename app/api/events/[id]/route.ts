import { NextRequest, NextResponse } from 'next/server';
import { getAsync, runAsync } from '@/lib/sqlite';

// GET /api/events/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await getAsync('SELECT * FROM events WHERE id = ?', [parseInt(id)]);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('[v0] Error fetching event:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await runAsync(
      'UPDATE events SET name = ?, date = ?, description = ?, venue = ? WHERE id = ?',
      [body.name, body.date, body.description || '', body.venue || '', parseInt(id)]
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updated = await getAsync('SELECT * FROM events WHERE id = ?', [parseInt(id)]);
    console.log('[v0] Event updated:', id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[v0] Error updating event:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id);

    if (isNaN(numId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const result = await runAsync('DELETE FROM events WHERE id = ?', [numId]);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    console.log('[v0] Event deleted:', numId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error deleting event:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete event' },
      { status: 500 }
    );
  }
}
