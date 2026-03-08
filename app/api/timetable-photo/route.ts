import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDatabase } from '@/lib/sqlite';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'timetable');
const VALID_DEPTS = ['MCA', 'MBA', 'MCOM'];
const VALID_YEARS = ['1st Year', '2nd Year'];

function ensureUploadDir() {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Ensures timetable_photos has the correct schema:
 *   UNIQUE (department, year)
 *
 * Strategy: read the raw DDL from sqlite_master and check whether it contains
 * both "department" AND "unique" in the same constraint. This is the only
 * reliable way — index name heuristics fail when ALTER TABLE already added the
 * department column but didn't add the UNIQUE constraint.
 */
function ensureTable() {
    const db = getDatabase();

    // ── Get raw DDL if table already exists ─────────────────────────────────
    const row = db.prepare(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='timetable_photos'"
    ).get() as { sql: string } | undefined;

    if (!row) {
        // Table doesn't exist — create it fresh with the correct schema
        db.exec(`
            CREATE TABLE timetable_photos (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                department    TEXT NOT NULL DEFAULT 'MCA',
                year          TEXT NOT NULL,
                file_path     TEXT NOT NULL,
                original_name TEXT,
                uploaded_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (department, year)
            )
        `);
        console.log('[timetable-photo] Created timetable_photos (new).');
        return;
    }

    // ── Check DDL for UNIQUE(department, year) ───────────────────────────────
    // The raw DDL string stored in sqlite_master is the original CREATE TABLE.
    // Normalise to lowercase and look for both tokens near each other.
    const ddl = row.sql.toLowerCase().replace(/\s+/g, ' ');

    // Does the DDL declare "unique" with "department" AND "year" together?
    const hasCorrectUnique =
        /unique\s*\(\s*department\s*,\s*year\s*\)/.test(ddl) ||
        /unique\s*\(\s*"department"\s*,\s*"year"\s*\)/.test(ddl);

    if (hasCorrectUnique) {
        // Schema is already correct — nothing to do
        return;
    }

    // ── Migration: rebuild table ─────────────────────────────────────────────
    console.log('[timetable-photo] Schema missing UNIQUE(department, year) — running migration...');
    console.log('[timetable-photo] Existing DDL:', row.sql);

    const cols = db.prepare('PRAGMA table_info(timetable_photos)').all() as any[];
    const hasDeptCol = cols.some((c: any) => c.name === 'department');

    db.transaction(() => {
        db.exec('ALTER TABLE timetable_photos RENAME TO _timetable_photos_bak');

        db.exec(`
            CREATE TABLE timetable_photos (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                department    TEXT NOT NULL DEFAULT 'MCA',
                year          TEXT NOT NULL,
                file_path     TEXT NOT NULL,
                original_name TEXT,
                uploaded_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (department, year)
            )
        `);

        if (hasDeptCol) {
            db.exec(`
                INSERT OR IGNORE INTO timetable_photos (department, year, file_path, original_name, uploaded_at)
                SELECT department, year, file_path, original_name, uploaded_at
                FROM _timetable_photos_bak
            `);
        } else {
            db.exec(`
                INSERT OR IGNORE INTO timetable_photos (department, year, file_path, original_name, uploaded_at)
                SELECT 'MCA', year, file_path, original_name, uploaded_at
                FROM _timetable_photos_bak
            `);
        }

        db.exec('DROP TABLE _timetable_photos_bak');
    })();

    console.log('[timetable-photo] Migration complete — UNIQUE(department, year) now enforced.');
}

// ─── GET /api/timetable-photo?department=MCA&year=1st+Year ───────────────────
export async function GET(request: NextRequest) {
    try {
        ensureTable();
        const db = getDatabase();
        const { searchParams } = new URL(request.url);
        const department = searchParams.get('department');
        const year = searchParams.get('year');

        if (department && year) {
            const r = db.prepare(
                'SELECT * FROM timetable_photos WHERE department = ? AND year = ?'
            ).get([department, year]) as any;
            return NextResponse.json(r || null);
        }

        const rows = db.prepare(
            'SELECT * FROM timetable_photos ORDER BY department, year'
        ).all();
        return NextResponse.json(rows || []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// ─── POST /api/timetable-photo  (multipart: department + year + file) ────────
export async function POST(request: NextRequest) {
    try {
        ensureTable();
        ensureUploadDir();

        const formData = await request.formData();
        const department = (formData.get('department') as string | null)?.trim().toUpperCase();
        const year = (formData.get('year') as string | null)?.trim();
        const file = formData.get('file') as File | null;

        if (!department || !VALID_DEPTS.includes(department)) {
            return NextResponse.json(
                { error: `department must be one of: ${VALID_DEPTS.join(', ')}` },
                { status: 400 }
            );
        }
        if (!year || !VALID_YEARS.includes(year)) {
            return NextResponse.json(
                { error: 'year must be "1st Year" or "2nd Year"' },
                { status: 400 }
            );
        }
        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const ftype = (file as any).type as string;
        const fsize = (file as any).size as number;
        if (!allowed.includes(ftype)) {
            return NextResponse.json({ error: 'Only JPG, PNG, WEBP allowed' }, { status: 400 });
        }
        if (fsize > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'File must be ≤ 10 MB' }, { status: 400 });
        }

        // Save file to disk
        const ext = ftype === 'image/png' ? 'png' : ftype === 'image/webp' ? 'webp' : 'jpg';
        const slug = `${department.toLowerCase()}-${year.replace(/\s+/g, '-').toLowerCase()}`;
        const fileName = `timetable-${slug}-${Date.now()}.${ext}`;
        const filePath = path.join(UPLOAD_DIR, fileName);
        fs.writeFileSync(filePath, Buffer.from(await (file as any).arrayBuffer()));
        const publicPath = `/uploads/timetable/${fileName}`;

        const db = getDatabase();

        // Clean up old file on disk
        const existing = db.prepare(
            'SELECT file_path FROM timetable_photos WHERE department = ? AND year = ?'
        ).get([department, year]) as any;
        if (existing?.file_path) {
            const oldAbs = path.join(process.cwd(), 'public', existing.file_path);
            if (fs.existsSync(oldAbs)) { try { fs.unlinkSync(oldAbs); } catch { } }
        }

        // ── Safe upsert: UPDATE first, INSERT if no row exists ───────────────
        // We deliberately avoid ON CONFLICT because the constraint may not yet
        // exist on an in-the-field database that hasn't been migrated.
        const updated = db.prepare(`
            UPDATE timetable_photos
            SET file_path = ?, original_name = ?, uploaded_at = CURRENT_TIMESTAMP
            WHERE department = ? AND year = ?
        `).run([publicPath, file.name, department, year]);

        if (updated.changes === 0) {
            // No existing row — insert fresh
            db.prepare(`
                INSERT INTO timetable_photos (department, year, file_path, original_name)
                VALUES (?, ?, ?, ?)
            `).run([department, year, publicPath, file.name]);
        }

        console.log(`[timetable-photo] Saved: ${department} / ${year} → ${publicPath}`);
        return NextResponse.json({ success: true, department, year, file_path: publicPath });
    } catch (err: any) {
        console.error('[timetable-photo] POST error:', err);
        return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
    }
}

// ─── DELETE /api/timetable-photo?department=MCA&year=1st+Year ────────────────
export async function DELETE(request: NextRequest) {
    try {
        ensureTable();
        const db = getDatabase();
        const { searchParams } = new URL(request.url);
        const department = searchParams.get('department')?.trim().toUpperCase();
        const year = searchParams.get('year')?.trim();

        if (!department || !year) {
            return NextResponse.json({ error: 'department and year are required' }, { status: 400 });
        }

        const existing = db.prepare(
            'SELECT file_path FROM timetable_photos WHERE department = ? AND year = ?'
        ).get([department, year]) as any;
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const absPath = path.join(process.cwd(), 'public', existing.file_path);
        if (fs.existsSync(absPath)) { try { fs.unlinkSync(absPath); } catch { } }

        db.prepare('DELETE FROM timetable_photos WHERE department = ? AND year = ?').run([department, year]);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
