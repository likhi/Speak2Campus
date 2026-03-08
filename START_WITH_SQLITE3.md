# 🚀 Complete Instructions to Run Project with SQLite3

## Pre-Requirements
- Node.js (v18 or higher)
- npm or yarn
- 5 minutes of your time

## Step-by-Step Instructions

### Step 1: Clean Install Dependencies
```bash
# Navigate to project directory
cd /path/to/your/project

# Clean install (removes old dependencies)
npm ci --legacy-peer-deps
# OR just
npm install
```

**Expected Output:**
```
added XXX packages in XXXs
```

### Step 2: Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 16.0.10
  - Local:        http://localhost:3000
  
  [v0] SQLite3 database path: /path/to/your/project/speak2campus.db
  [v0] SQLite3 tables initialized
```

### Step 3: Open in Browser
- Navigate to: **http://localhost:3000**
- Your app should load successfully!

### Step 4: Verify Database Created
Check your project root directory - you should see:
- `speak2campus.db` ← Main database file
- `speak2campus.db-shm` ← Shared memory (ignore, auto-created)
- `speak2campus.db-wal` ← Write-ahead log (ignore, auto-created)

## How to Access & Modify Database

### Method 1: DB Browser GUI (EASIEST - Recommended!)

#### 1. Download DB Browser
- Visit: https://sqlitebrowser.org/
- Click "Download"
- Choose your operating system (Windows/Mac/Linux)
- Install it

#### 2. Open Your Database
```
1. Launch "DB Browser for SQLite"
2. Click "Open Database" button
3. Navigate to your project folder
4. Select "speak2campus.db"
5. Click "Open"
```

#### 3. View Your Data
```
1. Click "Browse Data" tab
2. Select table from dropdown:
   - locations
   - faculty
   - events
   - timetable
3. See all records in grid view
```

#### 4. Modify Data
```
1. Click on any cell to edit
2. Change value
3. Press Enter
4. Click "Write Changes" button
5. Data is saved!
```

#### 5. Add New Records
```
1. Select table
2. Click "New Record" button
3. Fill in values
4. Click "Write Changes"
```

#### 6. Write SQL Queries
```
1. Go to "Execute SQL" tab
2. Type your query:
   
   SELECT * FROM faculty;
   SELECT * FROM events WHERE name LIKE '%seminar%';
   DELETE FROM events WHERE id = 5;
   
3. Click "Execute"
4. See results below
```

### Method 2: Command Line (Terminal)

#### Check if SQLite is installed
```bash
sqlite3 --version
```

#### Open database in terminal
```bash
sqlite3 speak2campus.db
```

#### SQLite Commands
```sql
-- Show all tables
.tables

-- Show table structure
.schema locations
.schema faculty
.schema events
.schema timetable

-- View all records
SELECT * FROM locations;
SELECT * FROM faculty;
SELECT * FROM events;
SELECT * FROM timetable;

-- View specific record
SELECT * FROM faculty WHERE id = 1;

-- Count records
SELECT COUNT(*) FROM locations;

-- Insert new data
INSERT INTO locations (name, floor, building, description) 
VALUES ('Main Lab', '2', 'Block A', 'Computer Lab');

-- Update data
UPDATE faculty SET email = 'newemail@college.edu' WHERE id = 1;

-- Delete data
DELETE FROM events WHERE id = 5;

-- Exit
.exit
```

### Method 3: VS Code Extension

#### Install Extension
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search: "SQLite"
4. Install "SQLite" by alexcvzz

#### Use It
1. Click SQLite icon in sidebar
2. Click "+Database"
3. Select `speak2campus.db`
4. Click on database to browse
5. Write queries in editor

## Add Sample Data via API

### Using curl (Terminal)

**Add a Location:**
```bash
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Library",
    "floor": "2",
    "building": "Block A",
    "description": "Central library with 5000+ books"
  }'
