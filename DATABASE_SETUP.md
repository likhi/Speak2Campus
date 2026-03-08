# Database Setup Guide

This project now uses a persistent SQLite database instead of an in-memory database. The database will persist data between application restarts.

## Database Location

The SQLite database file is located at: `data/college.db`

## Manual Database Setup

### Option 1: Automatic Setup (Recommended)

Run the database initialization script:

```bash
npm run db:init
```

This will:
- Create the `data` directory if it doesn't exist
- Create the SQLite database file
- Execute the setup script to create tables and insert sample data

### Option 2: Reset Database

To completely reset the database (delete all data and recreate):

```bash
npm run db:reset
```

**Warning:** This will delete the existing database file and all data.

## Database Schema

The database contains the following tables:

- `locations` - Campus locations and facilities
- `faculty` - Faculty members information
- `timetable` - Class schedules (supports 1st Year and 2nd Year)
- `events` - College events
- `admin_users` - Admin user accounts (for future use)

## Key Changes from In-Memory Database

1. **Persistence**: Data is now stored in a file and persists between application restarts
2. **Performance**: Uses SQLite with WAL mode for better concurrent access
3. **Data Types**: Changed from UUID to INTEGER PRIMARY KEY AUTOINCREMENT for simplicity
4. **Timestamps**: Uses SQLite's CURRENT_TIMESTAMP instead of PostgreSQL functions

## API Compatibility

The existing API endpoints remain unchanged. The database functions (`runAsync`, `getAsync`, `allAsync`) maintain the same interface.

## Development Workflow

1. **First Time Setup**: Run `npm run db:init` to create the database
2. **Development**: Run `npm run dev` as usual - the database will be automatically connected
3. **Data Changes**: Modify `scripts/setup-database.sql` and run `npm run db:reset` to apply changes

## Troubleshooting

- **Database file not found**: Run `npm run db:init`
- **Permission errors**: Ensure the application has write access to the `data` directory
- **Corrupted database**: Delete `data/college.db` and run `npm run db:init`

## Migration from In-Memory Database

If you were using the previous in-memory database:
1. Run `npm run db:init` to create the persistent database
2. All existing API calls will work without changes
3. Data will now persist between restarts