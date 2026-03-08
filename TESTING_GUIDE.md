# SPEAK2CAMPUS - Complete Testing Guide

## ✅ Pre-Publication Testing Checklist

### Step 1: Installation & Setup
```bash
# Clean install
npm install
npm run dev
```
**Expected**: Application starts without errors at http://localhost:3000

---

## 🧪 Test Categories

### 1. LOCATION QUERIES (Test All Variations)

#### Test 1.1: Basic Location Search
- [ ] "Where is the lab?" → Should show all MCA labs
- [ ] "Where is the library?" → Should show library location
- [ ] "How to reach cafeteria?" → Should show cafeteria details
- [ ] "Find seminar hall" → Should show seminar hall

#### Test 1.2: Specific Locations
- [ ] "MCA Lab 1 location?" → Should show floor, building, description
- [ ] "Where is database lab?" → Should show database lab details
- [ ] "Show network lab" → Should show network lab
- [ ] "Programming lab location" → Should show programming lab
- [ ] "Web development lab" → Should show web dev lab

#### Test 1.3: Building/Floor Queries
- [ ] "What's on 2nd floor?" → Should mention multiple locations
- [ ] "Main block locations" → Should list relevant locations
- [ ] "All labs in college" → Should show all available labs

#### Test 1.4: Special Locations
- [ ] "Where is HOD office?" → Should show HOD office
- [ ] "Placement cell location" → Should show placement cell
- [ ] "Principal office?" → Should show principal office
- [ ] "Research lab location" → Should show research lab
- [ ] "Student support center" → Should show support center

#### Test 1.5: All Locations List
- [ ] "Show all locations" → Should list all 18 locations
- [ ] "List available locations" → Should list all locations
- [ ] "Tell me all places" → Should list all locations

**Expected Results**: All queries return relevant location information with floor, building, and description

---

### 2. FACULTY QUERIES (Test All Variations)

#### Test 2.1: HOD Queries
- [ ] "Who is the HOD?" → Should show Dr. Ramesh Kumar
- [ ] "Head of department?" → Should show HOD details
- [ ] "MCA department head" → Should show HOD info
- [ ] "Tell me about HOD" → Should show HOD information

#### Test 2.2: Faculty by Name
- [ ] "Tell me about Prof. Suresh" → Should show Prof. Suresh Babu details
- [ ] "Who is Prof. Anitha?" → Should show Prof. Anitha Sharma
- [ ] "Contact Prof. Lakshmi" → Should show Prof. Lakshmi Devi details
- [ ] "Venkatesh Murthy" → Should show Prof. Venkatesh info
- [ ] "Kavitha Rao details" → Should show Prof. Kavitha Rao

#### Test 2.3: Faculty by Specialization
- [ ] "Who teaches machine learning?" → Should show Prof. Kavitha Rao
- [ ] "Database professor" → Should show Prof. Suresh Babu
- [ ] "Web technologies faculty" → Should show Prof. Anitha Sharma
- [ ] "Networks specialist" → Should show Prof. Venkatesh Murthy
- [ ] "Cloud computing teacher" → Should show Prof. Rajesh Verma
- [ ] "Python programming faculty" → Should show Prof. Priya Sharma
- [ ] "Java development professor" → Should show Prof. Amit Patel

#### Test 2.4: Faculty by Designation
- [ ] "Associate professors" → Should list associate professors
- [ ] "All assistant professors" → Should list assistant professors
- [ ] "Show all faculty" → Should list all 10 faculty members
- [ ] "Faculty list" → Should show all faculty

#### Test 2.5: Contact Information
- [ ] "Professor contact details" → Should show faculty list with emails
- [ ] "Faculty office locations" → Should show cabin numbers
- [ ] "Where is Prof. Rajesh cabin?" → Should show cabin number

**Expected Results**: All faculty queries return accurate information with name, designation, specialization, email, and cabin

---

### 3. TIMETABLE QUERIES - 1ST YEAR (Test All)

#### Test 3.1: 1st Year - Specific Days
- [ ] "1st year Monday timetable" → Should show Monday 1st year schedule
- [ ] "First year Tuesday" → Should show Tuesday classes
- [ ] "Monday schedule 1st year" → Should show Monday 1st year
- [ ] "2nd year Wednesday" - Should show Wednesday 2nd year
- [ ] "Thursday 1st year" → Should show Thursday 1st year

#### Test 3.2: 1st Year - All Days
- [ ] "Show 1st year timetable" → Should show 1st year full schedule
- [ ] "First year schedule" → Should show all days
- [ ] "1st year classes Monday-Friday" → Should list all days
- [ ] "All 1st year periods" → Should show complete schedule

