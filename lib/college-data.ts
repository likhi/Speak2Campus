// Seshadripuram College Tumkur - MCA Department Data

export const collegeData = {
  locations: [
    {
      name: "MCA Lab 1",
      floor: "2nd Floor",
      building: "Main Block",
      description: "Computer lab with 60 systems for practical sessions and coding exercises",
    },
    {
      name: "MCA Lab 2",
      floor: "2nd Floor",
      building: "Main Block",
      description: "Advanced computing lab with high-end workstations for ML and data science",
    },
    {
      name: "Programming Lab",
      floor: "3rd Floor",
      building: "Main Block",
      description: "Lab for Java, Python, and C++ programming courses",
    },
    {
      name: "Database Lab",
      floor: "2nd Floor",
      building: "Main Block",
      description: "Database systems lab with Oracle and MySQL installations",
    },
    {
      name: "Network Lab",
      floor: "3rd Floor",
      building: "Technical Block",
      description: "Networking lab with routers, switches, and network simulation tools",
    },
    {
      name: "Web Development Lab",
      floor: "1st Floor",
      building: "Main Block",
      description: "Lab for HTML, CSS, JavaScript, and web frameworks",
    },
    { 
      name: "HOD Office", 
      floor: "2nd Floor", 
      building: "Main Block", 
      description: "Head of Department cabin - Dr. Ramesh Kumar" 
    },
    { 
      name: "Staff Room", 
      floor: "2nd Floor", 
      building: "Main Block", 
      description: "MCA faculty staff room and common area" 
    },
    {
      name: "Seminar Hall",
      floor: "1st Floor",
      building: "Main Block",
      description: "Hall for seminars, presentations, and technical talks",
    },
    {
      name: "Library",
      floor: "Ground Floor",
      building: "Library Block",
      description: "Central library with digital resources, eBooks, and journals",
    },
    {
      name: "Digital Library",
      floor: "1st Floor",
      building: "Library Block",
      description: "Computer lab section with access to digital resources and NPTEL courses",
    },
    {
      name: "Cafeteria",
      floor: "Ground Floor",
      building: "Canteen Block",
      description: "College canteen and food court with snacks and meals",
    },
    {
      name: "Auditorium",
      floor: "Ground Floor",
      building: "Main Block",
      description: "Main auditorium for events, conferences, and guest lectures",
    },
    {
      name: "Placement Cell",
      floor: "1st Floor",
      building: "Admin Block",
      description: "Career guidance and placement office for recruitment drives",
    },
    {
      name: "Principal Office",
      floor: "1st Floor",
      building: "Admin Block",
      description: "Principal's office and administration",
    },
    {
      name: "Student Support Center",
      floor: "Ground Floor",
      building: "Admin Block",
      description: "Center for academic counseling and student support services",
    },
    {
      name: "Computer Center",
      floor: "3rd Floor",
      building: "Technical Block",
      description: "General purpose computer lab with 40 systems",
    },
    {
      name: "Research Lab",
      floor: "4th Floor",
      building: "Technical Block",
      description: "Research and development lab for advanced projects",
    },
  ],

  faculty: [
    {
      name: "Dr. Ramesh Kumar",
      designation: "HOD & Professor",
      department: "MCA",
      specialization: "Data Science & AI",
      email: "ramesh.kumar@seshadripuram.edu.in",
      cabin: "Room 201",
    },
    {
      name: "Prof. Lakshmi Devi",
      designation: "Associate Professor",
      department: "MCA",
      specialization: "Software Engineering",
      email: "lakshmi.devi@seshadripuram.edu.in",
      cabin: "Room 202",
    },
    {
      name: "Prof. Suresh Babu",
      designation: "Associate Professor",
      department: "MCA",
      specialization: "Database Systems & Oracle",
      email: "suresh.babu@seshadripuram.edu.in",
      cabin: "Room 203",
    },
    {
      name: "Prof. Anitha Sharma",
      designation: "Assistant Professor",
      department: "MCA",
      specialization: "Web Technologies & Frontend",
      email: "anitha.sharma@seshadripuram.edu.in",
      cabin: "Room 204",
    },
    {
      name: "Prof. Venkatesh Murthy",
      designation: "Assistant Professor",
      department: "MCA",
      specialization: "Computer Networks & Cybersecurity",
      email: "venkatesh.m@seshadripuram.edu.in",
      cabin: "Room 205",
    },
    {
      name: "Prof. Kavitha Rao",
      designation: "Assistant Professor",
      department: "MCA",
      specialization: "Machine Learning & AI",
      email: "kavitha.rao@seshadripuram.edu.in",
      cabin: "Room 206",
    },
    {
      name: "Prof. Rajesh Verma",
      designation: "Assistant Professor",
      department: "MCA",
      specialization: "Cloud Computing & AWS",
      email: "rajesh.verma@seshadripuram.edu.in",
      cabin: "Room 207",
    },
    {
      name: "Prof. Priya Sharma",
      designation: "Assistant Professor",
      department: "MCA",
      specialization: "Python Programming & Data Analysis",
      email: "priya.sharma@seshadripuram.edu.in",
      cabin: "Room 208",
    },
    {
      name: "Prof. Amit Patel",
      designation: "Lecturer",
      department: "MCA",
      specialization: "Java Development & Enterprise",
      email: "amit.patel@seshadripuram.edu.in",
      cabin: "Room 209",
    },
    {
      name: "Prof. Deepti Nair",
      designation: "Lecturer",
      department: "MCA",
      specialization: "Mobile Development & Android",
      email: "deepti.nair@seshadripuram.edu.in",
      cabin: "Room 210",
    },
  ],

  timetable: {
    // 1ST YEAR TIMETABLE
    Monday_1st: [
      { time: "9:00 - 10:00", subject: "Introduction to Programming", faculty: "Prof. Anitha Sharma", room: "MCA Lab 1", year: "1st" },
      { time: "10:00 - 11:00", subject: "Discrete Mathematics", faculty: "Prof. Suresh Babu", room: "Room 101", year: "1st" },
      { time: "11:15 - 12:15", subject: "Web Technologies", faculty: "Prof. Anitha Sharma", room: "Room 102", year: "1st" },
      { time: "12:15 - 1:15", subject: "English Communication", faculty: "Prof. Lakshmi Devi", room: "Room 103", year: "1st" },
      { time: "2:00 - 4:00", subject: "Programming Lab", faculty: "Prof. Anitha Sharma", room: "MCA Lab 2", year: "1st" },
    ],
    Tuesday_1st: [
      { time: "9:00 - 10:00", subject: "Data Structures", faculty: "Prof. Suresh Babu", room: "MCA Lab 1", year: "1st" },
      { time: "10:00 - 11:00", subject: "Database Fundamentals", faculty: "Prof. Suresh Babu", room: "Room 101", year: "1st" },
      { time: "11:15 - 12:15", subject: "Operating Systems", faculty: "Prof. Venkatesh Murthy", room: "Room 102", year: "1st" },
      { time: "12:15 - 1:15", subject: "Web Technologies", faculty: "Prof. Anitha Sharma", room: "Room 103", year: "1st" },
      { time: "2:00 - 4:00", subject: "Database Lab", faculty: "Prof. Suresh Babu", room: "MCA Lab 2", year: "1st" },
    ],
    Wednesday_1st: [
      { time: "9:00 - 10:00", subject: "Object Oriented Programming", faculty: "Prof. Anitha Sharma", room: "Room 101", year: "1st" },
      { time: "10:00 - 11:00", subject: "Data Structures", faculty: "Prof. Suresh Babu", room: "Room 102", year: "1st" },
      { time: "11:15 - 12:15", subject: "Database Fundamentals", faculty: "Prof. Suresh Babu", room: "MCA Lab 1", year: "1st" },
      { time: "12:15 - 1:15", subject: "Problem Solving", faculty: "Prof. Venkatesh Murthy", room: "Room 103", year: "1st" },
      { time: "2:00 - 4:00", subject: "Web Development Lab", faculty: "Prof. Anitha Sharma", room: "MCA Lab 1", year: "1st" },
    ],
    Thursday_1st: [
      { time: "9:00 - 10:00", subject: "Computer Networks Basics", faculty: "Prof. Venkatesh Murthy", room: "Room 101", year: "1st" },
      { time: "10:00 - 11:00", subject: "Operating Systems", faculty: "Prof. Venkatesh Murthy", room: "Room 102", year: "1st" },
      { time: "11:15 - 12:15", subject: "Discrete Mathematics", faculty: "Prof. Suresh Babu", room: "Room 103", year: "1st" },
      { time: "12:15 - 1:15", subject: "Data Structures", faculty: "Prof. Suresh Babu", room: "MCA Lab 1", year: "1st" },
      { time: "2:00 - 4:00", subject: "Network Lab", faculty: "Prof. Venkatesh Murthy", room: "MCA Lab 2", year: "1st" },
    ],
    Friday_1st: [
      { time: "9:00 - 10:00", subject: "Introduction to Programming", faculty: "Prof. Anitha Sharma", room: "Room 101", year: "1st" },
      { time: "10:00 - 11:00", subject: "Database Fundamentals", faculty: "Prof. Suresh Babu", room: "Room 102", year: "1st" },
      { time: "11:15 - 12:15", subject: "Web Technologies", faculty: "Prof. Anitha Sharma", room: "Room 103", year: "1st" },
      { time: "12:15 - 1:15", subject: "English Communication", faculty: "Prof. Lakshmi Devi", room: "Room 101", year: "1st" },
      { time: "2:00 - 4:00", subject: "Programming Lab", faculty: "Prof. Anitha Sharma", room: "MCA Lab 1", year: "1st" },
    ],
    Saturday_1st: [
      { time: "9:00 - 11:00", subject: "Seminar - Programming Concepts", faculty: "Prof. Anitha Sharma", room: "Seminar Hall", year: "1st" },
      { time: "11:15 - 1:15", subject: "Workshop - Database Design", faculty: "Prof. Suresh Babu", room: "Auditorium", year: "1st" },
    ],

    // 2ND YEAR TIMETABLE
    Monday_2nd: [
      { time: "9:00 - 10:00", subject: "Data Science & Analytics", faculty: "Prof. Kavitha Rao", room: "MCA Lab 1", year: "2nd" },
      { time: "10:00 - 11:00", subject: "Machine Learning", faculty: "Prof. Kavitha Rao", room: "Room 101", year: "2nd" },
      { time: "11:15 - 12:15", subject: "Software Engineering", faculty: "Prof. Lakshmi Devi", room: "Room 102", year: "2nd" },
      { time: "12:15 - 1:15", subject: "Database Management Systems", faculty: "Prof. Suresh Babu", room: "Room 103", year: "2nd" },
      { time: "2:00 - 4:00", subject: "ML Lab", faculty: "Prof. Kavitha Rao", room: "MCA Lab 2", year: "2nd" },
    ],
    Tuesday_2nd: [
      { time: "9:00 - 10:00", subject: "Advanced Java", faculty: "Prof. Anitha Sharma", room: "MCA Lab 1", year: "2nd" },
      { time: "10:00 - 11:00", subject: "Computer Networks", faculty: "Prof. Venkatesh Murthy", room: "Room 101", year: "2nd" },
      { time: "11:15 - 12:15", subject: "Advanced Database", faculty: "Prof. Suresh Babu", room: "Room 102", year: "2nd" },
      { time: "12:15 - 1:15", subject: "Software Engineering", faculty: "Prof. Lakshmi Devi", room: "Room 103", year: "2nd" },
      { time: "2:00 - 4:00", subject: "Enterprise Application Lab", faculty: "Prof. Anitha Sharma", room: "MCA Lab 2", year: "2nd" },
    ],
    Wednesday_2nd: [
      { time: "9:00 - 10:00", subject: "Cloud Computing", faculty: "Prof. Ramesh Kumar", room: "Room 101", year: "2nd" },
      { time: "10:00 - 11:00", subject: "Machine Learning Advanced", faculty: "Prof. Kavitha Rao", room: "Room 102", year: "2nd" },
      { time: "11:15 - 12:15", subject: "Software Architecture", faculty: "Prof. Lakshmi Devi", room: "Room 103", year: "2nd" },
      { time: "12:15 - 1:15", subject: "Advanced Networking", faculty: "Prof. Venkatesh Murthy", room: "MCA Lab 1", year: "2nd" },
      { time: "2:00 - 4:00", subject: "Cloud Lab", faculty: "Prof. Ramesh Kumar", room: "MCA Lab 2", year: "2nd" },
    ],
    Thursday_2nd: [
      { time: "9:00 - 10:00", subject: "Data Science & Analytics", faculty: "Prof. Kavitha Rao", room: "Room 101", year: "2nd" },
      { time: "10:00 - 11:00", subject: "Software Engineering", faculty: "Prof. Lakshmi Devi", room: "Room 102", year: "2nd" },
      { time: "11:15 - 12:15", subject: "Advanced Java", faculty: "Prof. Anitha Sharma", room: "Room 103", year: "2nd" },
      { time: "12:15 - 1:15", subject: "Computer Networks", faculty: "Prof. Venkatesh Murthy", room: "MCA Lab 1", year: "2nd" },
      { time: "2:00 - 4:00", subject: "Project Work Lab", faculty: "Dr. Ramesh Kumar", room: "MCA Lab 2", year: "2nd" },
    ],
    Friday_2nd: [
      { time: "9:00 - 10:00", subject: "Machine Learning", faculty: "Prof. Kavitha Rao", room: "Room 101", year: "2nd" },
      { time: "10:00 - 11:00", subject: "Database Management", faculty: "Prof. Suresh Babu", room: "Room 102", year: "2nd" },
      { time: "11:15 - 12:15", subject: "Software Engineering", faculty: "Prof. Lakshmi Devi", room: "MCA Lab 1", year: "2nd" },
      { time: "12:15 - 1:15", subject: "Cloud Computing", faculty: "Prof. Ramesh Kumar", room: "Room 103", year: "2nd" },
      { time: "2:00 - 4:00", subject: "Internship Guidance", faculty: "Dr. Ramesh Kumar", room: "Room 101", year: "2nd" },
    ],
    Saturday_2nd: [
      { time: "9:00 - 11:00", subject: "Advanced Seminar - AI & ML", faculty: "Dr. Ramesh Kumar", room: "Seminar Hall", year: "2nd" },
      { time: "11:15 - 1:15", subject: "Industry Expert Talk", faculty: "Visiting Faculty", room: "Auditorium", year: "2nd" },
    ],
  },

  events: [
    {
      name: "Tech Symposium 2026",
      date: "2026-02-15",
      description: "Annual technical symposium with coding competitions",
      venue: "Auditorium",
    },
    {
      name: "Industry Expert Talk",
      date: "2026-01-25",
      description: "Guest lecture on Cloud Computing by industry expert",
      venue: "Seminar Hall",
    },
    {
      name: "Hackathon",
      date: "2026-02-01",
      description: "24-hour coding hackathon for MCA students",
      venue: "MCA Lab 1 & 2",
    },
    {
      name: "Campus Placement Drive",
      date: "2026-02-20",
      description: "Infosys recruitment drive for final year students",
      venue: "Placement Cell",
    },
    {
      name: "Project Exhibition",
      date: "2026-03-10",
      description: "Final year project showcase and evaluation",
      venue: "Seminar Hall",
    },
  ],
}

