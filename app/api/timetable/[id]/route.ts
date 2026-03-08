import { NextRequest, NextResponse } from 'next/server';
import { runAsync } from '@/lib/sqlite';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const result = await runAsync('DELETE FROM timetable WHERE id = ?', [parseInt(id)]);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Timetable entry not found' },
        { status: 404 }
      );
    }

    console.log('[v0] Timetable entry deleted:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error deleting timetable entry:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to delete timetable entry: ${errorMsg}` },
      { status: 500 }
    );
  }
}
