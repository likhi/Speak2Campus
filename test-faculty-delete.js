import Database from 'better-sqlite3';

try {
  const db = new Database('./data/college.db');
  
  // Get faculty records
  const faculty = db.prepare('SELECT * FROM faculty ORDER BY id DESC LIMIT 1').all();
  console.log('\n=== FACULTY RECORDS ===');
  console.log('Total faculty:', faculty.length);
  
  if (faculty.length > 0) {
    const f = faculty[0];
    console.log(`Last faculty: ID=${f.id}, Name=${f.name}`);
    
    // Try to delete it
    console.log(`\nAttempting to delete faculty ID: ${f.id}`);
    const result = db.prepare('DELETE FROM faculty WHERE id = ?').run(f.id);
    console.log('Delete result:', result);
    console.log('Changes:', result.changes);
    
    // Verify deletion
    const remaining = db.prepare('SELECT COUNT(*) as count FROM faculty').all();
    console.log('Remaining faculty:', remaining[0].count);
  } else {
    console.log('No faculty records found');
  }
  
  db.close();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
