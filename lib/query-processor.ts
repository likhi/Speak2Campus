// Advanced Query Processor for SPEAK2CAMPUS
// Handles: department detection, year detection, day detection, intent detection, synonym processing

export interface QueryContext {
  intent: 'location' | 'faculty' | 'timetable' | 'events' | 'announcements' | 'help' | 'greeting' | 'unknown'
  department: string | null // MCA, MBA, or MCOM
  year: '1st' | '2nd' | 'both' | null
  day: string | null
  keywords: string[]
  rawQuery: string
}

// Year detection synonyms
const YEAR_1_SYNONYMS = ['1st', 'first', '1st year', 'first year', 'one', '1', 'freshman', 'junior']
const YEAR_2_SYNONYMS = ['2nd', 'second', '2nd year', 'second year', 'two', '2', 'sophomore', 'senior']

// Day detection synonyms
const DAYS = {
  monday: ['monday', 'mon', 'mondays'],
  tuesday: ['tuesday', 'tue', 'tuesdays'],
  wednesday: ['wednesday', 'wed', 'wednesdays'],
  thursday: ['thursday', 'thu', 'thursdays'],
  friday: ['friday', 'fri', 'fridays'],
  saturday: ['saturday', 'sat', 'saturdays'],
}

// Department detection
const DEPARTMENT_MAP: Record<string, string> = {
  mca: 'MCA',
  'master of computer applications': 'MCA',
  'computer applications': 'MCA',
  mba: 'MBA',
  'master of business administration': 'MBA',
  'business administration': 'MBA',
  mcom: 'MCOM',
  'master of commerce': 'MCOM',
  commerce: 'MCOM',
}

// Intent detection keywords
// NOTE: 'announcements' must appear BEFORE 'timetable' so that
// "today's updates / notices / announcements" maps to announcements,
// not timetable.
const INTENT_KEYWORDS: Record<string, string[]> = {
  // ── Greeting / help — highest specificity ──────────────────────────────
  greeting: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste'],
  help: ['help', 'guide', 'what can you do', 'how do i', 'how to use', 'assist', 'support'],

  // ── Announcements / notices / today-updates — before timetable ─────────
  announcements: [
    'announcement', 'announcements',
    'notice', 'notices',
    'notification', 'notifications',
    'update', 'updates',
    'news', 'bulletin',
    'circular', 'circulars',
    'memo', 'memos',
    "today's update", "today's updates",
    "today's announcement", "today's announcements",
    "today's notice", "today's notices",
    "today's news",
    'what is happening today',
    'what is going on today',
    "what's happening today",
    "what's going on today",
    "what's today",
    'any updates today',
    'any announcements today',
    'any notices today',
    'any news today',
    'latest updates',
    'latest news',
    'latest announcements',
    'college updates',
    'college announcements',
    'college notice',
    'important notice',
    'important announcement',
    'new update',
    'today update',
    'today announcement',
    'today notice',
    'daily update',
    'daily announcement',
  ],

  // ── Timetable — 'today' intentionally removed here ─────────────────────
  // 'today' alone belongs to announcements. Only use it in timetable when
  // a department (mca/mba/mcom) or 'timetable' keyword is also present.
  timetable: ['timetable', 'time table', 'time-table', 'schedule', 'class schedule',
    'lecture', 'period', 'timing', 'what class', 'classes', 'tomorrow'],

  location: ['where', 'location', 'find', 'how to reach', 'building', 'room', 'floor',
    'lab', 'library', 'cafeteria', 'auditorium', 'office', 'cabin', 'seminar', 'placement'],

  faculty: ['faculty', 'professor', 'prof', 'teacher', 'hod', 'head', 'dr', 'specialist',
    'who is', 'tell about', 'staff', 'instructor'],

  events: ['event', 'activity', 'coming', 'upcoming', 'workshop', 'program', 'talk',
    'hackathon', 'competition', 'exhibition', 'fest', 'cultural', 'technical'],
}

