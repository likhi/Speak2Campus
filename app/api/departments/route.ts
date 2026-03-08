import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';

export async function GET(request: NextRequest) {
  try {
    const database = getDatabase();
    const stmt = database.prepare('SELECT * FROM departments ORDER BY name');
    const departments = stmt.all();

    console.log('[v0] Fetched departments:', departments.length, 'records');
    return NextResponse.json(departments || []);
  } catch (error) {
    console.error('[v0] Error fetching departments:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch departments: ${errorMsg}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[v0] Adding department:', body);

    if (!body.name) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }

    const database = getDatabase();
    const stmt = database.prepare(
      `INSERT INTO departments (name, description) VALUES (?, ?) RETURNING *`
    );

    const newDept = stmt.get([body.name.toUpperCase(), body.description || '']) as { id: number; name: string; description: string } | undefined;

    if (!newDept) {
      throw new Error('Failed to insert department');
    }

    console.log('[v0] Department added successfully:', newDept.id);
    return NextResponse.json(newDept, { status: 201 });
  } catch (error) {
    console.error('[v0] Error creating department:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create department: ${errorMsg}` },
      { status: 500 }
    );
  }
}
