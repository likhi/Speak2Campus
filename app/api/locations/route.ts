import { NextRequest, NextResponse } from 'next/server';
import { allAsync, runAsync, getAsync } from '@/lib/sqlite';

export async function GET(request: NextRequest) {
  try {
    // Optional department filter
    const url = request?.url ? new URL(request.url, 'http://localhost') : null;
    const department = url?.searchParams.get('department');
    let locations;
    if (department) {
      // Case-insensitive department filter
      locations = await allAsync('SELECT * FROM locations WHERE LOWER(building) = LOWER(?) ORDER BY building', [department]);
      console.log(`[v0] Fetched locations for department '${department}':`, locations.length, 'records');
    } else {
      locations = await allAsync('SELECT * FROM locations ORDER BY building');
      console.log('[v0] Fetched ALL locations:', locations.length, 'records');
    }
    // Ensure all locations have 'id' property (not _id)
    locations = (locations || []).map((loc: any) => {
      if (loc._id && !loc.id) {
        loc.id = loc._id;
        delete loc._id;
      }
      return loc;
    });
    return NextResponse.json(locations);
  } catch (error) {
    console.error('[v0] Error fetching locations:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch locations: ${errorMsg}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[v0] Adding location:', body);

    if (!body.name || !body.building) {
      return NextResponse.json(
        { error: 'Name and building are required' },
        { status: 400 }
      );
    }

    const result = await allAsync(
      'INSERT INTO locations (name, floor, building, description) VALUES (?, ?, ?, ?) RETURNING id',
      [body.name, body.floor || '', body.building, body.description || '']
    );

    if (!result || result.length === 0) {
      throw new Error('Failed to insert location');
    }

    const insertedId = result[0].id;
    console.log('[v0] Location inserted with ID:', insertedId);

    const newLocation = await getAsync('SELECT * FROM locations WHERE id = ?', [insertedId]);

    if (!newLocation) {
      throw new Error('Failed to retrieve the newly created location');
    }

    console.log('[v0] Location added successfully:', newLocation.id);
    return NextResponse.json(newLocation, { status: 201 });
  } catch (error) {
    console.error('[v0] Error creating location:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[v0] Full error details:', error);
    return NextResponse.json(
      { error: `Failed to create location: ${errorMsg}` },
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

    const result = await runAsync('DELETE FROM locations WHERE id = ?', [parseInt(id)]);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    console.log('[v0] Location deleted:', id);
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
