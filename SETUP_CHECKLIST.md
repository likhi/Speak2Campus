# SQLite3 Setup Checklist

## 🎯 Getting Started

### Installation Phase
- [ ] Clone/Extract project
- [ ] Open terminal in project root
- [ ] Run: `npm install`
- [ ] Wait for completion (should say "added X packages")

### Running Project
- [ ] Run: `npm run dev`
- [ ] Wait for server to start
- [ ] Look for messages:
  - `[v0] SQLite3 database path: ...`
  - `[v0] SQLite3 tables initialized`
- [ ] Verify: `Next.js X.X.X`
- [ ] Project running on http://localhost:3000

### Database Verification
- [ ] Check project root directory
- [ ] Look for file: `speak2campus.db` ← This is your database!
- [ ] File size: Should be small (< 1 MB for new database)

### Browser Access
- [ ] Open: http://localhost:3000
- [ ] Page loads successfully
- [ ] No console errors (press F12 to check)

---

## 📊 Database Access Setup

### Option 1: DB Browser (RECOMMENDED - Easiest!)
- [ ] Go to: https://sqlitebrowser.org/
- [ ] Download for your OS
- [ ] Install application
- [ ] Launch "DB Browser for SQLite"
- [ ] Click "Open Database"
- [ ] Navigate to project folder
- [ ] Select `speak2campus.db`
- [ ] Click "Open"
- [ ] See tables in left sidebar ✓

### Option 2: Command Line
- [ ] Open terminal
- [ ] Run: `sqlite3 speak2campus.db`
- [ ] Run: `.tables`
- [ ] Should see: `locations faculty events timetable admin_users`
- [ ] Run: `SELECT * FROM locations;`
- [ ] Run: `.exit` to quit

### Option 3: VS Code Extension
- [ ] Open VS Code
- [ ] Go to Extensions (Ctrl+Shift+X)
- [ ] Search: "SQLite"
- [ ] Install: "SQLite" by alexcvzz
- [ ] Click SQLite icon in sidebar
- [ ] Select `speak2campus.db`
- [ ] Browse tables

---

## ➕ Adding Sample Data

### Method 1: DB Browser GUI (Easiest!)
- [ ] Open DB Browser
- [ ] Select table (e.g., "locations")
- [ ] Click "New Record" button
- [ ] Fill in values
- [ ] Click "Write Changes"
- [ ] Verify record appears

### Method 2: Using curl Commands
- [ ] Open terminal/command prompt
- [ ] Run: 
  ```bash
  curl -X POST http://localhost:3000/api/locations \
    -H "Content-Type: application/json" \
    -d '{"name":"Lab 1","floor":"2","building":"Block A","description":"Computer Lab"}'
  ```
- [ ] Should return the created record with an ID

### Method 3: Direct SQL in DB Browser
- [ ] Open DB Browser
- [ ] Go to "Execute SQL" tab
- [ ] Run:
  ```sql
  INSERT INTO locations (name, floor, building, description)
  VALUES ('Room 101', '1', 'Block B', 'Classroom');
  ```
- [ ] Click "Execute"

---

## 🔐 Admin Access

### Login
- [ ] Open: http://localhost:3000/admin/login
- [ ] Email: `admin@seshadripuram.edu`
- [ ] Password: `admin123`
- [ ] Click "Login"
- [ ] Should see admin dashboard

### Admin Features
- [ ] Dashboard loads
- [ ] Navigation menu visible
- [ ] Can click on sections (Locations, Faculty, Events, Timetable)
- [ ] Can see data in each section

---

## ✅ Verification Tests

### Test 1: Database Connection
- [ ] Terminal shows: `[v0] SQLite3 tables initialized`
- [ ] No error messages about database

### Test 2: File Exists
- [ ] `speak2campus.db` visible in project root
- [ ] File size > 0 bytes

### Test 3: Tables Created
- [ ] In DB Browser or CLI:
  - [ ] `locations` table exists
  - [ ] `faculty` table exists
  - [ ] `events` table exists
  - [ ] `timetable` table exists
  - [ ] `admin_users` table exists

### Test 4: API Endpoints
- [ ] Test in browser or curl:
  - [ ] GET http://localhost:3000/api/locations (returns JSON)
  - [ ] GET http://localhost:3000/api/faculty (returns JSON)
  - [ ] GET http://localhost:3000/api/events (returns JSON)
  - [ ] GET http://localhost:3000/api/timetable (returns JSON)

