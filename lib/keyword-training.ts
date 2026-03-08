// Comprehensive keyword training for voice assistant
// This file trains the model with all variations of keywords for maximum accuracy

export const keywordTraining = {
  departmentKeywords: {
    mca: ['mca', 'master of computer applications', 'computer applications', 'ca'],
    mba: ['mba', 'master of business administration', 'business administration', 'management'],
    mcom: ['mcom', 'master of commerce', 'commerce', 'accounting'],
  },

  locationKeywords: {
    lab: ['lab', 'laboratory', 'computer lab', 'lab1', 'lab2', 'practical', 'coding lab'],
    library: ['library', 'digital library', 'reading room', 'book', 'resource center'],
    cafeteria: ['cafeteria', 'canteen', 'food', 'dining', 'lunch', 'eat', 'cafe', 'restaurant'],
    auditorium: ['auditorium', 'hall', 'main hall', 'assembly', 'event hall', 'conference'],
    seminar: ['seminar hall', 'seminar', 'presentation', 'meeting room', 'discussion hall'],
    office: ['office', 'cabin', 'hod office', 'staff room', 'admin', 'administration'],
    classroom: ['classroom', 'class', 'room', 'lecture hall', 'class room', 'lecture'],
    placement: ['placement', 'career', 'recruitment', 'job', 'interview'],
  },

  facultyKeywords: {
    queryType: ['who', 'tell me about', 'inform', 'details', 'contact', 'email', 'office', 'cabin', 'where is', 'hod'],
    designation: ['professor', 'prof', 'dr', 'associate professor', 'assistant professor', 'hod', 'head', 'lecturer'],
    specialization: ['data science', 'ai', 'machine learning', 'software engineering', 'database', 'networks', 'web', 'java', 'python', 'finance', 'marketing', 'accounting', 'management'],
    department: ['mca', 'mba', 'mcom', 'department', 'faculty', 'staff', 'teacher', 'instructor'],
  },

  timetableKeywords: {
    // NOTE: 'today' removed intentionally — 'today' alone routes to announcements,
    // not timetable. Timetable requires 'timetable'/'schedule' + dept keyword.
    queryType: ['timetable', 'time table', 'time-table', 'schedule', 'class schedule', 'lecture', 'timing', 'period', 'session'],
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'tomorrow', 'daily'],
    year: ['1st year', '2nd year', 'first year', 'second year', 'year 1', 'year 2', '1st sem', '2nd sem', '1st', '2nd', 'first', 'second'],
    timeRelated: ['9 am', '10 am', '11 am', '12 pm', '2 pm', 'morning', 'afternoon', 'lunch'],
    subject: ['data structures', 'web technologies', 'machine learning', 'database', 'networks', 'software', 'programming', 'finance', 'marketing', 'accounting', 'law'],
  },

  eventKeywords: {
    queryType: ['event', 'events', 'happening', 'coming', 'upcoming', 'schedule', 'activity', 'workshop', 'seminar', 'talk', 'hackathon', 'competition'],
    timeFrame: ['coming', 'upcoming', 'next', 'this month', 'this week', 'next week', 'soon'],
  },

  // ── Announcements / Notices / Today-Updates keywords ──────────────────────
  // Train the model with ALL possible ways a user might ask for notices/updates.
  announcementsKeywords: {
    direct: [
      'announcement', 'announcements',
      'notice', 'notices',
      'notification', 'notifications',
      'update', 'updates',
      'news', 'bulletin',
      'circular', 'circulars',
      'memo', 'memos',
    ],
    todayContext: [
      "today's update",
      "today's updates",
      "today's notice",
      "today's notices",
      "today's announcement",
      "today's announcements",
      "today's news",
      "today's information",
      'today update', 'today notice', 'today announcement',
      'what is happening today',
      'what is going on today',
      "what's happening today",
      "what's going on today",
      "what's today",
      "what is today",
      'any updates today',
      'any announcements today',
      'any notices today',
      'any news today',
      'anything today',
      'anything new today',
    ],
    modifiedNoun: [
      'latest update', 'latest updates', 'latest news',
      'latest announcement', 'latest announcements',
      'latest notice', 'latest notices',
      'recent update', 'recent news', 'recent announcement',
      'new update', 'new notice', 'new announcement',
      'college update', 'college updates', 'college announcement',
      'college notice', 'college notices',
      'important notice', 'important announcement', 'important update',
      'daily update', 'daily announcement', 'daily notice',
      'any update', 'any notice', 'any announcement',
    ],
    questions: [
      'what are the announcements',
      'what are the notices',
      'what are the updates',
      'show me the announcements',
      'show me notices',
      'show announcements',
      'show notices',
      'get announcements',
      'get notices',
      'fetch announcements',
      'is there any announcement',
      'is there any notice',
      'are there any announcements',
      'are there any notices',
      'do you have any announcements',
      'do you have any notices',
    ],
  },

  greetings: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste', 'greetings'],

  help: ['help', 'guide', 'what can you do', 'how do i', 'how to use', 'how to', 'assist', 'support'],

  thanks: ['thank you', 'thanks', 'thankyou', 'appreciate', 'grateful'],
}

