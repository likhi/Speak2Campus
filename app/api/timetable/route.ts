import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, getAsync, allAsync } from '@/lib/sqlite';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const day = searchParams.get('day');
    const department = searchParams.get('department'); // MCA, MBA, or MCOM
    const year = searchParams.get('year'); // 1st or 2nd

    const database = getDatabase();
    
    let timetable;
    const params: any[] = [];
    
    // Normalize day input: support case-insensitive matching and short forms
    const normalizeDay = (d?: string) => {
      if (!d) return null;
      const key = d.trim().toLowerCase();
      const map: Record<string,string> = {
        'mon': 'Monday', 'monday': 'Monday',
        'tue': 'Tuesday', 'tues': 'Tuesday', 'tuesday': 'Tuesday',
        'wed': 'Wednesday', 'weds': 'Wednesday', 'wednesday': 'Wednesday',
        'thu': 'Thursday', 'thur': 'Thursday', 'thurs': 'Thursday', 'thursday': 'Thursday',
        'fri': 'Friday', 'friday': 'Friday',
        'sat': 'Saturday', 'saturday': 'Saturday',
        'sun': 'Sunday', 'sunday': 'Sunday'
      };
      return map[key] || d;
    };

    const normDay = normalizeDay(day || undefined);

    // Build query based on filters
    let whereConditions = [];
    
    if (department) {
      whereConditions.push('d.name = ?');
      params.push(department.toUpperCase());
    }

    if (year) {
      whereConditions.push('t.year = ?');
      params.push(year);
    }

    if (normDay) {
      whereConditions.push('LOWER(t.day_of_week) = LOWER(?)');
      params.push(normDay);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const sql = `
      SELECT t.*, d.name as dept_name, f.name as faculty_name, f.email as faculty_email, f.designation as faculty_designation, f.cabin as faculty_cabin, l.name as classroom_name
      FROM timetable t 
      LEFT JOIN departments d ON t.department_id = d.id
      LEFT JOIN faculty f ON t.faculty_id = f.id 
      LEFT JOIN locations l ON LOWER(t.room) = LOWER(l.name)
      ${whereClause}
      ORDER BY t.day_of_week, t.time
    `;

    const stmt = database.prepare(sql);
    timetable = stmt.all(...params);

    // Transform the data to match the expected format
    const transformedTimetable = timetable.map((entry: any) => ({
      id: entry.id,
      department_id: entry.department_id,
      department: entry.dept_name || '',
      day: entry.day_of_week || entry.day,
      time: entry.time,
      // Provide start_time and end_time for frontend use (fallback to splitting `time`)
      start_time: entry.start_time || (entry.time ? String(entry.time).split('-')[0]?.trim() : ''),
      end_time: entry.end_time || (entry.time ? String(entry.time).split('-')[1]?.trim() : ''),
      subject: entry.subject,
      // Include faculty_id and resolve faculty details from joined faculty
      faculty_id: entry.faculty_id ?? null,
      faculty: entry.faculty_name || entry.faculty || '',
      faculty_email: entry.faculty_email || null,
      faculty_designation: entry.faculty_designation || null,
      faculty_cabin: entry.faculty_cabin || null,
      // Prefer joined classroom name if available
      classroom: entry.classroom_name || entry.room || '',
      room: entry.room,
      year: entry.year
    }));

    console.log('[v0] Fetched timetable entries:', transformedTimetable.length);
    return NextResponse.json(transformedTimetable || []);
  } catch (error) {
    console.error('[v0] Error fetching timetable:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch timetable: ${errorMsg}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[v0] Adding timetable entry:', body);

    if (!body.time || !body.subject || !body.department_id) {
      return NextResponse.json(
        { error: 'Time, subject, and department_id are required' },
        { status: 400 }
      );
    }

    // Look up faculty_id from faculty name if provided
    let facultyId = null;
    if (body.faculty) {
      const faculty = await getAsync('SELECT id FROM faculty WHERE name = ?', [body.faculty]);
      facultyId = faculty ? faculty.id : null;
    }

    const result = await allAsync(
      'INSERT INTO timetable (department_id, year, day_of_week, time, subject, faculty_id, room) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id',
      [body.department_id, body.year || '1st', body.day || 'Monday', body.time, body.subject, facultyId, body.room || '']
    );

    console.log('[v0] Insert result:', result);

    if (!result || result.length === 0) {
      throw new Error('Failed to insert timetable entry');
    }

    const insertedId = result[0].id;
    console.log('[v0] Timetable entry inserted with ID:', insertedId);

    const newEntry = await getAsync(`
      SELECT t.*, d.name as dept_name, f.name as faculty_name 
      FROM timetable t 
      LEFT JOIN departments d ON t.department_id = d.id
      LEFT JOIN faculty f ON t.faculty_id = f.id 
      WHERE t.id = ?
    `, [insertedId]);

    if (!newEntry) {
      throw new Error('Failed to retrieve the newly created timetable entry');
    }

    // Transform to match expected format
    const transformedEntry = {
      id: newEntry.id,
      department_id: newEntry.department_id,
      department: newEntry.dept_name,
      day: newEntry.day_of_week,
      time: newEntry.time,
      subject: newEntry.subject,
      faculty: newEntry.faculty_name || '',
      room: newEntry.room,
      year: newEntry.year
    };

    console.log('[v0] Timetable entry added successfully:', transformedEntry.id);
    return NextResponse.json(transformedEntry, { status: 201 });
  } catch (error) {
    console.error('[v0] Error creating timetable entry:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[v0] Full error details:', error);
    return NextResponse.json(
      { error: `Failed to create timetable entry: ${errorMsg}` },
      { status: 500 }
    );
  }
}


