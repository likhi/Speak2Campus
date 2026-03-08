import { NextRequest, NextResponse } from 'next/server';
import { allAsync } from '@/lib/sqlite';

/**
 * GET /api/classrooms?department=MCA&year=1st
 *
 * Rules:
 *  - Both department AND year → return ONE grouped record for that exact combination
 *  - Only department                → return all year entries for that department
 *  - No params                      → return everything (all depts, all years)
 *
 * Year values in DB are: "1st" and "2nd"
 * The API also accepts "1st Year" / "2nd Year" and normalises them.
 */

function normaliseYear(raw: string | null): string | null {
    if (!raw) return null;
    const s = raw.trim().toLowerCase();
    if (s.startsWith('1') || s === 'first') return '1st';
    if (s.startsWith('2') || s === 'second') return '2nd';
    return raw.trim();
}

function normaliseDept(raw: string | null): string | null {
    if (!raw) return null;
    return raw.trim().toUpperCase();
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const rawDept = searchParams.get('department');
        const rawYear = searchParams.get('year');

        const dept = normaliseDept(rawDept);
        const year = normaliseYear(rawYear);

        const conditions: string[] = [];
        const params: any[] = [];

        if (dept) {
            conditions.push('UPPER(d.name) = ?');
            params.push(dept);
        }
        if (year) {
            conditions.push('t.year = ?');
            params.push(year);
        }

        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        const sql = `
      SELECT
        d.name       AS department,
        t.year,
        t.day_of_week AS day,
        t.time,
        t.subject,
        t.room,
        f.name       AS faculty
      FROM timetable t
      LEFT JOIN departments d ON t.department_id = d.id
      LEFT JOIN faculty     f ON t.faculty_id    = f.id
      ${whereClause}
      ORDER BY d.name, t.year, t.day_of_week, t.time
    `;

        const rows: any[] = await allAsync(sql, params);

        if (rows.length === 0) {
            return NextResponse.json({ found: false, results: [] });
        }

        // Group by department + year → list of distinct rooms used
        const grouped: Record<string, { department: string; year: string; rooms: string[]; schedule: any[] }> = {};

        for (const r of rows) {
            const key = `${r.department}__${r.year}`;
            if (!grouped[key]) {
                grouped[key] = {
                    department: r.department || '',
                    year: r.year || '',
                    rooms: [],
                    schedule: [],
                };
            }
            // Collect distinct rooms
            if (r.room && !grouped[key].rooms.includes(r.room)) {
                grouped[key].rooms.push(r.room);
            }
            grouped[key].schedule.push({
                day: r.day,
                time: r.time,
                subject: r.subject,
                room: r.room,
                faculty: r.faculty,
            });
        }

        const results = Object.values(grouped);

        return NextResponse.json({ found: true, results });
    } catch (error) {
        console.error('[classrooms] GET error:', error);
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
