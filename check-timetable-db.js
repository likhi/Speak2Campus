import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkDatabase() {
  try {
    const dbPath = path.join(process.cwd(), 'data', 'college.db');
    const db = new Database(dbPath);

    console.log('Checking timetable table...');

    // Check if table exists
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='timetable'
    `).get();

    if (!tableExists) {
      console.log('❌ Timetable table does not exist!');
      return;
    }

    console.log('✅ Timetable table exists');

    // Count entries
    const count = db.prepare('SELECT COUNT(*) as count FROM timetable').get();
    console.log('Total timetable entries:', count.count);

    if (count.count > 0) {
      console.log('\nSample entries:');
      const entries = db.prepare('SELECT * FROM timetable LIMIT 3').all();
      console.log(JSON.stringify(entries, null, 2));
    }

    db.close();
  } catch (error) {
    console.error('Database check failed:', error);
  }
}

checkDatabase();