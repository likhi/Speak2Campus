# SQLite3 Complete Setup Guide

## Overview
Your project has been migrated from MongoDB to SQLite3. SQLite3 is a lightweight, file-based database that's perfect for local development and small to medium-scale applications.

## What Changed
- **Database**: MongoDB → SQLite3 (better-sqlite3)
- **API Routes**: All updated to use SQLite3 queries
- **Database Module**: New `/lib/sqlite.ts` replaces MongoDB connection
- **Package.json**: Removed MongoDB dependencies, added better-sqlite3

## Installation & Setup

### Step 1: Install Dependencies
```bash
npm install
```

This will install `better-sqlite3` which is already added to package.json.

### Step 2: Start Development Server
```bash
npm run dev
```

The project will automatically create a SQLite3 database file named `speak2campus.db` in your project root directory.

### Step 3: Verify Database Creation
After running the dev server, you should see in console:
```
[v0] SQLite3 database path: /path/to/your/project/speak2campus.db
[v0] SQLite3 tables initialized
```

## Database Structure

### Tables Created Automatically
When the app starts, these tables are created:

#### 1. **locations** Table
```sql
id (INTEGER PRIMARY KEY)
name (TEXT NOT NULL)
floor (TEXT)
building (TEXT NOT NULL)
description (TEXT)
createdAt (TEXT)
updatedAt (TEXT)
```

#### 2. **faculty** Table
```sql
id (INTEGER PRIMARY KEY)
name (TEXT NOT NULL)
designation (TEXT NOT NULL)
specialization (TEXT)
email (TEXT)
cabin (TEXT)
createdAt (TEXT)
updatedAt (TEXT)
```

#### 3. **events** Table
```sql
id (INTEGER PRIMARY KEY)
name (TEXT NOT NULL)
date (TEXT NOT NULL)
description (TEXT)
venue (TEXT)
createdAt (TEXT)
updatedAt (TEXT)
```

#### 4. **timetable** Table
```sql
id (INTEGER PRIMARY KEY)
day_of_week (TEXT NOT NULL)
time (TEXT NOT NULL)
subject (TEXT NOT NULL)
faculty_id (INTEGER) - FK to faculty.id
room (TEXT)
createdAt (TEXT)
updatedAt (TEXT)
```

#### 5. **admin_users** Table
```sql
id (INTEGER PRIMARY KEY)
username (TEXT NOT NULL UNIQUE)
passwordHash (TEXT NOT NULL)
createdAt (TEXT)
```

## How to Open & Modify Database

### Option 1: Using DB Browser for SQLite (Recommended - GUI)

**Download & Install:**
- Visit: https://sqlitebrowser.org/
- Download for your OS
- Install it

**Open Your Database:**
1. Launch DB Browser for SQLite
2. Click "Open Database"
3. Navigate to your project root
4. Select `speak2campus.db`
5. Click "Open"

**View Data:**
- Go to the "Browse Data" tab
- Select table from dropdown (locations, faculty, events, timetable)
- View all records

**Add Data Manually:**
1. Select table
2. Click "New Record"
3. Fill in values
4. Click "Write Changes"

**Query Data:**
1. Go to "Execute SQL" tab
2. Write SQL queries:
```sql
-- View all locations
SELECT * FROM locations;

-- View all faculty
SELECT * FROM faculty;

-- View all events
SELECT * FROM events;

-- View all timetable entries
SELECT * FROM timetable;

-- Add sample data
INSERT INTO locations (name, floor, building, description) 
VALUES ('Library', '2', 'Main', 'Central Library');
```

### Option 2: Using VS Code Extension

1. Install "SQLite" extension by alexcvzz
2. In VS Code Explorer, you'll see a SQLite panel
3. Click on `speak2campus.db`
4. Browse tables
5. Write queries directly

### Option 3: Using Command Line

**Check if SQLite3 is installed:**
```bash
sqlite3 --version
```

**Open database:**
```bash
sqlite3 speak2campus.db
```

**View all tables:**
```sql
.tables
```

**View table schema:**
```sql
.schema locations
.schema faculty
.schema events
.schema timetable
```

**Query data:**
```sql
SELECT * FROM locations;
SELECT * FROM faculty;
SELECT * FROM events;
```

