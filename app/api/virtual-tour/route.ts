import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';

export async function GET() {
  try {
    const db = getDatabase();
    
    // Get the most recent video
    const tour = db
      .prepare('SELECT * FROM virtual_tour ORDER BY uploaded_at DESC LIMIT 1')
      .get();

    return NextResponse.json({
      success: true,
      data: tour || null,
    });
  } catch (error) {
    console.error('Error fetching virtual tour:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch virtual tour',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, video_path, description } = body;

    if (!title || !video_path) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title and video_path are required',
        },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Delete previous videos (keep only latest)
    db.prepare('DELETE FROM virtual_tour').run();
    
    const result = db
      .prepare(
        `INSERT INTO virtual_tour (title, video_path, description, uploaded_at) 
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`
      )
      .run(title, video_path, description || null);

    const newTour = db
      .prepare('SELECT * FROM virtual_tour WHERE id = ?')
      .get(result.lastInsertRowid);

    return NextResponse.json(
      {
        success: true,
        message: 'Virtual tour uploaded successfully',
        data: newTour,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating virtual tour entry:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload virtual tour',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = getDatabase();
    db.prepare('DELETE FROM virtual_tour').run();

    return NextResponse.json({
      success: true,
      message: 'Virtual tour deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting virtual tour:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete virtual tour',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, video_path, description } = body;

    if (!title || !video_path) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title and video_path are required',
        },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Replace existing video
    db.prepare('DELETE FROM virtual_tour').run();
    
    const result = db
      .prepare(
        `INSERT INTO virtual_tour (title, video_path, description, uploaded_at) 
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`
      )
      .run(title, video_path, description || null);

    const updatedTour = db
      .prepare('SELECT * FROM virtual_tour WHERE id = ?')
      .get(result.lastInsertRowid);

    return NextResponse.json({
      success: true,
      message: 'Virtual tour replaced successfully',
      data: updatedTour,
    });
  } catch (error) {
    console.error('Error updating virtual tour:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update virtual tour',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