// Helper functions for query processing
function findLocation(query: string): string {
  const queryLower = query.toLowerCase()

  for (const location of collegeData.locations) {
    if (queryLower.includes(location.name.toLowerCase())) {
      return `${location.name} is located on the ${location.floor} of ${location.building}. ${location.description}.`
    }
  }

  // Check for common keywords
  if (queryLower.includes("lab")) {
    const labs = collegeData.locations.filter((l) => l.name.toLowerCase().includes("lab"))
    return labs.map((l) => `${l.name}: ${l.floor}, ${l.building}`).join("\n")
  }

  if (queryLower.includes("hod") || queryLower.includes("head")) {
    const hod = collegeData.locations.find((l) => l.name.toLowerCase().includes("hod"))
    return hod
      ? `${hod.name} is on the ${hod.floor} of ${hod.building}.`
      : "HOD Office is on the 2nd Floor of Main Block."
  }

  if (queryLower.includes("library")) {
    const lib = collegeData.locations.find((l) => l.name.toLowerCase().includes("library"))
    return lib
      ? `${lib.name} is on the ${lib.floor} of ${lib.building}. ${lib.description}.`
      : "Library is on the Ground Floor."
  }

  if (queryLower.includes("cafeteria") || queryLower.includes("canteen") || queryLower.includes("food")) {
    const cafe = collegeData.locations.find((l) => l.name.toLowerCase().includes("cafeteria"))
    return cafe ? `${cafe.name} is on the ${cafe.floor} of ${cafe.building}.` : "Cafeteria is on the Ground Floor."
  }

  if (queryLower.includes("location") || queryLower.includes("places") || queryLower.includes("where")) {
    return (
      "Available locations:\n" + collegeData.locations.map((l) => `- ${l.name}: ${l.floor}, ${l.building}`).join("\n")
    )
  }

  return ""
}