// Advanced matching engine
export function matchKeywords(query: string, keywordGroup: Record<string, string[]>): string | null {
  const lowerQuery = query.toLowerCase()

  for (const [category, keywords] of Object.entries(keywordGroup)) {
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword)) {
        return category
      }
    }
  }

  return null
}

// Extract department from query
export function extractDepartment(query: string): string | null {
  const lowerQuery = query.toLowerCase()
  const deptMap: Record<string, string> = {
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

  for (const [keyword, dept] of Object.entries(deptMap)) {
    if (lowerQuery.includes(keyword)) {
      return dept
    }
  }

  return null
}

// Extract specific information from query
export function extractLocationInfo(query: string): string | null {
  const locationPatterns = [
    /where\s+(?:is|are|can i find)\s+(?:the\s+)?([a-zA-Z\s]+?)(?:\?|$)/i,
    /find\s+(?:the\s+)?([a-zA-Z\s]+?)(?:\?|$)/i,
    /(?:how to reach|how to go to|location of)\s+(?:the\s+)?([a-zA-Z\s]+?)(?:\?|$)/i,
    /\b(mca lab|library|cafeteria|auditorium|seminar|office|lab)\b/i,
  ]

  for (const pattern of locationPatterns) {
    const match = query.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return null
}

// Extract faculty name from query
export function extractFacultyInfo(query: string): string | null {
  const facultyPatterns = [
    /(?:who is|tell me about|inform about|contact)\s+(?:prof|professor|dr|\.?\s+)?([a-zA-Z\s]+?)(?:\?|$)/i,
    /(?:prof|professor|dr)\s+([a-zA-Z\s]+?)(?:\?|$)/i,
    /faculty\s+(?:named?|called?)\s+([a-zA-Z\s]+?)(?:\?|$)/i,
  ]

  for (const pattern of facultyPatterns) {
    const match = query.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return null
}

// Extract day and year from timetable query
export function extractTimetableInfo(query: string): { day: string | null; year: string | null } {
  const lowerQuery = query.toLowerCase()
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  let day = null
  let year = null

  // Extract day
  for (const d of days) {
    if (lowerQuery.includes(d)) {
      day = d
      break
    }
  }

  // Extract year
  if (/1st|first|year\s+1|year\s+one|1st\s+year/.test(lowerQuery)) {
    year = '1st'
  } else if (/2nd|second|year\s+2|year\s+two|2nd\s+year/.test(lowerQuery)) {
    year = '2nd'
  }

  return { day, year }
}

// Generate more natural response templates
export const responseTemplates = {
  location: (name: string, floor: string, building: string, description: string) =>
    `${name}\n📍 Location: ${floor}, ${building}\n📝 ${description}`,

  faculty: (name: string, designation: string, specialization: string, email: string, cabin: string) =>
    `${name}\n👤 ${designation}\n🎓 ${specialization}\n✉️ ${email}\n🏢 Cabin: ${cabin}`,

  timetable: (day: string, time: string, subject: string, faculty: string, room: string, year?: string) =>
    `${day}${year ? ` (${year} Year)` : ''}\n⏰ ${time}\n📚 ${subject}\n👨‍🏫 ${faculty}\n🏢 ${room}`,

  event: (name: string, date: string, venue: string, description: string) =>
    `${name}\n📅 ${date}\n📍 ${venue}\n📝 ${description}`,
}

// Confidence scoring for better matching
export function calculateMatchConfidence(query: string, target: string): number {
  const lowerQuery = query.toLowerCase()
  const lowerTarget = target.toLowerCase()

  const queryWords = lowerQuery.split(/\s+/)
  const targetWords = lowerTarget.split(/\s+/)

  let matches = 0
  for (const qWord of queryWords) {
    for (const tWord of targetWords) {
      if (tWord.includes(qWord) || qWord.includes(tWord)) {
        matches++
      }
    }
  }

  return matches / Math.max(queryWords.length, targetWords.length)
}

// Find best match from array
export function findBestMatch<T>(
  query: string,
  items: T[],
  getSearchableText: (item: T) => string,
  threshold: number = 0.3
): T | null {
  let bestMatch: T | null = null
  let bestScore = threshold

  for (const item of items) {
    const score = calculateMatchConfidence(query, getSearchableText(item))
    if (score > bestScore) {
      bestScore = score
      bestMatch = item
    }
  }

  return bestMatch
}
