import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';

export async function GET() {
  try {
    const db = getDatabase();
    const gallery = db
      .prepare('SELECT * FROM gallery ORDER BY uploaded_at DESC')
      .all();

    return NextResponse.json({
      success: true,
      data: gallery,
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch gallery images',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, file_path, description, file_type, album_id } = body;

    if (!title || !file_path) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title and file_path are required',
        },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const result = db
      .prepare(
        `INSERT INTO gallery (title, file_path, file_type, description, album_id, uploaded_at) 
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
      )
      .run(title, file_path, file_type || null, description || null, album_id || null);

    const newGallery = db
      .prepare('SELECT * FROM gallery WHERE id = ?')
      .get(result.lastInsertRowid);

    return NextResponse.json(
      {
        success: true,
        message: 'Gallery item added successfully',
        data: newGallery,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating gallery entry:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add gallery item',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
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
        {
          success: false,
          error: 'Gallery ID is required',
        },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const gallery = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);

    if (!gallery) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gallery image not found',
        },
        { status: 404 }
      );
    }

    db.prepare('DELETE FROM gallery WHERE id = ?').run(id);

    return NextResponse.json({
      success: true,
      message: 'Gallery image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting gallery entry:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete gallery image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
