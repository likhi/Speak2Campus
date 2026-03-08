"""
timetable_nlp.py - Natural Language Processing Module for Timetable
Handles intent detection, year extraction, and day resolution
"""

from datetime import datetime, timedelta
import re


# Year variations mapping
YEAR_VARIATIONS = {
    '1st': ['1st', '1', 'first', 'fy', 'one', '1st year', 'first year', 'year 1'],
    '2nd': ['2nd', '2', 'second', 'sy', 'two', '2nd year', 'second year', 'year 2']
}

# Department variations
DEPT_VARIATIONS = {
    'MCA': ['mca', 'master', 'computer applications', 'master of computer applications']
}

# Day variations
DAY_VARIATIONS = {
    'Monday': ['monday', 'mon'],
    'Tuesday': ['tuesday', 'tue', 'tues'],
    'Wednesday': ['wednesday', 'wed'],
    'Thursday': ['thursday', 'thurs', 'thu'],
    'Friday': ['friday', 'fri'],
    'Saturday': ['saturday', 'sat']
}

# Time context keywords
TIME_KEYWORDS = {
    'today': 'today',
    'tomorrow': 'tomorrow',
    'this week': 'week',
    'full week': 'week'
}


def clean_text(text):
    """Clean and normalize text"""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s]', ' ', text)  # Remove punctuation
    text = re.sub(r'\s+', ' ', text)       # Remove extra spaces
    return text


def is_timetable_query(text):
    """Check if the query is about timetable"""
    keywords = ['timetable', 'schedule', 'class', 'classes', 'period', 'lecture',
                'time table', 'timing', 'when', 'today', 'tomorrow', 'this week',
                'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    
    cleaned = clean_text(text)
    return any(keyword in cleaned for keyword in keywords)


def extract_year(text):
    """Extract year (1st or 2nd) from text"""
    cleaned = clean_text(text)
    
    # Check for 2nd year first (to avoid matching '1' in '2nd')
    for label, variations in YEAR_VARIATIONS.items():
        for variation in variations:
            if variation in cleaned:
                return label
    
    # Default to 1st year
    return '1st'


def extract_day(text):
    """Extract day name from text"""
    cleaned = clean_text(text)
    
    for day_name, variations in DAY_VARIATIONS.items():
        for variation in variations:
            if variation in cleaned:
                return day_name
    
    # Check for time context keywords
    for keyword, intent in TIME_KEYWORDS.items():
        if keyword in cleaned:
            if intent == 'today':
                return get_today_day_name()
            elif intent == 'tomorrow':
                return get_tomorrow_day_name()
            elif intent == 'week':
                return 'WEEK'  # Special marker for full week
    
    return None


def extract_department(text):
    """Extract department from text"""
    cleaned = clean_text(text)
    
    for dept, variations in DEPT_VARIATIONS.items():
        for variation in variations:
            if variation in cleaned:
                return dept
    
    return 'MCA'  # Default to MCA


def get_today_day_name():
    """Get current day name"""
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    today = datetime.now().weekday()
    if today == 6:  # Sunday
        return 'Monday'
    return days[today]


def get_tomorrow_day_name():
    """Get tomorrow's day name"""
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    tomorrow = (datetime.now() + timedelta(days=1)).weekday()
    if tomorrow == 6:  # Sunday
        return 'Monday'
    return days[tomorrow]


def parse_timetable_query(text):
    """
    Parse a timetable query and extract all relevant information
    Returns: dict with extracted information
    """
    extracted = {
        'is_timetable_query': is_timetable_query(text),
        'year': extract_year(text),
        'day': extract_day(text),
        'department': extract_department(text),
        'query_type': 'single_day',  # Or 'full_week'
        'raw_query': text
    }
    
    # Determine query type
    if extracted['day'] == 'WEEK':
        extracted['query_type'] = 'full_week'
        extracted['day'] = None
    elif extracted['day'] is None:
        # No specific day mentioned - default to today
        if 'today' in clean_text(text):
            extracted['day'] = get_today_day_name()
        elif 'tomorrow' in clean_text(text):
            extracted['day'] = get_tomorrow_day_name()
    
    return extracted


# Test the module
if __name__ == "__main__":
    test_queries = [
        "Show first year MCA timetable for Monday",
        "Give me tomorrow's timetable",
        "Show this week timetable for second year",
        "What classes do 2nd year have today",
        "Show 1st year this week timetable"
    ]
    
    print("=" * 60)
    print("  TIMETABLE NLP MODULE TEST")
    print("=" * 60)
    
    for query in test_queries:
        result = parse_timetable_query(query)
        print(f"\nQuery: {query}")
        print(f"  Year: {result['year']}")
        print(f"  Day: {result['day']}")
        print(f"  Query Type: {result['query_type']}")
        print(f"  Is Timetable Query: {result['is_timetable_query']}")
