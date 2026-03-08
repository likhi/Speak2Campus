import { NextRequest, NextResponse } from 'next/server';
import { allAsync, runAsync, getAsync } from '@/lib/sqlite';

export async function GET() {
  try {
    const events = await allAsync('SELECT * FROM events ORDER BY date ASC, COALESCE(event_time, \'99:99\') ASC');

    console.log('[v0] Fetched events:', events.length, 'records');
    return NextResponse.json(events || []);
  } catch (error) {
    console.error('[v0] Error fetching events:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch events: ${errorMsg}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[v0] Adding event:', body);

    if (!body.name || !body.date) {
      return NextResponse.json(
        { error: 'Name and date are required' },
        { status: 400 }
      );
    }

    const result = await allAsync(
      'INSERT INTO events (name, date, event_time, description, venue) VALUES (?, ?, ?, ?, ?) RETURNING id',
      [body.name, body.date, body.event_time || null, body.description || '', body.venue || '']
    );

    if (!result || result.length === 0) {
      throw new Error('Failed to insert event');
    }

    const insertedId = result[0].id;
    console.log('[v0] Event inserted with ID:', insertedId);

    const newEvent = await getAsync('SELECT * FROM events WHERE id = ?', [insertedId]);

    if (!newEvent) {
      throw new Error('Failed to retrieve the newly created event');
    }

    console.log('[v0] Event added successfully:', newEvent.id);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('[v0] Error creating event:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[v0] Full error details:', error);
    return NextResponse.json(
      { error: `Failed to create event: ${errorMsg}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const result = await runAsync('DELETE FROM events WHERE id = ?', [parseInt(id)]);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    console.log('[v0] Event deleted:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error deleting event:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to delete event: ${errorMsg}` },
      { status: 500 }
    );
  }
}