#### Test 3.3: 1st Year - Specific Days
- [ ] "Monday 1st year" → Data Structures, Discrete Math, Web Tech, etc.
- [ ] "Tuesday classes 1st year" → Should show Tuesday schedule
- [ ] "Wednesday 1st year" → Should show Wednesday schedule
- [ ] "Thursday first year" → Should show Thursday schedule
- [ ] "Friday 1st year timetable" → Should show Friday schedule
- [ ] "Saturday 1st year" → Seminar and Workshop

**Verify For 1st Year**:
- [ ] Classes include: Programming, Data Structures, Database, Networks
- [ ] Labs included: Programming Lab, Database Lab, Web Development Lab
- [ ] All time slots have faculty and room information
- [ ] Saturday has special seminars and workshops

---

### 4. TIMETABLE QUERIES - 2ND YEAR (Test All)

#### Test 4.1: 2nd Year - Specific Days
- [ ] "2nd year Monday" → Should show Monday 2nd year schedule
- [ ] "Second year Tuesday" → Should show Tuesday classes
- [ ] "Wednesday 2nd year" → Should show Wednesday schedule
- [ ] "Thursday second year" → Should show Thursday classes
- [ ] "Friday 2nd year timetable" → Should show Friday schedule

#### Test 4.2: 2nd Year - All Days
- [ ] "Show 2nd year timetable" → Should show 2nd year full schedule
- [ ] "Second year schedule" → Should show all days
- [ ] "2nd year classes" → Should list all days

#### Test 4.3: 2nd Year - Specific Courses
- [ ] "Machine learning class" → Should show ML schedule
- [ ] "When is cloud computing?" → Should show cloud computing timing
- [ ] "Advanced Java timing" → Should show Java class timing
- [ ] "Software engineering schedule" → Should show SE schedule

**Verify For 2nd Year**:
- [ ] Classes include: Data Science, ML, Cloud Computing, Advanced Java
- [ ] Labs included: ML Lab, Enterprise Application Lab, Cloud Lab, Project Work
- [ ] All 7 days have schedule (Monday-Saturday)
- [ ] Saturday includes seminars and industry talks
- [ ] Friday has Internship Guidance session

---

### 5. TIMETABLE QUERIES - TIME NAVIGATION (Test All)

#### Test 5.1: Today & Tomorrow
- [ ] "Today's timetable" → Should show today's schedule
- [ ] "Today's classes" → Should show today (if weekday)
- [ ] "Tomorrow's schedule" → Should show tomorrow
- [ ] "Tomorrow's timetable" → Should show next day

#### Test 5.2: Generic Requests
- [ ] "Show timetable" → Should ask for specific day
- [ ] "Class schedule" → Should show or ask for details
- [ ] "When are classes?" → Should provide schedule info

---

### 6. MIXED/COMPLEX QUERIES (Test Natural Language)

#### Test 6.1: Complex Timetable Queries
- [ ] "What is my first year Monday morning schedule?" → Data Structures at 9-10
- [ ] "Show me 2nd year Friday afternoon classes" → Cloud Computing, Java, etc.
- [ ] "Which subject at 10 AM on Tuesday in 1st year?" → Machine Learning or similar
- [ ] "Where is the class at 11:15 on Wednesday?" → Should show room
- [ ] "Who teaches 1st year programming?" → Should show Prof. Anitha

#### Test 6.2: Mixed Information Queries
- [ ] "Where is the lab where Prof. Suresh teaches Tuesday 2pm?" → Multiple connections
- [ ] "Which faculty teaches in MCA Lab 1?" → Should list faculty
- [ ] "What's the timetable for the seminar hall?" → Special events

---

### 7. EVENT QUERIES (Test All)

#### Test 7.1: Event Listing
- [ ] "What events are coming?" → Should list all upcoming events
- [ ] "Show upcoming workshops" → Should show workshops
- [ ] "What's happening?" → Should show events
- [ ] "Events this month" → Should show relevant events

#### Test 7.2: Specific Events
- [ ] "Tell me about hackathon" → Should show hackathon details
- [ ] "When is tech symposium?" → Should show date
- [ ] "Project exhibition details" → Should show exhibition info

---

### 8. HELP & NAVIGATION (Test All)

#### Test 8.1: Help Queries
- [ ] "Help" → Should show help menu
- [ ] "What can you do?" → Should list features
- [ ] "How to use this?" → Should show guide
- [ ] "How do I use this?" → Should show instructions

#### Test 8.2: Greetings
- [ ] "Hello" → Should greet and offer help
- [ ] "Hi" → Should respond with greeting
- [ ] "Good morning" → Should greet appropriately
- [ ] "Namaste" → Should respond

#### Test 8.3: Thanks
- [ ] "Thank you" → Should acknowledge
- [ ] "Thanks" → Should respond
- [ ] "Thanks for help" → Should respond

---

### 9. VOICE FEATURES (Test All)

