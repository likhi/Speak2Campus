# SQLite3 Setup - Simple Guide

## Your Question Answered

**Q: Is the database created automatically?**
**A: YES! The file `speak2campus.db` is created automatically when you run the project.**

---

## Step 1: Install Dependencies

```bash
npm install
```

This downloads all packages including SQLite3. Just wait for it to complete.

---

## Step 2: Run the Project

```bash
npm run dev
```

This starts your app on `http://localhost:3000`

**The database file `speak2campus.db` will be created automatically in your project folder.**

---

## Step 3: Access the Database

### Option A: DB Browser (EASIEST - Visual Interface)

1. Download DB Browser: https://sqlitebrowser.org/ (free, all OS)
2. Open the app
3. Click: File → Open → Select `speak2campus.db`
4. You can now:
   - View tables
   - Add/edit data
   - Run SQL queries
   - Export data

### Option B: Command Line

```bash
sqlite3 speak2campus.db
```

Then type commands like:
```sql
SELECT * FROM locations;
INSERT INTO locations (name, building, floor) VALUES ('Library', 'Main', '2');
```

Type `.exit` to quit.

---

## Database Location

- **Path:** Your project root folder
- **Filename:** `speak2campus.db`
- **Size:** Starts at ~100KB (grows as you add data)

You can see it in your file explorer next to `package.json`.

---

## Tables Created Automatically

1. `locations` - Building locations
2. `faculty` - Teacher information  
3. `events` - Campus events
4. `timetable` - Class schedule
5. `admin_users` - Admin login info

---

## Quick Test

1. Run: `npm run dev`
2. Open: `http://localhost:3000`
3. Admin login: `http://localhost:3000/admin/login`
   - Email: `admin@seshadripuram.edu`
   - Password: `admin123`
4. Add some data through the admin panel
5. Open DB Browser and refresh to see the data!

---

## That's It!

The database works automatically. Just:
- `npm install`
- `npm run dev`
- Use DB Browser to manage data
- Or access through the admin panel at `/admin/login`

**No configuration needed. No external database required.**

---

## Troubleshooting

**Q: I don't see `speak2campus.db` file?**
A: Run `npm run dev` first. It's created when you start the app.

**Q: I want to delete and start fresh?**
A: Delete `speak2campus.db` file. It will be recreated when you run the app.

**Q: Can I download the database?**
A: Yes! The `speak2campus.db` file is just a regular file. Copy it from your project folder.

**Q: How do I back it up?**
A: Copy `speak2campus.db` to another location. That's it!

---

## Admin Credentials

- **Email:** admin@seshadripuram.edu
- **Password:** admin123

Visit: `http://localhost:3000/admin/login`

---

## Need More Help?

- DB Browser Guide: Read `DB_BROWSER_GUIDE.md`
- Complete Guide: Read `START_WITH_SQLITE3.md`
- Technical Details: Read `SQLITE3_SETUP_GUIDE.md`

**Done!** You're ready to use SQLite3 with your project.
