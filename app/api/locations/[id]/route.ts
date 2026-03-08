import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/supabase/server';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const location = await db.collection('locations').findOne({
      _id: new ObjectId(id),
    });

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error('[v0] Error fetching location:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch location: ${errorMsg}` },
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
    console.log('[v0] Updating location:', id);
    const db = await getDatabase();

    const result = await db.collection('locations').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    const updatedLocation = await db.collection('locations').findOne({
      _id: new ObjectId(id),
    });

    console.log('[v0] Location updated successfully');
    return NextResponse.json(updatedLocation);
  } catch (error) {
    console.error('[v0] Error updating location:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to update location: ${errorMsg}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const result = await db.collection('locations').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    console.log('[v0] Location deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error deleting location:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to delete location: ${errorMsg}` },
      { status: 500 }
    );
  }
}
