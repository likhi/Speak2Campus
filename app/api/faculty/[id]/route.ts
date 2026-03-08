import { NextRequest, NextResponse } from 'next/server';
import { runAsync, getAsync } from '@/lib/sqlite';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const faculty = await getAsync('SELECT * FROM faculty WHERE id = ?', [parseInt(id)]);

    if (!faculty) {
      return NextResponse.json(
        { error: 'Faculty not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(faculty);
  } catch (error) {
    console.error('[v0] Error fetching faculty:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch faculty: ${errorMsg}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('[v0] Updating faculty:', id);

    // Resolve department name from department_id when provided
    // NOTE: The faculty table has no 'department' string column —
    // it only stores department_id (FK). The name is resolved at read-time via JOIN.

    // Build SQL dynamically to include department_id only when provided
    const sql = body.department_id
      ? 'UPDATE faculty SET name=?, designation=?, specialization=?, experience=?, email=?, cabin=?, department_id=? WHERE id=?'
      : 'UPDATE faculty SET name=?, designation=?, specialization=?, experience=?, email=?, cabin=? WHERE id=?';

    const values = body.department_id
      ? [body.name || '', body.designation || '', body.specialization || '', body.experience || '', body.email || '', body.cabin || '', parseInt(body.department_id), parseInt(id)]
      : [body.name || '', body.designation || '', body.specialization || '', body.experience || '', body.email || '', body.cabin || '', parseInt(id)];

    const result = await runAsync(sql, values);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    const updatedFaculty = await getAsync('SELECT * FROM faculty WHERE id = ?', [parseInt(id)]);
    console.log('[v0] Faculty updated successfully');
    return NextResponse.json(updatedFaculty);
  } catch (error) {
    console.error('[v0] Error updating faculty:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to update faculty: ${errorMsg}` }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const facultyId = parseInt(id);
    console.log('[v0] DELETE request for faculty ID:', facultyId, 'Type:', typeof facultyId);

    // Verify faculty exists first (include profile_photo)
    const existingFaculty = await getAsync('SELECT id, name, profile_photo FROM faculty WHERE id = ?', [facultyId]);
    console.log('[v0] Faculty exists check:', existingFaculty ? `Yes (${existingFaculty.name})` : 'No');

    if (!existingFaculty) {
      return NextResponse.json(
        { error: 'Faculty not found' },
        { status: 404 }
      );
    }

    // If profile photo exists, delete the file from disk
    try {
      if (existingFaculty && existingFaculty.profile_photo) {
        const publicPath = path.join(process.cwd(), 'public');
        const relativePath = existingFaculty.profile_photo.startsWith('/')
          ? existingFaculty.profile_photo.slice(1)
          : existingFaculty.profile_photo;
        const filePath = path.join(publicPath, relativePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('[v0] Deleted profile photo file:', filePath);
        }
      }
    } catch (err) {
      console.error('[v0] Error deleting profile photo file:', err);
    }

    const result = await runAsync('DELETE FROM faculty WHERE id = ?', [facultyId]);
    console.log('[v0] Delete result:', result);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Failed to delete faculty (no rows affected)' },
        { status: 500 }
      );
    }

    console.log('[v0] Faculty deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error deleting faculty:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to delete faculty: ${errorMsg}` },
      { status: 500 }
    );
  }
}
