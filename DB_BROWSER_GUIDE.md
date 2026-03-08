# DB Browser for SQLite - Visual Guide

## Download & Installation

### Step 1: Download
Go to: https://sqlitebrowser.org/

Click "Download" button and select your OS:
- **Windows** → `DB.Browser.for.SQLite-x.x.x.exe`
- **macOS** → `DB.Browser.for.SQLite-x.x.x.dmg`
- **Linux** → Available via package managers

### Step 2: Install
Follow standard installation for your OS

### Step 3: Open Application
- Windows: Search "DB Browser" in Start menu
- macOS: Open Applications → DB Browser
- Linux: Open from applications menu

## Opening Your Database

### In DB Browser:

**Step 1**: Click **"Open Database"** button
![Opens file dialog]

**Step 2**: Navigate to your project folder
```
C:\Users\YourName\Projects\speak2campus\
# or
/Users/YourName/Projects/speak2campus/
# or
/home/username/Projects/speak2campus/
```

**Step 3**: Select **`speak2campus.db`**

**Step 4**: Click **"Open"**

## Understanding the Interface

### Main Tabs (Top)
1. **Structure** - See table definitions
2. **Browse Data** - View & edit records (MOST USED)
3. **SQL Editor** - Write custom queries
4. **Execute SQL** - Run queries

## Viewing Data (Browse Data Tab)

### Step 1: Select Table
```
Left sidebar → Select table:
  - locations
  - faculty
  - events
  - timetable
  - admin_users
```

### Step 2: View Records
```
Each row = one record
Each column = one field
```

### Example: Locations Table
```
| id | name        | floor | building  | description     |
|----|-------------|-------|-----------|-----------------|
| 1  | Main Lab    | 2     | Block A   | Computer Lab    |
| 2  | Auditorium  | G     | Block B   | Large hall      |
| 3  | Library     | 1     | Block A   | Book collection |
```

## Editing Data

### Edit Existing Record

**Step 1**: Double-click on cell
```
Cell becomes editable
```

**Step 2**: Type new value
```
Edit the content
```

**Step 3**: Press Tab or Enter
```
Move to next cell
```

**Step 4**: Click "Write Changes" (bottom)
```
Saves to database
```

### Example: Update Faculty Email
```
1. Double-click email cell
2. Type: newemail@college.edu
3. Press Enter
4. Click "Write Changes"
✓ Email updated!
```

## Adding New Records

### Step 1: Select Table
```
Click table in sidebar (e.g., faculty)
```

### Step 2: Click "New Record"
```
Green "+" button appears in toolbar
Click it
```

### Step 3: Fill Fields
```
New row appears at bottom
Fill in each field:
  - name: Dr. John Smith
  - designation: Professor
  - email: john@college.edu
  - cabin: A-101
```

### Step 4: Save
```
Click "Write Changes"
✓ New record created!
```

## Writing SQL Queries

### Step 1: Go to "Execute SQL" Tab
```
Click "Execute SQL" at top
```

### Step 2: Write Query
```
Type SQL in text area:

SELECT * FROM faculty;
```

### Step 3: Execute
```
Click "Execute" button
Or press Ctrl+Enter
```

### Step 4: View Results
```
Results appear below
Each row = one result
```

## Common Queries

### View All Records
```sql
-- All locations
SELECT * FROM locations;

-- All faculty
SELECT * FROM faculty;

-- All events
SELECT * FROM events;

-- All timetable entries
SELECT * FROM timetable;
```

### Filter Records
```sql
-- Faculty in a specific cabin
SELECT * FROM faculty WHERE cabin = 'A-205';

-- Events after a date
SELECT * FROM events WHERE date > '2025-03-01';

-- Timetable for Monday
SELECT * FROM timetable WHERE day_of_week = 'Monday';

-- Locations in a building
SELECT * FROM locations WHERE building = 'Block A';
```

### Count Records
```sql
-- How many locations
SELECT COUNT(*) FROM locations;

-- How many faculty
SELECT COUNT(*) FROM faculty;

-- How many events
SELECT COUNT(*) AS total_events FROM events;
```

### Sort Data
```sql
-- Faculty sorted by name
SELECT * FROM faculty ORDER BY name;

-- Events sorted by date
SELECT * FROM events ORDER BY date DESC;

-- Locations by building then floor
SELECT * FROM locations ORDER BY building, floor;
```

### Search Data
```sql
-- Faculty containing 'John'
SELECT * FROM faculty WHERE name LIKE '%John%';

-- Events with 'Seminar' in name
SELECT * FROM events WHERE name LIKE '%Seminar%';

-- Cabin number contains '2'
SELECT * FROM faculty WHERE cabin LIKE '%2%';
```

## Adding Data via SQL

### Insert One Record
```sql
INSERT INTO locations (name, floor, building, description)
VALUES ('Room 101', '1', 'Block C', 'Lecture Hall');
```

