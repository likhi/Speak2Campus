# SQLite3 Quick Start - Get Running in 2 Minutes!

## Step 1: Install
```bash
npm install
```

## Step 2: Run
```bash
npm run dev
```

Open http://localhost:3000

## Step 3: View Database

**Option A: Using DB Browser (Best for beginners)**
1. Download from https://sqlitebrowser.org/
2. Open `speak2campus.db` from your project folder
3. Browse tables and data
4. Edit directly in the interface

**Option B: Using Command Line**
```bash
sqlite3 speak2campus.db
```

Then:
```sql
SELECT * FROM locations;
SELECT * FROM faculty;
SELECT * FROM events;
SELECT * FROM timetable;
```

## Sample Data to Test

### Add Location
```bash
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{"name":"Room 101","floor":"1","building":"Block A","description":"Lab"}'
```

### Add Faculty
```bash
curl -X POST http://localhost:3000/api/faculty \
  -H "Content-Type: application/json" \
  -d '{"name":"Dr. John","designation":"Professor","specialization":"CS","email":"john@college.edu","cabin":"A-101"}'
```

### Add Event
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{"name":"Seminar","date":"2025-03-01","description":"Tech Talk","venue":"Auditorium"}'
```

### View All Locations
```bash
curl http://localhost:3000/api/locations
```

## Database Files
- **Main DB**: `speak2campus.db` (in project root)
- **Backup**: `speak2campus.db-shm` and `speak2campus.db-wal` (auto-created, don't delete)

## Admin Login
- **Email**: admin@seshadripuram.edu
- **Password**: admin123

## Need More Details?
Read: `/SQLITE3_SETUP_GUIDE.md` for complete documentation