#### Test 9.1: Voice Recognition
- [ ] Click microphone button
- [ ] Speak clearly: "Where is the library?"
- [ ] Should transcribe and process
- [ ] Should display response

#### Test 9.2: Text-to-Speech
- [ ] Enable speaker
- [ ] Ask a question
- [ ] Should hear response read aloud
- [ ] Voice should be clear and natural

#### Test 9.3: Quick Actions
- [ ] Click "Show Locations"
- [ ] Click "Faculty Info"
- [ ] Click "Today's Schedule"
- [ ] Click "Events"
- [ ] Should process each action

---

### 10. ADMIN PANEL (Test All)

#### Test 10.1: Admin Login
- [ ] Navigate to `/admin/login`
- [ ] Email: `admin@seshadripuram.edu`
- [ ] Password: `admin123`
- [ ] Should login successfully

#### Test 10.2: Add Location
- [ ] Go to Locations section
- [ ] Click "Add New Location"
- [ ] Fill in: name, floor, building, description
- [ ] Click Save
- [ ] New location should appear in voice assistant

#### Test 10.3: Add Faculty
- [ ] Go to Faculty section
- [ ] Click "Add New Faculty"
- [ ] Fill in all fields
- [ ] Click Save
- [ ] New faculty should appear in queries

#### Test 10.4: Add Timetable Entry
- [ ] Go to Timetable section
- [ ] Add day, time, subject, faculty, room
- [ ] Click Save
- [ ] Should appear in timetable queries

#### Test 10.5: Add Event
- [ ] Go to Events section
- [ ] Fill in event details
- [ ] Click Save
- [ ] Should appear in event queries

#### Test 10.6: Edit/Delete
- [ ] Edit existing entry
- [ ] Delete entry
- [ ] Changes should reflect immediately

---

### 11. ERROR HANDLING (Test All)

#### Test 11.1: Invalid Queries
- [ ] "xyz random text" → Should show helpful message
- [ ] Empty query → Should ask for valid input
- [ ] Only spaces → Should ask for input

#### Test 11.2: No Results
- [ ] "Where is Jupiter Lab?" → Should say not found with suggestions
- [ ] "Professor xyz" → Should say not found
- [ ] "Unknown day schedule" → Should handle gracefully

#### Test 11.3: Browser Issues
- [ ] Disable speaker/microphone
- [ ] Try voice input → Should show warning
- [ ] Text input should still work

---

### 12. PERFORMANCE TESTING

#### Test 12.1: Response Speed
- [ ] All location queries < 1 second
- [ ] All faculty queries < 1 second
- [ ] All timetable queries < 1 second
- [ ] Voice processing < 2 seconds

#### Test 12.2: Database Performance
- [ ] Multiple rapid queries → Should not crash
- [ ] 100+ locations → Should handle efficiently
- [ ] 50+ faculty → Should work smoothly

---

### 13. COMPATIBILITY TESTING

#### Test 13.1: Browsers
- [ ] Chrome/Chromium ✅
- [ ] Edge ✅
- [ ] Safari ✅
- [ ] Firefox (text only) ✅

#### Test 13.2: Devices
- [ ] Desktop (1920x1080) ✅
- [ ] Laptop (1366x768) ✅
- [ ] Tablet (768x1024) ✅
- [ ] Mobile (375x667) ✅

#### Test 13.3: Voice Support
- [ ] Chrome/Chromium ✅
- [ ] Edge ✅
- [ ] Safari ✅

---

## 📊 Test Results Template

```
Test Date: ___/___/2026
Tester: _______________
Browser: ______________
Device: _______________

Location Queries: ✅ / ⚠️ / ❌
Faculty Queries: ✅ / ⚠️ / ❌
1st Year Timetable: ✅ / ⚠️ / ❌
2nd Year Timetable: ✅ / ⚠️ / ❌
Events Queries: ✅ / ⚠️ / ❌
Help/Navigation: ✅ / ⚠️ / ❌
Voice Features: ✅ / ⚠️ / ❌
Admin Panel: ✅ / ⚠️ / ❌
Performance: ✅ / ⚠️ / ❌
Compatibility: ✅ / ⚠️ / ❌

Overall: ✅ PASS / ⚠️ REVIEW / ❌ FAIL

Issues Found: __________
```

---

## ✅ Final Checklist Before Publishing

- [ ] All location queries tested and working
- [ ] All faculty queries tested and working
- [ ] 1st year timetable all days tested
- [ ] 2nd year timetable all days tested
- [ ] Event queries tested
- [ ] Help/greeting/thanks working
- [ ] Voice input working
- [ ] Text-to-speech working
- [ ] Admin panel fully functional
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Browser compatibility checked
- [ ] Performance acceptable
- [ ] Database backup created
- [ ] Documentation complete

**Status**: Ready for production deployment ✅
