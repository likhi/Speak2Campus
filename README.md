# SPEAK2CAMPUS - Seshadripuram College MCA Department

A voice-enabled conversational AI assistant for the MCA department to help students find information about locations, faculty, timetables, and events.

## Features

- **Voice Assistant**: Ask questions using your voice or text
- **Smart AI Responses**: Understands complex queries about:
  - Locations (labs, library, auditorium, offices)
  - Faculty members and contact information
  - Timetables (1st year and 2nd year, all days)
  - Upcoming events and workshops
- **Admin Panel**: Manage all data (locations, faculty, events, timetables)
- **Comprehensive Training**: 180+ keywords for accurate responses
- **Mobile Responsive**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme detection
- **Text-to-Speech**: Responses read aloud automatically

## Quick Start

### Prerequisites
- Node.js 18+ (https://nodejs.org/)
- Git (https://git-scm.com/)

### Installation

```bash
# Clone or extract the project
cd speak2campus

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit: http://localhost:3000

## Usage

### Voice Commands
- "What's the 1st year Monday timetable?"
- "Where is the lab?"
- "Who is the Head of Department?"
- "Show all faculty members"
- "What events are coming up?"
- "How to reach the library?"

### Admin Panel
- URL: http://localhost:3000/admin/login
- Email: `admin@seshadripuram.edu`
- Password: `admin123`

## Project Structure

```
├── app/
│   ├── page.tsx                 # Main UI
│   ├── admin/
│   │   ├── page.tsx            # Admin dashboard
│   │   ├── login/              # Admin login
│   │   └── dashboard/          # Management panels
│   └── api/                    # Backend API routes
├── components/
│   ├── voice-assistant.tsx     # AI voice interface
│   ├── chat-message.tsx        # Chat display
│   └── ui/                     # Reusable components
├── lib/
│   ├── sqlite.ts               # Database
│   ├── college-data.ts         # Sample data
│   └── keyword-training.ts     # AI training data
└── package.json
```

## Technology Stack

- **Frontend**: React 19, Next.js 16, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **AI/Voice**: Web Speech API, Text-to-Speech
- **State Management**: React Hooks
- **Database**: In-memory (development), SQLite (production)
- **UI Components**: Radix UI, Recharts

## API Endpoints

### GET /api/locations
Returns all locations

### GET /api/faculty
Returns all faculty members

### GET /api/events
Returns all events

### GET /api/timetable
Returns timetable entries

### POST /api/locations
Add new location

### POST /api/faculty
Add new faculty

### POST /api/events
Add new event

### POST /api/timetable
Add timetable entry

## Training Data

### Locations (18)
- MCA Lab 1 & 2
- Programming Lab
- Database Lab
- Network Lab
- Web Development Lab
- HOD Office, Staff Room
- Seminar Hall, Auditorium
- Library, Digital Library
- Cafeteria
- Placement Cell
- Principal Office
- Student Support Center
- Computer Center
- Research Lab

### Faculty (10)
- Dr. Ramesh Kumar (HOD)
- Prof. Lakshmi Devi
- Prof. Suresh Babu
- Prof. Anitha Sharma
- Prof. Venkatesh Murthy
- Prof. Kavitha Rao
- Prof. Rajesh Verma
- Prof. Priya Sharma
- Prof. Amit Patel
- Prof. Deepti Nair

### Timetables
- **1st Year**: All days (Mon-Sat) with subjects, faculty, rooms
- **2nd Year**: All days (Mon-Sat) with advanced courses

### Events (5)
- AI & Machine Learning Workshop
- Cloud Computing Bootcamp
- Software Engineering Conference
- Data Science Seminar
- Placement Drive 2024

## Keyword Training (180+ Keywords)

### Location Keywords
lab, library, cafeteria, auditorium, seminar, office, cabin, building, floor, reach, find, where, location, etc.

### Faculty Keywords
professor, prof, teacher, hod, head, department, specialist, specialization, designation, staff, faculty, etc.

### Timetable Keywords
timetable, schedule, class, lecture, period, timing, when, 1st year, 2nd year, monday-saturday, today, tomorrow, etc.

### Event Keywords
event, activity, workshop, seminar, hackathon, competition, exhibition, coming, upcoming, etc.

## Deployment

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Deploy to Heroku
```bash
heroku create
git push heroku main
```

### Deploy to AWS/Docker
```bash
npm run build
docker build -t speak2campus .
docker run -p 3000:3000 speak2campus
```

## Testing

Test cases available in TESTING_GUIDE.md:
- Location queries
- Faculty queries
- 1st year timetable queries
- 2nd year timetable queries
- Event queries
- Voice input
- Admin panel operations

## Documentation

- **RUN_ON_LAPTOP.md** - How to run locally
- **TESTING_GUIDE.md** - Complete test procedures
- **PUBLICATION_READY.md** - Feature checklist
- **DEPLOY_NOW.md** - Deployment instructions

## Troubleshooting

### Port 3000 in use
```bash
npm run dev -- -p 3001
```

### Clear cache
```bash
npm cache clean --force
npm install
```

### Voice not working
- Check browser microphone permissions
- Use Chrome, Firefox, or Edge
- Restart the app

## Browser Support

- Chrome/Chromium (Recommended)
- Firefox
- Safari 14+
- Edge

## License

MIT License - Use freely for educational purposes

## Support

For issues or questions:
1. Check documentation files
2. Review TESTING_GUIDE.md
3. Check admin panel for data

## About

Built for Seshadripuram College, Tumkur - MCA Department
A modern AI-powered assistant for campus navigation and information