function findFaculty(query: string): string {
  const queryLower = query.toLowerCase()

  for (const faculty of collegeData.faculty) {
    if (
      queryLower.includes(faculty.name.toLowerCase().split(" ")[1].toLowerCase()) ||
      queryLower.includes(faculty.name.toLowerCase())
    ) {
      return `${faculty.name}\n${faculty.designation}\nSpecialization: ${faculty.specialization}\nCabin: ${faculty.cabin}\nEmail: ${faculty.email}`
    }
  }

  if (queryLower.includes("hod") || queryLower.includes("head of department")) {
    const hod = collegeData.faculty.find((f) => f.designation.toLowerCase().includes("hod"))
    if (hod) {
      return `The HOD of MCA Department is ${hod.name}.\n${hod.designation}\nSpecialization: ${hod.specialization}\nCabin: ${hod.cabin}\nEmail: ${hod.email}`
    }
  }

  if (
    queryLower.includes("faculty") ||
    queryLower.includes("professor") ||
    queryLower.includes("teacher") ||
    queryLower.includes("staff")
  ) {
    return (
      "MCA Department Faculty:\n\n" +
      collegeData.faculty
        .map((f) => `${f.name}\n${f.designation} | ${f.specialization}\nCabin: ${f.cabin}`)
        .join("\n\n")
    )
  }

  return ""
}

