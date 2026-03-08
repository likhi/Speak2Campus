import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'college.db');
const db = new Database(dbPath);

try {
  const tables = db.prepare('SELECT name FROM sqlite_master WHERE type = \'table\'').all();
  console.log('Tables:', tables.map(t => t.name));

  const timetableCount = db.prepare('SELECT COUNT(*) as count FROM timetable').get();
  console.log('Timetable entries:', timetableCount.count);

  if (timetableCount.count > 0) {
    const sample = db.prepare('SELECT * FROM timetable LIMIT 3').all();
    console.log('Sample entries:', sample);
  }
} catch (error) {
  console.error('Database error:', error);
} finally {
  db.close();
}