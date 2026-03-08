# API Reference - MongoDB Endpoints

All endpoints return JSON responses. Data is stored in MongoDB.

## Base URL
\`\`\`
http://localhost:3000/api
\`\`\`

## Faculty API

### Get All Faculty
\`\`\`http
GET /faculty
\`\`\`

**Response:**
\`\`\`json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dr. John Doe",
    "designation": "Associate Professor",
    "department": "MCA",
    "specialization": "AI",
    "email": "john@college.edu",
    "phone": "+91-9999999999",
    "cabin": "Room 101",
    "createdAt": "2024-01-19T10:00:00Z",
    "updatedAt": "2024-01-19T10:00:00Z"
  }
]
\`\`\`

### Create Faculty
\`\`\`http
POST /faculty
Content-Type: application/json

{
  "name": "Dr. Jane Smith",
  "designation": "Professor",
  "department": "MCA",
  "specialization": "Machine Learning",
  "email": "jane@college.edu",
  "phone": "+91-8888888888",
  "cabin": "Room 102"
}
\`\`\`

**Response:** `201 Created`
\`\`\`json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Dr. Jane Smith",
  "designation": "Professor",
  "department": "MCA",
  "specialization": "Machine Learning",
  "email": "jane@college.edu",
  "phone": "+91-8888888888",
  "cabin": "Room 102",
  "createdAt": "2024-01-19T10:05:00Z",
  "updatedAt": "2024-01-19T10:05:00Z"
}
\`\`\`

### Get Single Faculty
\`\`\`http
GET /faculty/507f1f77bcf86cd799439011
\`\`\`

### Update Faculty
\`\`\`http
PUT /faculty/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "designation": "Senior Professor",
  "specialization": "Deep Learning"
}
\`\`\`

**Response:** `200 OK`

### Delete Faculty
\`\`\`http
DELETE /faculty/507f1f77bcf86cd799439011
\`\`\`

**Response:**
\`\`\`json
{ "success": true }
\`\`\`

---

## Locations API

### Get All Locations
\`\`\`http
GET /locations
\`\`\`

### Create Location
\`\`\`http
POST /locations
Content-Type: application/json

{
  "name": "Computer Lab A",
  "building": "Building A",
  "floor": "2nd Floor",
  "description": "Main computer lab",
  "capacity": 50
}
\`\`\`

### Get Single Location
\`\`\`http
GET /locations/507f1f77bcf86cd799439020
\`\`\`

### Update Location
\`\`\`http
PUT /locations/507f1f77bcf86cd799439020
Content-Type: application/json

{
  "capacity": 60
}
\`\`\`

### Delete Location
\`\`\`http
DELETE /locations/507f1f77bcf86cd799439020
\`\`\`

---

## Events API

### Get All Events
\`\`\`http
GET /events
\`\`\`

### Create Event
\`\`\`http
POST /events
Content-Type: application/json

{
  "title": "Seminar on AI",
  "description": "Introduction to Artificial Intelligence",
  "date": "2024-02-15",
  "time": "10:00 AM",
  "location": "Auditorium",
  "speaker": "Dr. John Doe"
}
\`\`\`

### Get Single Event
\`\`\`http
GET /events/507f1f77bcf86cd799439030
\`\`\`

### Update Event
\`\`\`http
PUT /events/507f1f77bcf86cd799439030
Content-Type: application/json

{
  "time": "2:00 PM"
}
\`\`\`

### Delete Event
\`\`\`http
DELETE /events/507f1f77bcf86cd799439030
\`\`\`

---

## Timetable API

### Get All Timetable Entries
\`\`\`http
GET /timetable
\`\`\`

### Get Timetable by Day
\`\`\`http
GET /timetable?day=Monday
\`\`\`

### Create Timetable Entry
\`\`\`http
POST /timetable
Content-Type: application/json

{
  "day_of_week": "Monday",
  "time": "10:00",
  "subject": "Database Design",
  "faculty": "Dr. John Doe",
  "room": "Lab-1",
  "semester": "1st"
}
\`\`\`

### Get Single Timetable Entry
\`\`\`http
GET /timetable/507f1f77bcf86cd799439040
\`\`\`

### Update Timetable Entry
\`\`\`http
PUT /timetable/507f1f77bcf86cd799439040
Content-Type: application/json

{
  "time": "11:00"
}
\`\`\`

### Delete Timetable Entry
\`\`\`http
DELETE /timetable/507f1f77bcf86cd799439040
\`\`\`

---

## Error Responses

### 400 Bad Request
\`\`\`json
{
  "error": "Missing required fields"
}
\`\`\`

### 404 Not Found
\`\`\`json
{
  "error": "Faculty not found"
}
\`\`\`

### 500 Internal Server Error
\`\`\`json
{
  "error": "Failed to fetch faculty"
}
\`\`\`

---

## Using with JavaScript/Node.js

### Fetch Example
\`\`\`javascript
// Get all faculty
const response = await fetch('/api/faculty');
const faculty = await response.json();

// Create faculty
const newFaculty = await fetch('/api/faculty', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Dr. New Faculty',
    designation: 'Professor',
    department: 'MCA',
    specialization: 'AI',
    email: 'new@college.edu'
  })
});
const result = await newFaculty.json();

// Update faculty
const updated = await fetch('/api/faculty/507f1f77bcf86cd799439011', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ designation: 'Senior Professor' })
});

// Delete faculty
const deleted = await fetch('/api/faculty/507f1f77bcf86cd799439011', {
  method: 'DELETE'
});
\`\`\`

### Using with Axios
\`\`\`javascript
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:3000/api' });

// Get all
const { data: faculty } = await API.get('/faculty');

// Create
const { data: newFaculty } = await API.post('/faculty', {
  name: 'Dr. New',
  designation: 'Professor',
  department: 'MCA',
  specialization: 'AI',
  email: 'new@college.edu'
});

// Update
const { data: updated } = await API.put('/faculty/507f1f77bcf86cd799439011', {
  designation: 'Senior Professor'
});

// Delete
await API.delete('/faculty/507f1f77bcf86cd799439011');
\`\`\`

---

## MongoDB ObjectId

All `_id` fields are MongoDB ObjectIds (24-character hex strings).

Example: `507f1f77bcf86cd799439011`

When making requests with IDs, use the string format directly.

---

## Timestamps

Every document includes:
- `createdAt` - ISO 8601 timestamp when created
- `updatedAt` - ISO 8601 timestamp when last updated

These are automatically managed by the API.

---

## Sorting

Results are returned sorted by:
- Faculty: by `name`
- Locations: by `building`
- Events: by `date`
- Timetable: by `time`

---

## Limits

- No pagination (returns all results)
- No authentication required for API
- Admin dashboard has login protection

---

## Testing with cURL

\`\`\`bash
# Get all faculty
curl http://localhost:3000/api/faculty

# Create faculty
curl -X POST http://localhost:3000/api/faculty \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Test",
    "designation": "Professor",
    "department": "MCA",
    "specialization": "AI",
    "email": "test@college.edu"
  }'

# Update faculty
curl -X PUT http://localhost:3000/api/faculty/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"designation": "Senior Professor"}'

# Delete faculty
curl -X DELETE http://localhost:3000/api/faculty/507f1f77bcf86cd799439011
\`\`\`

---

For more information, see:
- **QUICKSTART_MONGODB.md** - Quick setup guide
- **MONGODB_SETUP.md** - Detailed MongoDB setup