function getTimetable(query: string): string {
  const queryLower = query.toLowerCase()
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

  // Check for specific day
  for (const day of days) {
    if (queryLower.includes(day)) {
      const dayCapitalized = (day.charAt(0).toUpperCase() + day.slice(1)) as keyof typeof collegeData.timetable
      const schedule = collegeData.timetable[dayCapitalized]
      if (schedule) {
        return (
          `${dayCapitalized}'s Timetable:\n\n` +
          schedule.map((s) => `${s.time}\n${s.subject} - ${s.faculty}\nRoom: ${s.room}`).join("\n\n")
        )
      }
    }
  }

  // Check for "today"
  if (queryLower.includes("today")) {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }) as keyof typeof collegeData.timetable
    const schedule = collegeData.timetable[today]
    if (schedule) {
      return (
        `Today's Timetable (${today}):\n\n` +
        schedule.map((s) => `${s.time}\n${s.subject} - ${s.faculty}\nRoom: ${s.room}`).join("\n\n")
      )
    }
    return "No classes scheduled for today (Sunday)."
  }

  // Check for "tomorrow"
  if (queryLower.includes("tomorrow")) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowDay = tomorrow.toLocaleDateString("en-US", { weekday: "long" }) as keyof typeof collegeData.timetable
    const schedule = collegeData.timetable[tomorrowDay]
    if (schedule) {
      return (
        `Tomorrow's Timetable (${tomorrowDay}):\n\n` +
        schedule.map((s) => `${s.time}\n${s.subject} - ${s.faculty}\nRoom: ${s.room}`).join("\n\n")
      )
    }
    return "No classes scheduled for tomorrow."
  }

  if (queryLower.includes("timetable") || queryLower.includes("schedule") || queryLower.includes("class")) {
    return "Please specify a day (e.g., 'Monday timetable', 'today's schedule', 'tomorrow's classes') to see the timetable."
  }

  return ""
}