### Test 5: Add Data via API
- [ ] POST to /api/locations with sample data
- [ ] Returns created record
- [ ] Can see it in DB Browser

### Test 6: Admin Login
- [ ] Can login with credentials
- [ ] Dashboard appears
- [ ] No errors

---

## 🆘 Troubleshooting Checklist

### Problem: Database file not found
- [ ] Did you run `npm run dev`?
- [ ] Check project root directory
- [ ] If still not there, check console for errors

### Problem: "Cannot find module 'better-sqlite3'"
- [ ] Run: `npm install` again
- [ ] Delete: `node_modules` folder
- [ ] Delete: `package-lock.json`
- [ ] Run: `npm install` again

### Problem: Port 3000 already in use
- [ ] Check what's using port 3000
- [ ] Kill the process or use different port
- [ ] Or restart your computer

### Problem: Can't open database in DB Browser
- [ ] Make sure DB Browser is installed
- [ ] Make sure `speak2cannabis.db` exists
- [ ] Try restarting DB Browser
- [ ] Check file permissions

### Problem: API returns error
- [ ] Check Node.js version: `node --version` (should be v18+)
- [ ] Check console errors in terminal
- [ ] Restart dev server: `npm run dev`

---

## 📋 Data Entry Checklist

### Add at least 1 of each:

#### Locations
- [ ] Name: e.g., "Main Lab"
- [ ] Floor: e.g., "2"
- [ ] Building: e.g., "Block A"
- [ ] Description: e.g., "Computer Lab"
- [ ] Saved successfully

#### Faculty
- [ ] Name: e.g., "Dr. John"
- [ ] Designation: e.g., "Professor"
- [ ] Specialization: e.g., "Computer Science"
- [ ] Email: e.g., "john@college.edu"
- [ ] Cabin: e.g., "A-205"
- [ ] Saved successfully

#### Events
- [ ] Name: e.g., "Hackathon"
- [ ] Date: e.g., "2025-03-01"
- [ ] Description: e.g., "24-hour coding event"
- [ ] Venue: e.g., "Main Lab"
- [ ] Saved successfully

#### Timetable
- [ ] Day: e.g., "Monday"
- [ ] Time: e.g., "10:00 AM"
- [ ] Subject: e.g., "Data Structures"
- [ ] Faculty ID: e.g., "1" (from faculty table)
- [ ] Room: e.g., "Lab-101"
- [ ] Saved successfully

---

## 📚 Documentation Review

Read these documents:
- [ ] README_SQLITE3.md (overview)
- [ ] START_WITH_SQLITE3.md (main setup guide)
- [ ] DB_BROWSER_GUIDE.md (if using GUI)
- [ ] SQLITE3_SETUP_GUIDE.md (for more details)

---

## 🎉 Final Checklist

- [ ] Project installed (`npm install` done)
- [ ] Project running (`npm run dev` successful)
- [ ] Database file exists (`speak2campus.db`)
- [ ] Can open database (DB Browser or CLI)
- [ ] Can view tables
- [ ] Can add/edit/delete data
- [ ] API endpoints working
- [ ] Admin login working
- [ ] Sample data added
- [ ] No error messages
- [ ] Ready for use! ✓

---

## 🚀 Quick Commands

### Install
```bash
npm install
```

### Run
```bash
npm run dev
```

### View Database (CLI)
```bash
sqlite3 speak2campus.db
```

### Backup Database
```bash
cp speak2campus.db speak2cannabis.backup.db
```

---

## 📞 When Complete

✓ All boxes checked?

**Congratulations!** Your SQLite3 setup is complete! 🎉

**Next Steps**:
1. Start using the application
2. Add more data as needed
3. Monitor database in DB Browser
4. Backup regularly

**Questions?** See documentation files listed above.

---

## ⏱️ Expected Time

- Installation: 2-3 minutes
- Setup: 5-10 minutes
- DB Browser download: 2 minutes
- Testing: 5 minutes
- **Total: 15-20 minutes**

---

## 📍 You Are Here

If all boxes are checked:
✓ You have a working SQLite3 database
✓ You can run the project
✓ You can manage the database
✓ You can add/view/edit data

**You're ready to go!** Start building! 💪