**Insert sample data:**
```sql
INSERT INTO locations (name, floor, building, description) 
VALUES ('Room 101', '1', 'Engineering', 'Programming Lab');

INSERT INTO faculty (name, designation, specialization, email, cabin)
VALUES ('Dr. John', 'Professor', 'Computer Science', 'john@college.edu', 'A-205');

INSERT INTO events (name, date, description, venue)
VALUES ('Tech Summit', '2025-02-15', 'Annual tech conference', 'Main Hall');

INSERT INTO timetable (day_of_week, time, subject, faculty_id, room)
VALUES ('Monday', '10:00', 'Data Structures', 1, 'Lab-1');
```

**Exit:**
```sql
.exit
```

## API Usage

### Add Location
```bash
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Auditorium",
    "floor": "G",
    "building": "Main",
    "description": "Large auditorium"
  }'
```

### Get All Locations
```bash
curl http://localhost:3000/api/locations
```

### Add Faculty
```bash
curl -X POST http://localhost:3000/api/faculty \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Sarah",
    "designation": "Associate Professor",
    "specialization": "AI/ML",
    "email": "sarah@college.edu",
    "cabin": "B-310"
  }'
```

### Get All Faculty
```bash
curl http://localhost:3000/api/faculty
```

### Add Event
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hackathon",
    "date": "2025-03-01",
    "description": "24-hour coding challenge",
    "venue": "Labs"
  }'
```

### Get All Events
```bash
curl http://localhost:3000/api/events
```

### Add Timetable Entry
```bash
curl -X POST http://localhost:3000/api/timetable \
  -H "Content-Type: application/json" \
  -d '{
    "day_of_week": "Monday",
    "time": "14:00",
    "subject": "Web Development",
    "faculty_id": 1,
    "room": "Computer Lab"
  }'
```

### Get Timetable
```bash
# Get all timetable
curl http://localhost:3000/api/timetable

# Get timetable for specific day
curl http://localhost:3000/api/timetable?day=Monday
```

## Important Notes

1. **Database File Location**: `speak2campus.db` is created in your project root
2. **Backup**: Always backup your database before making major changes
3. **Concurrent Access**: SQLite3 can handle multiple connections but is not ideal for high concurrency
4. **File Size**: SQLite3 works well for databases up to several GB
5. **No Server Needed**: Unlike MongoDB, SQLite3 doesn't need a separate server

## Sample Data Setup Script

You can create a script to populate sample data. Create `/scripts/populate-sqlite.js`:

```javascript
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'speak2campus.db');
const db = new Database(dbPath);

// Insert sample locations
db.prepare(`
  INSERT INTO locations (name, floor, building, description) 
  VALUES (?, ?, ?, ?)
`).run('Library', '2', 'Main Block', 'Central Library');

db.prepare(`
  INSERT INTO locations (name, floor, building, description) 
  VALUES (?, ?, ?, ?)
`).run('Auditorium', 'Ground', 'Main Block', 'Large Auditorium');

// Insert sample faculty
db.prepare(`
  INSERT INTO faculty (name, designation, specialization, email, cabin)
  VALUES (?, ?, ?, ?, ?)
`).run('Dr. John Smith', 'Professor', 'Computer Science', 'john@college.edu', 'A-205');

db.prepare(`
  INSERT INTO faculty (name, designation, specialization, email, cabin)
  VALUES (?, ?, ?, ?, ?)
`).run('Dr. Sarah Jane', 'Associate Professor', 'Database Systems', 'sarah@college.edu', 'B-310');

console.log('Sample data inserted successfully');
db.close();
```

Run it with:
```bash
node scripts/populate-sqlite.js
```

## Troubleshooting

### Issue: Database file not found
**Solution**: Run `npm run dev` first to create the database

### Issue: "Cannot find module 'better-sqlite3'"
**Solution**: Run `npm install` again

### Issue: "Database is locked"
**Solution**: Close other connections to the database. SQLite3 has a timeout mechanism.

### Issue: Permission denied
**Solution**: Check file permissions in your project directory

## Backup Your Database

```bash
# Simple copy
cp speak2campus.db speak2campus.backup.db

# Or using SQLite
sqlite3 speak2campus.db ".backup 'speak2campus.backup.db'"
```

## Next Steps

1. Start your dev server: `npm run dev`
2. The database will be created automatically
3. Use the admin panel to add data
4. Or use the API endpoints
5. Open `speak2campus.db` in DB Browser to view/modify data

Your project is now ready to use with SQLite3!