```

**Add Faculty Member:**
```bash
curl -X POST http://localhost:3000/api/faculty \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Rajesh Kumar",
    "designation": "Professor",
    "specialization": "Computer Science",
    "email": "rajesh@college.edu",
    "cabin": "A-205"
  }'
```

**Add Event:**
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Annual Hackathon",
    "date": "2025-03-15",
    "description": "24-hour coding competition",
    "venue": "Main Lab"
  }'
```

**Add Timetable Entry:**
```bash
curl -X POST http://localhost:3000/api/timetable \
  -H "Content-Type: application/json" \
  -d '{
    "day_of_week": "Monday",
    "time": "10:00 AM",
    "subject": "Data Structures",
    "faculty_id": 1,
    "room": "Lab-101"
  }'
```

**View All Data:**
```bash
curl http://localhost:3000/api/locations
curl http://localhost:3000/api/faculty
curl http://localhost:3000/api/events
curl http://localhost:3000/api/timetable
```

### Using Postman (GUI)

1. Download Postman from https://www.postman.com/
2. Create new Request
3. Set method to POST
4. URL: http://localhost:3000/api/locations
5. Body → Raw → JSON
6. Paste:
```json
{
  "name": "Main Library",
  "floor": "2",
  "building": "Block A",
  "description": "Central library"
}
```
7. Click Send

## Admin Login

Access admin panel at: http://localhost:3000/admin/login

**Credentials:**
- **Email**: admin@seshadripuram.edu
- **Password**: admin123

## Common Issues & Fixes

### Issue: "Cannot find module better-sqlite3"
```bash
# Solution:
npm install
npm run dev
```

### Issue: Database file not found
```bash
# Solution: Just run dev - it creates the file
npm run dev
```

### Issue: "SQLITE_CANTOPEN: unable to open database file"
```bash
# Solution: Check file permissions
ls -la speak2campus.db
chmod 644 speak2campus.db
```

### Issue: "Module not found: @/lib/sqlite"
```bash
# This is already fixed - the file exists
# Just run: npm install && npm run dev
```

## Backup Your Database

```bash
# Simple copy (best method)
cp speak2campus.db speak2campus.backup.db

# Or from within SQLite
sqlite3 speak2campus.db ".backup 'speak2campus.backup.db'"
```

## Project Structure

```
project-root/
├── speak2campus.db          ← Your SQLite database (Created automatically)
├── app/
│   ├── api/
│   │   ├── locations/
│   │   ├── faculty/
│   │   ├── events/
│   │   └── timetable/
│   └── page.tsx
├── lib/
│   ├── sqlite.ts            ← SQLite connection (NEW)
│   └── db-client.ts
├── package.json             ← Updated with better-sqlite3
├── SQLITE3_SETUP_GUIDE.md   ← Full documentation
├── SQLITE3_QUICKSTART.md    ← Quick reference
└── START_WITH_SQLITE3.md    ← This file
```

## Troubleshooting Video

If you get stuck:
1. Read: `/SQLITE3_SETUP_GUIDE.md`
2. Search issue in browser

## Final Checklist

- [ ] Ran `npm install` successfully
- [ ] Project starts with `npm run dev`
- [ ] Can access http://localhost:3000
- [ ] Database file `speak2campus.db` exists
- [ ] Can open database in DB Browser
- [ ] Can see tables: locations, faculty, events, timetable
- [ ] Can add data via API
- [ ] Admin login works with provided credentials
- [ ] Database shows data added via API

## Success! 🎉

If all checkboxes are done, your project is fully migrated to SQLite3 and ready to use!

## Need Help?

1. **Full Setup Guide**: Read `SQLITE3_SETUP_GUIDE.md`
2. **Migration Details**: Read `MONGODB_TO_SQLITE3_MIGRATION.md`
3. **Quick Reference**: Read `SQLITE3_QUICKSTART.md`
4. **DB Browser Help**: https://sqlitebrowser.org/docs/

## Your Next Steps

1. Add sample data using DB Browser or API
2. Explore the admin panel
3. Modify data as needed
4. Backup your database regularly

Enjoy your SQLite3 setup!