### Insert Multiple Records
```sql
INSERT INTO faculty (name, designation, email, cabin)
VALUES 
  ('Dr. Sarah', 'Professor', 'sarah@college.edu', 'B-210'),
  ('Dr. Mike', 'Associate Professor', 'mike@college.edu', 'B-211'),
  ('Dr. Lisa', 'Assistant Professor', 'lisa@college.edu', 'B-212');
```

### Copy Data from Another Row
```sql
-- Create duplicate of faculty member (different ID)
INSERT INTO faculty (name, designation, email, cabin, specialization)
SELECT name, designation, email, cabin, specialization
FROM faculty WHERE id = 1;
```

## Modifying Data

### Update Records
```sql
-- Update one faculty member's email
UPDATE faculty SET email = 'john.doe@college.edu' WHERE id = 1;

-- Update multiple records
UPDATE locations SET building = 'Block D' WHERE building = 'Block C';

-- Add description to event
UPDATE events SET description = 'Annual tech fest' WHERE id = 1;
```

### Delete Records
```sql
-- Delete one record
DELETE FROM events WHERE id = 3;

-- Delete multiple records
DELETE FROM timetable WHERE day_of_week = 'Friday';

-- Clear entire table (be careful!)
DELETE FROM locations;
```

## Table Structure (Schema)

### View Table Structure
```
1. Go to "Structure" tab
2. Select table from left
3. See all columns and types
```

### Locations Table
```
Column       | Type    | Constraints
-------------|---------|-------------
id           | INTEGER | PRIMARY KEY
name         | TEXT    | NOT NULL
floor        | TEXT    | 
building     | TEXT    | NOT NULL
description  | TEXT    |
createdAt    | TEXT    |
updatedAt    | TEXT    |
```

### Faculty Table
```
Column          | Type    | Constraints
----------------|---------|-------------
id              | INTEGER | PRIMARY KEY
name            | TEXT    | NOT NULL
designation     | TEXT    | NOT NULL
specialization  | TEXT    |
email           | TEXT    |
cabin           | TEXT    |
createdAt       | TEXT    |
updatedAt       | TEXT    |
```

### Events Table
```
Column       | Type    | Constraints
-------------|---------|-------------
id           | INTEGER | PRIMARY KEY
name         | TEXT    | NOT NULL
date         | TEXT    | NOT NULL
description  | TEXT    |
venue        | TEXT    |
createdAt    | TEXT    |
updatedAt    | TEXT    |
```

### Timetable Table
```
Column      | Type    | Constraints
------------|---------|------------------
id          | INTEGER | PRIMARY KEY
day_of_week | TEXT    | NOT NULL
time        | TEXT    | NOT NULL
subject     | TEXT    | NOT NULL
faculty_id  | INTEGER | FK to faculty(id)
room        | TEXT    |
createdAt   | TEXT    |
updatedAt   | TEXT    |
```

## Useful Features

### Find & Replace
```
Ctrl+H (or Cmd+H on Mac)
Search for text in all records
Replace with new text
```

### Sort Columns
```
Click column header
Ascending: First click
Descending: Second click
None: Third click
```

### Export Data
```
Right-click table
Export → CSV, JSON, etc.
Save to file
```

### Import Data
```
File → Import → CSV/JSON
Select file
Map columns
Import
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+O | Open database |
| Ctrl+S | Save changes |
| Ctrl+E | Execute SQL |
| F5 | Refresh |
| Delete | Delete selected record |
| Escape | Cancel edit |

## Tips & Tricks

### Tip 1: Always Write Changes
```
After editing, ALWAYS click "Write Changes"
Or changes will be lost!
```

### Tip 2: Backup Before Major Changes
```
File → Export → Database Structure + Data
Save to ZIP
```

### Tip 3: Use Filters
```
Right side → Filter options
Narrow down displayed records
```

### Tip 4: Column Width
```
Drag column header edge
Resize columns
```

### Tip 5: Freeze Columns
```
Right-click column header
"Freeze columns"
```

## Troubleshooting

### Database Locked
```
Close other connections
Restart DB Browser
Try again
```

### Can't Find speak2campus.db
```
Make sure project is in /root
Run: npm run dev
This creates the file
Then open in DB Browser
```

### Changes Not Saving
```
Click "Write Changes" button!
Don't just close the window
```

### SQL Error
```
Check syntax
Use Execute SQL tab instead
Click ? button for help
```

## Practice Exercise

Try this:

1. Open your database
2. Go to Faculty table
3. Add new faculty:
   - Name: Dr. Practice
   - Designation: Professor
   - Email: practice@college.edu
   - Cabin: Z-999
4. Go to Execute SQL
5. Run:
   ```sql
   SELECT * FROM faculty WHERE name LIKE '%Practice%';
   ```
6. Should show your new record

Done! You're ready to use DB Browser!

## Next Steps

1. Browse all tables
2. Add sample data
3. Write some queries
4. Edit existing records
5. Delete test records

For more help: https://sqlitebrowser.org/docs/
