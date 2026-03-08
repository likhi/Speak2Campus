# SPEAK2CAMPUS - Assistant Ready to Work!

## Current Status: FULLY CONFIGURED

Your MongoDB URI is now properly configured:
- **MongoDB URI**: Set in `.env.local`
- **Database**: `speak2campus`
- **Collections**: faculty, locations, events, timetable

## Environment Configuration

The `.env.local` file contains:
\`\`\`
MONGODB_URI=mongodb+srv://dslikhitha08_db_user:iv4wTb6ZT0Y7tuFd@sctmca.x2ntymk.mongodb.net/speak2campus?appName=sctmca
MONGODB_DB=speak2campus
\`\`\`

## How to Run

\`\`\`bash
npm install
npm run dev
\`\`\`

Then open: `http://localhost:3000`

## Using the Assistant

### Voice Mode
1. Click the microphone button (bottom-left)
2. Ask questions like:
   - "Tell me about faculty"
   - "Where is the computer lab?"
   - "What's my schedule for Monday?"
   - "What events are coming up?"

### Text Mode
1. Type your question in the input field
2. Press Send button or Enter

## Adding Data

### Option 1: Admin Dashboard
1. Go to `http://localhost:3000` (main page)
2. Click "Admin" button (bottom-right corner)
3. Login: `admin` / `admin`
4. Use the forms to add Faculty, Locations, Events, and Timetable

### Option 2: Direct API Calls
\`\`\`javascript
// Add Faculty
POST /api/faculty
{
  "name": "Dr. John Smith",
  "designation": "Associate Professor",
  "specialization": "Web Development",
  "email": "john@college.edu",
  "cabin": "Room 301"
}

// Add Location
POST /api/locations
{
  "name": "Computer Lab",
  "building": "Building A",
  "floor": "2nd Floor",
  "description": "Main computer lab for students"
}

// Add Event
POST /api/events
{
  "name": "Tech Seminar",
  "date": "2024-02-15",
  "venue": "Auditorium",
  "description": "Industry expert talk"
}

// Add Timetable
POST /api/timetable
{
  "day_of_week": "Monday",
  "time": "10:00 AM",
  "subject": "Database Design",
  "faculty_id": "Faculty Name",
  "room": "Lab-1"
}
\`\`\`

## Testing MongoDB Connection

1. Open: `http://localhost:3000/api/test-mongodb`
2. Should return:
\`\`\`json
{
  "success": true,
  "message": "MongoDB connection successful",
  "database": "speak2campus"
}
\`\`\`

If you see an error, check:
- `.env.local` file exists
- `MONGODB_URI` is set correctly
- MongoDB cluster is active

## Voice Assistant Features

- **Faculty Lookup**: "Tell me about [faculty name]"
- **Location Finder**: "Where is [location name]?"
- **Schedule Check**: "What's on Monday?" or "Show me my timetable"
- **Event Info**: "What events are coming?" or "Tell me about events"
- **Auto-speak**: Assistant speaks responses aloud

## Troubleshooting

### "MONGODB_URI is not set" Error
**Fix**: Restart the development server
\`\`\`bash
# Stop: Press Ctrl+C
# Start: npm run dev
\`\`\`

### "Database connection failed"
Check if:
1. `.env.local` file exists in project root
2. `MONGODB_URI` is correct
3. MongoDB cluster is active (check Atlas dashboard)

### Assistant returns no data
1. Make sure data exists in MongoDB
2. Use Admin dashboard to add test data
3. Check browser console for errors (press F12)

### Voice not working
- Use Chrome or Edge browser
- Grant microphone permission
- Check system volume is on
- Fall back to typing if voice not available

## Database Schema

### Faculty Collection
\`\`\`json
{
  "_id": "ObjectId",
  "name": "String",
  "designation": "String",
  "specialization": "String",
  "email": "String",
  "cabin": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
\`\`\`

### Locations Collection
\`\`\`json
{
  "_id": "ObjectId",
  "name": "String",
  "building": "String",
  "floor": "String",
  "description": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
\`\`\`

### Events Collection
\`\`\`json
{
  "_id": "ObjectId",
  "name": "String",
  "date": "String",
  "venue": "String",
  "description": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
\`\`\`

### Timetable Collection
\`\`\`json
{
  "_id": "ObjectId",
  "day_of_week": "String",
  "time": "String",
  "subject": "String",
  "faculty_id": "String",
  "room": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
\`\`\`

## Next Steps

1. **Run the project**: `npm run dev`
2. **Add test data**: Use Admin dashboard
3. **Test assistant**: Ask questions on main page
4. **Deploy**: Use `npm run build && npm start`

## Features Working

- Voice input and output (text-to-speech)
- MongoDB CRUD operations
- Admin dashboard with forms
- Real-time data fetching
- Error handling with detailed messages
- Quick action buttons
- Chat history

Your assistant is fully configured and ready to work!