export function processQuery(query: string): QueryContext {
  const lowerQuery = query.toLowerCase()
  const context: QueryContext = {
    intent: 'unknown',
    department: null,
    year: null,
    day: null,
    keywords: [],
    rawQuery: query,
  }

  // Detect department
  for (const [keyword, dept] of Object.entries(DEPARTMENT_MAP)) {
    if (lowerQuery.includes(keyword)) {
      context.department = dept
      break
    }
  }

  // Detect year
  if (YEAR_1_SYNONYMS.some(y => lowerQuery.includes(y))) {
    context.year = '1st'
  } else if (YEAR_2_SYNONYMS.some(y => lowerQuery.includes(y))) {
    context.year = '2nd'
  }

  // Detect day
  for (const [day, synonyms] of Object.entries(DAYS)) {
    if (synonyms.some(syn => lowerQuery.includes(syn))) {
      context.day = day
      break
    }
  }

  // Handle special day keywords
  if (lowerQuery.includes('today')) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    context.day = today === 'sunday' ? 'monday' : today
  }
  if (lowerQuery.includes('tomorrow')) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowDay = tomorrow.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    context.day = tomorrowDay === 'sunday' ? 'monday' : tomorrowDay
  }

  // Detect intent
  for (const [intentType, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(kw => lowerQuery.includes(kw))) {
      context.intent = intentType as QueryContext['intent']
      context.keywords = keywords.filter(kw => lowerQuery.includes(kw))
      break
    }
  }

  return context
}

export function extractLocationKeywords(query: string): string[] {
  const lowerQuery = query.toLowerCase()
  const keywords = [
    'mca lab', 'programming lab', 'database lab', 'network lab', 'web dev', 'lab',
    'hod office', 'staff room', 'seminar hall', 'library', 'cafeteria', 'auditorium',
    'placement cell', 'principal office', 'support center', 'computer center', 'research lab'
  ]

  return keywords.filter(kw => lowerQuery.includes(kw))
}

export function extractFacultyKeywords(query: string): string[] {
  const lowerQuery = query.toLowerCase()
  const keywords = [
    'ramesh', 'lakshmi', 'suresh', 'anitha', 'venkatesh', 'kavitha',
    'rajesh', 'priya', 'amit', 'deepti',
    'professor', 'prof', 'hod', 'head', 'assistant', 'associate', 'lecturer'
  ]

  return keywords.filter(kw => lowerQuery.includes(kw))
}

export function extractSubjectKeywords(query: string): string[] {
  const lowerQuery = query.toLowerCase()
  const keywords = [
    'programming', 'database', 'data structures', 'machine learning', 'cloud computing',
    'web technologies', 'software engineering', 'networks', 'java', 'python',
    'operating systems', 'discrete math', 'communication'
  ]

  return keywords.filter(kw => lowerQuery.includes(kw))
}

export function formatTimetableResponse(
  classes: any[],
  day: string,
  year?: string
): string {
  if (classes.length === 0) {
    return `No classes scheduled for ${year ? year + ' year ' : ''}${day.charAt(0).toUpperCase() + day.slice(1)}`
  }

  const dayLabel = day.charAt(0).toUpperCase() + day.slice(1)
  const yearLabel = year ? `${year} Year - ` : ''

  let response = `${yearLabel}${dayLabel} Timetable:\n\n`
  response += classes
    .map((cls) => `${cls.time}\n📚 ${cls.subject}\n👨‍🏫 ${cls.faculty}\n🏢 ${cls.room}`)
    .join('\n\n')

  return response
}

export function getHelpMessage(): string {
  return `I can help you with:

1. LOCATIONS - Ask about college facilities
   Examples: "Where is the lab?", "How to reach library?", "Show all locations"

2. FACULTY - Get information about faculty members
   Examples: "Who is the HOD?", "Tell me about Prof. Suresh", "Show faculty list"

3. TIMETABLE - Get class schedules
   Examples: "MCA 1st year timetable", "MBA 2nd year class schedule"

4. EVENTS - Get upcoming events
   Examples: "What events are coming?", "Show upcoming workshops"

5. ANNOUNCEMENTS / NOTICES - Get today's notices and updates
   Examples: "Any notices today?", "Show announcements", "What's happening today?", "Latest updates"

6. Just ask naturally! I understand common keywords and synonyms.`
}
