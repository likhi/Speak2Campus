// Persistent SQLite database implementation
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    // Use absolute path to ensure correct location
    const dbPath = path.resolve(process.cwd(), 'data', 'college.db');

    // Create database directory if it doesn't exist
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(dbPath);

    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');


    console.log('[v0] Database connected successfully');
    console.log('[v0] SQLite database initialized at:', dbPath);

    // Initialize database schema if tables don't exist
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  if (!db) return;

  // Check which expected tables already exist
  const expectedTables = ['departments', 'locations', 'faculty', 'events', 'timetable', 'admin_users', 'knowledge_base', 'intents', 'assistant_logs', 'announcements'];

  const existingRows = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `).all();
  const existingTables = existingRows.map((r: any) => r.name);
  const missingTables = expectedTables.filter((t) => !existingTables.includes(t));

  // Ensure knowledge_base table exists (create if missing)
  if (!existingTables.includes('knowledge_base')) {
    db.exec(`CREATE TABLE IF NOT EXISTS knowledge_base (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT,
      intent TEXT,
      variations TEXT DEFAULT '[]',
      answer TEXT,
      keywords TEXT NOT NULL DEFAULT '',
      department TEXT DEFAULT 'General',
      response_type TEXT DEFAULT 'text',
      redirect_url TEXT,
      action_type TEXT DEFAULT 'text',
      action_config TEXT DEFAULT '{}',
      match_mode TEXT DEFAULT 'contains',
      priority INTEGER DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('[v0] knowledge_base table ready (new schema)');
  } else {
    // Migrate: add new columns to existing table if they don't exist
    try {
      const kbCols = db.prepare('PRAGMA table_info(knowledge_base)').all();
      const kbColNames = (kbCols as any[]).map((c: any) => c.name);
      const kbMigrations: [string, string][] = [
        ['intent', 'TEXT'],
        ['variations', "TEXT DEFAULT '[]'"],
        ['action_type', "TEXT DEFAULT 'text'"],
        ['action_config', "TEXT DEFAULT '{}'"],
        ['match_mode', "TEXT DEFAULT 'contains'"],
        ['priority', 'INTEGER DEFAULT 5'],
      ];
      for (const [col, def] of kbMigrations) {
        if (!kbColNames.includes(col)) {
          try {
            db.exec(`ALTER TABLE knowledge_base ADD COLUMN ${col} ${def}`);
            console.log(`[v0] knowledge_base migrated: added column ${col}`);
          } catch { /* already exists race condition */ }
        }
      }
    } catch (err) {
      console.warn('[v0] Could not migrate knowledge_base schema:', err);
    }
    console.log('[v0] knowledge_base table ready');
  }

  // Ensure intents table exists
  if (!existingTables.includes('intents')) {
    db.exec(`CREATE TABLE IF NOT EXISTS intents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      intent_name TEXT NOT NULL UNIQUE,
      variations TEXT NOT NULL DEFAULT '[]',
      keywords TEXT NOT NULL DEFAULT '',
      action_type TEXT NOT NULL DEFAULT 'text',
      action_config TEXT NOT NULL DEFAULT '{}',
      priority INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('[v0] intents table created');
    // Seed starter intents
    const starterIntents = [
      { name: 'greeting', variations: '["hi","hello","hey","good morning","good afternoon","namaste"]', keywords: 'hi,hello,hey,morning,afternoon,namaste', type: 'text', config: '{"message":"Hello! Welcome to Seshadripuram College. I am Lira, your campus guide. How can I help you today?"}', priority: 10 },
      { name: 'help', variations: '["help","what can you do","guide me","how to use"]', keywords: 'help,guide,what can,how to', type: 'text', config: '{"message":"I can help you with locations, faculty info, class timetables, and upcoming events. Just ask naturally!"}', priority: 9 },
      { name: 'stop', variations: '["stop","cancel","quiet","silence","shut up"]', keywords: 'stop,cancel,quiet,silence', type: 'system', config: '{"action":"stop_tts"}', priority: 100 },
      { name: 'gallery_redirect', variations: '["show gallery","campus photos","view photos","gallery"]', keywords: 'gallery,photo,image,campus photos', type: 'redirect', config: '{"url":"/gallery","message":"Redirecting you to the campus gallery."}', priority: 5 },
      { name: 'virtual_tour', variations: '["virtual tour","360 tour","campus tour","tour"]', keywords: 'virtual tour,360,campus tour', type: 'redirect', config: '{"url":"/virtual-tour","message":"Taking you to the virtual campus tour."}', priority: 5 }
    ];
    const insertIntent = db.prepare(`INSERT OR IGNORE INTO intents (intent_name, variations, keywords, action_type, action_config, priority) VALUES (?, ?, ?, ?, ?, ?)`);
    for (const si of starterIntents) {
      insertIntent.run([si.name, si.variations, si.keywords, si.type, si.config, si.priority]);
    }
    console.log('[v0] Seeded starter intents');
  } else {
    console.log('[v0] intents table ready');
  }

  // Ensure assistant_logs table exists with full schema
  if (!existingTables.includes('assistant_logs')) {
    db.exec(`CREATE TABLE IF NOT EXISTS assistant_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      matched_answer_id INTEGER,
      matched_intent_id INTEGER,
      confidence REAL DEFAULT 0,
      state TEXT DEFAULT 'PROCESSING',
      response_text TEXT,
      session_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('[v0] assistant_logs table created');
  } else {
    // Migrate existing assistant_logs to add new columns if missing
    try {
      const logCols = db.prepare('PRAGMA table_info(assistant_logs)').all();
      const logColNames = logCols.map((c: any) => c.name);
      if (!logColNames.includes('confidence')) db.exec('ALTER TABLE assistant_logs ADD COLUMN confidence REAL DEFAULT 0');
      if (!logColNames.includes('state')) db.exec('ALTER TABLE assistant_logs ADD COLUMN state TEXT DEFAULT \'PROCESSING\'');
      if (!logColNames.includes('response_text')) db.exec('ALTER TABLE assistant_logs ADD COLUMN response_text TEXT');
      if (!logColNames.includes('session_id')) db.exec('ALTER TABLE assistant_logs ADD COLUMN session_id TEXT');
      if (!logColNames.includes('matched_intent_id')) db.exec('ALTER TABLE assistant_logs ADD COLUMN matched_intent_id INTEGER');
    } catch (err) {
      console.warn('[v0] Could not migrate assistant_logs:', err);
    }
    console.log('[v0] assistant_logs table ready');
  }

  // Ensure announcements table exists
  if (!existingTables.includes('announcements')) {
    db.exec(`CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      announcement_date DATE NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      active_status INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('[v0] announcements table created');
  } else {
    console.log('[v0] announcements table ready');
  }

  // Ensure events table has event_time column (optional, e.g. "10:00 AM")
  try {
    if (existingTables.includes('events')) {
      const eventCols = db.prepare('PRAGMA table_info(events)').all();
      const eventColNames = (eventCols as any[]).map((c: any) => c.name);
      if (!eventColNames.includes('event_time')) {
        db.exec('ALTER TABLE events ADD COLUMN event_time VARCHAR(20)');
        console.log('[v0] events table: added event_time column');
      }
    }
  } catch (err) {
    console.warn('[v0] Could not migrate events.event_time:', err);
  }

  // Check if migration from old schema is needed (faculty has 'department' column but not 'department_id')
  if (existingTables.includes('faculty') && !missingTables.includes('departments')) {
    try {
      const facultyColumns = db.prepare("PRAGMA table_info(faculty)").all();
      const columnNames = facultyColumns.map((col: any) => col.name);

      // Check if migration is needed
      if (columnNames.includes('department') && !columnNames.includes('department_id')) {
        console.log('[v0] Starting schema migration for multi-department support...');
        migrateToMultiDepartment();
      }

      // Add missing columns
      if (!columnNames.includes('experience')) {
        console.log('[v0] Adding missing "experience" column to faculty table');
        db.exec('ALTER TABLE faculty ADD COLUMN experience TEXT');
      }
    } catch (error) {
      console.warn('[v0] Error checking/migrating faculty schema:', error);
    }
  }

  // Ensure gallery has file_type column (migration)
  try {
    if (existingTables.includes('gallery')) {
      const galleryCols = db.prepare("PRAGMA table_info(gallery)").all();
      const galleryColNames = galleryCols.map((c: any) => c.name);
      if (!galleryColNames.includes('file_type')) {
        console.log('[v0] Migrating gallery table: adding file_type column');
        try {
          db.exec('ALTER TABLE gallery ADD COLUMN file_type TEXT');
        } catch (err) {
          console.warn('[v0] Could not add file_type column to gallery:', err);
        }

        // Backfill existing rows based on file_path extension
        try {
          const rows = db.prepare('SELECT id, file_path FROM gallery').all();
          const videoExt = /\.(mp4|webm|mov|mkv|ogg)$/i;
          const update = db.prepare('UPDATE gallery SET file_type = ? WHERE id = ?');
          for (const r of rows as { id: number; file_path: string }[]) {
            const isVideo = videoExt.test(r.file_path || '');
            update.run(isVideo ? 'video' : 'image', r.id);
          }
          console.log('[v0] Backfilled gallery.file_type for existing rows');
        } catch (err) {
          console.warn('[v0] Error backfilling gallery.file_type:', err);
        }
      }
    }
  } catch (error) {
    console.warn('[v0] Error checking gallery schema:', error);
  }

  // Ensure gallery_albums table and album_id FK on gallery exist
  try {
    // Create gallery_albums if not yet present
    db.exec(`CREATE TABLE IF NOT EXISTS gallery_albums (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT NOT NULL,
      description TEXT,
      cover_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Add album_id FK to gallery rows (nullable — existing rows keep album_id NULL)
    const galleryCols2 = db.prepare('PRAGMA table_info(gallery)').all();
    const galleryColNames2 = galleryCols2.map((c: any) => c.name);
    if (!galleryColNames2.includes('album_id')) {
      db.exec('ALTER TABLE gallery ADD COLUMN album_id INTEGER REFERENCES gallery_albums(id) ON DELETE CASCADE');
      console.log('[v0] gallery table: added album_id column');
    }
  } catch (error) {
    console.warn('[v0] Error setting up gallery_albums:', error);
  }

  if (missingTables.length === 0) return;

  console.log('[v0] Missing tables detected:', missingTables.join(', '));

  const setupPath = path.join(process.cwd(), 'scripts', 'setup-database.sql');
  if (!fs.existsSync(setupPath)) {
    console.warn('[v0] Setup script not found at:', setupPath);
    return;
  }

  const setupSQL = fs.readFileSync(setupPath, 'utf-8');

  // Break into statements but keep them associated with target tables when possible
  const rawStatements = setupSQL.split(';').map(s => s.trim()).filter(s => s.length > 0);

  // Helper to extract table name from CREATE TABLE or INSERT INTO statements
  const extractTableName = (stmt: string) => {
    const createMatch = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"])?([a-zA-Z0-9_]+)\1?/i);
    if (createMatch) return createMatch[2];
    const insertMatch = stmt.match(/INSERT\s+INTO\s+([`"])?([a-zA-Z0-9_]+)\1?/i);
    if (insertMatch) return insertMatch[2];
    return null;
  };

  // Execute CREATE TABLE statements for missing tables
  for (const stmt of rawStatements) {
    const table = extractTableName(stmt);
    if (table && missingTables.includes(table) && /^CREATE\s+TABLE/i.test(stmt)) {
      try {
        db!.exec(stmt);
        console.log(`[v0] Created table: ${table}`);
      } catch (error) {
        console.warn('[v0] Error creating table', table, error);
      }
    }
  }

  // After creating missing tables, insert sample data only for tables we just created
  for (const stmt of rawStatements) {
    if (/^INSERT\s+INTO/i.test(stmt)) {
      const table = extractTableName(stmt);
      if (table && missingTables.includes(table)) {
        try {
          db!.exec(stmt);
          console.log(`[v0] Inserted sample data into: ${table}`);
        } catch (error) {
          console.warn('[v0] Error inserting sample data for', table, error);
        }
      }
    }
  }

  console.log('[v0] Database setup: missing tables created and seeded');
}

function migrateToMultiDepartment() {
  if (!db) return;

  try {
    // 1. Create departments table
    db.exec(`
      CREATE TABLE departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[v0] Created departments table');

    // 2. Insert departments from existing faculty data
    const departments = db.prepare(`SELECT DISTINCT department FROM faculty WHERE department IS NOT NULL`).all();
    const deptMap: Record<string, number> = {};

    for (const dept of departments as { department: string }[]) {
      const normDept = dept.department.toUpperCase().trim();
      const result = db.prepare(
        'INSERT INTO departments (name, description) VALUES (?, ?) RETURNING id'
      ).get([normDept, `${normDept} Department`]) as { id: number };
      deptMap[normDept] = result.id;
      console.log(`[v0] Inserted department: ${normDept}`);
    }

    // 3. Add department_id column to faculty if it doesn't exist
    try {
      db.exec('ALTER TABLE faculty ADD COLUMN department_id INTEGER');
      console.log('[v0] Added department_id column to faculty');
    } catch (error) {
      console.warn('[v0] department_id column already exists in faculty');
    }

    // 4. Migrate faculty department data
    for (const [deptName, deptId] of Object.entries(deptMap)) {
      db.prepare(
        'UPDATE faculty SET department_id = ? WHERE UPPER(TRIM(department)) = ?'
      ).run([deptId, deptName]);
    }
    console.log('[v0] Migrated faculty department references');

    // 5. Add department_id to timetable if it doesn't exist
    try {
      db.exec('ALTER TABLE timetable ADD COLUMN department_id INTEGER');
      console.log('[v0] Added department_id column to timetable');
    } catch (error) {
      console.warn('[v0] department_id column already exists in timetable');
    }

    // 6. Set timetable department_id based on faculty department
    db.prepare(`
      UPDATE timetable
      SET department_id = (
        SELECT f.department_id FROM faculty f WHERE timetable.faculty_id = f.id
      )
      WHERE faculty_id IS NOT NULL AND department_id IS NULL
    `).run();
    console.log('[v0] Migrated timetable department references');

    console.log('[v0] Schema migration completed successfully');
  } catch (error) {
    console.warn('[v0] Error during migration:', error);
  }
}

export async function runAsync(sql: string, params: any[] = []): Promise<any> {
  try {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    const result = stmt.run(params);
    return result;
  } catch (error) {
    console.error('[v0] Database error:', error);
    throw error;
  }
}

export async function getAsync(sql: string, params: any[] = []): Promise<any> {
  try {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    return stmt.get(params);
  } catch (error) {
    console.error('[v0] Database error:', error);
    throw error;
  }
}

export async function allAsync(sql: string, params: any[] = []): Promise<any[]> {
  try {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    return stmt.all(params);
  } catch (error) {
    console.error('[v0] Database error:', error);
    throw error;
  }
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('[v0] Database closed');
  }
}