function getEvents(query: string): string {
  const queryLower = query.toLowerCase()

  if (queryLower.includes("event") || queryLower.includes("upcoming") || queryLower.includes("happening")) {
    const today = new Date()
    const upcomingEvents = collegeData.events
      .filter((e) => new Date(e.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (upcomingEvents.length === 0) {
      return "No upcoming events scheduled at the moment."
    }

    return (
      "Upcoming Events:\n\n" +
      upcomingEvents
        .map((e) => {
          const eventDate = new Date(e.date).toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
          return `${e.name}\nDate: ${eventDate}\nVenue: ${e.venue}\n${e.description}`
        })
        .join("\n\n")
    )
  }

  return ""
}

function getHelp(): string {
  return `I can help you with:

1. Locations - Find labs, offices, library, cafeteria, etc.
   Example: "Where is the MCA Lab?" or "How to reach the library?"

2. Faculty Information - Get details about MCA department faculty
   Example: "Who is the HOD?" or "Tell me about Prof. Anitha"

3. Timetable - View class schedules
   Example: "Monday timetable" or "Today's classes"

4. Events - Check upcoming college events
   Example: "What events are coming up?"

Just ask your question or tap the quick action buttons above!`
}

export function processQuery(query: string): string {
  const queryLower = query.toLowerCase()

  // Check for greetings
  if (queryLower.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    return "Hello! Welcome to Seshadripuram College Tumkur - MCA Department. How can I help you today? You can ask about locations, faculty, timetable, or events."
  }

  // Check for help
  if (queryLower.includes("help") || queryLower.includes("what can you do") || queryLower.includes("how to use")) {
    return getHelp()
  }

  // Check for thanks
  if (queryLower.match(/^(thank|thanks|thank you)/)) {
    return "You're welcome! Feel free to ask if you need any more help."
  }

  // Try to find location
  const locationResponse = findLocation(query)
  if (locationResponse) return locationResponse

  // Try to find faculty
  const facultyResponse = findFaculty(query)
  if (facultyResponse) return facultyResponse

  // Try to get timetable
  const timetableResponse = getTimetable(query)
  if (timetableResponse) return timetableResponse

  // Try to get events
  const eventsResponse = getEvents(query)
  if (eventsResponse) return eventsResponse

  // Default response
  return "I'm not sure I understand. You can ask me about:\n- Locations (labs, offices, library)\n- Faculty information\n- Class timetable\n- Upcoming events\n\nTry asking something like 'Where is the MCA Lab?' or 'Show Monday timetable'."
}
