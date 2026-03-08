# SPEAK2CAMPUS Database Management Guide

## Overview

Your SPEAK2CAMPUS application now has a full database backend powered by Supabase. You can easily manage all college data through the admin dashboard.

---

## Accessing the Admin Dashboard

1. Run your application: `npm run dev`
2. Go to: `http://localhost:3000/admin`
3. You'll see tabs for managing:
   - **Locations** - Campus buildings, labs, offices
   - **Faculty** - Staff members and their details
   - **Timetable** - Class schedules
   - **Events** - Upcoming college events

---

## Adding Data

### Adding a Location

1. Click the **Locations** tab
2. Fill in the form:
   - **Location Name**: e.g., "MCA Lab 2"
   - **Floor**: e.g., "2nd Floor"
   - **Building**: e.g., "Tech Block"
   - **Description**: e.g., "Advanced programming lab with modern workstations"
3. Click **Add Location**
4. Done! The location is now in your database

### Adding a Faculty Member

1. Click the **Faculty** tab
2. Fill in the form:
   - **Name**: e.g., "Dr. Ramesh Kumar"
   - **Designation**: e.g., "Associate Professor"
   - **Specialization**: e.g., "Machine Learning"
   - **Email**: e.g., "ramesh@college.edu"
   - **Cabin/Office**: e.g., "Room 205"
3. Click **Add Faculty**
4. The faculty member is now searchable in the voice assistant

### Adding a Timetable Entry

1. Click the **Timetable** tab
2. Fill in the form:
   - **Day**: Select Monday-Friday
   - **Time**: e.g., "10:00" (24-hour format)
   - **Subject**: e.g., "Data Structures"
   - **Faculty**: e.g., "Dr. Ramesh Kumar"
   - **Room**: e.g., "Lab 1"
3. Click **Add Timetable Entry**

### Adding an Event

1. Click the **Events** tab
2. Fill in the form:
   - **Event Name**: e.g., "Annual Symposium"
   - **Date**: Select the date
   - **Venue**: e.g., "Main Auditorium"
   - **Description**: e.g., "A day-long event showcasing student projects"
3. Click **Add Event**

---

## Voice Assistant Integration

Once you add data to the database, the voice assistant automatically learns about it. Try asking:

- "Where is the MCA Lab?"
- "Who is the head of department?"
- "Show me Monday's timetable"
- "What events are coming up?"
- "Tell me about Dr. Ramesh Kumar"

The assistant will respond with information from your database!

---

## Database Structure

### Locations Table
\`\`\`
- id: Unique identifier
- name: Location name
- floor: Floor information
- building: Building name
- description: Location details
\`\`\`

### Faculty Table
\`\`\`
- id: Unique identifier
- name: Faculty member name
- designation: Job title
- department: Department (e.g., MCA)
- specialization: Area of expertise
- email: Email address
- cabin: Office/cabin number
\`\`\`

### Timetable Table
\`\`\`
- id: Unique identifier
- day: Day of week (Monday-Friday)
- time: Class time
- subject: Subject name
- faculty: Faculty member name
- room: Room/lab number
\`\`\`

### Events Table
\`\`\`
- id: Unique identifier
- name: Event name
- date: Event date
- description: Event details
- venue: Event location
\`\`\`

---

## Tips

✅ **Use consistent naming** - If you enter "Dr. Ramesh Kumar" as faculty, use the same name in timetable entries

✅ **Use proper time format** - Use 24-hour format for timetable (e.g., 10:00 for 10 AM, 14:00 for 2 PM)

✅ **Make descriptions clear** - The assistant uses descriptions to give better responses

✅ **Keep data updated** - Regularly add new events, locations, and faculty information

---

## Troubleshooting

**Q: Data doesn't appear in the voice assistant immediately**
- A: The assistant fetches fresh data on each query. Try asking again.

**Q: I can't access the admin dashboard**
- A: Make sure your Supabase integration is connected and your environment variables are set correctly.

**Q: The form won't submit**
- A: Check that all required fields are filled in and have valid formats.

---

## Need Help?

For issues with:
- **Voice recognition**: Check browser compatibility (Chrome/Edge recommended)
- **Database**: Verify Supabase is connected in your project settings
- **Data not showing**: Try refreshing the page

Happy managing! 🎓
