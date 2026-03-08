"""
keyword_processor.py - Keyword Processing Module for SPEAK2CAMPUS
Handles intent detection and keyword extraction from user queries
"""

import re


# Define intent patterns and their associated keywords
INTENT_PATTERNS = {
    "location": {
        "keywords": ["where", "location", "find", "locate", "place", "room", "building", 
                     "lab", "library", "office", "cafeteria", "canteen", "auditorium",
                     "parking", "ground", "hall", "cell", "common room", "medical"],
        "questions": ["where is", "how to find", "location of", "where can i find",
                      "take me to", "directions to", "how to reach"]
    },
    "faculty": {
        "keywords": ["who", "faculty", "professor", "teacher", "hod", "head", "principal",
                     "sir", "madam", "mam", "staff", "instructor", "lecturer", "dr", "mr", "mrs"],
        "questions": ["who is", "tell me about", "contact of", "phone number of",
                      "office of", "who teaches"]
    },
    "timetable": {
        "keywords": ["timetable", "schedule", "class", "classes", "time table", "when",
                     "today", "tomorrow", "monday", "tuesday", "wednesday", "thursday",
                     "friday", "saturday", "subject", "lecture", "period"],
        "questions": ["show timetable", "what is the schedule", "when is", "class timing",
                      "show schedule", "what classes"]
    },
    "events": {
        "keywords": ["event", "events", "fest", "function", "program", "workshop",
                     "seminar", "placement", "sports", "cultural", "symposium"],
        "questions": ["what events", "upcoming events", "any events", "show events"]
    },
    "help": {
        "keywords": ["help", "commands", "what can you do", "options", "menu", "assist"],
        "questions": ["help me", "what can i ask", "show commands"]
    }
}

# Day mapping for timetable queries
DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

# Department mapping
DEPARTMENTS = {
    "mca": "MCA",
    "master of computer applications": "MCA",
    "computer applications": "MCA",
    "cse": "CSE",
    "computer science": "CSE",
}


def clean_text(text):
    """
    Clean and normalize the input text
    - Convert to lowercase
    - Remove extra spaces
    - Remove special characters
    """
    text = text.lower().strip()
    text = re.sub(r'[^\w\s]', ' ', text)  # Remove punctuation
    text = re.sub(r'\s+', ' ', text)       # Remove extra spaces
    return text


def detect_intent(text):
    """
    Detect the user's intent from the query text
    Returns: str - intent type (location, faculty, timetable, events, help, unknown)
    """
    cleaned_text = clean_text(text)
    
    # Calculate match scores for each intent
    intent_scores = {}
    
    for intent, patterns in INTENT_PATTERNS.items():
        score = 0
        
        # Check for keyword matches
        for keyword in patterns["keywords"]:
            if keyword in cleaned_text:
                score += 1
        
        # Check for question pattern matches (higher weight)
        for question in patterns["questions"]:
            if question in cleaned_text:
                score += 2
        
        intent_scores[intent] = score
    
    # Find the intent with highest score
    best_intent = max(intent_scores, key=intent_scores.get)
    
    # Return unknown if no matches found
    if intent_scores[best_intent] == 0:
        return "unknown"
    
    return best_intent


def extract_keywords(text, intent):
    """
    Extract relevant keywords based on detected intent
    Returns: dict with extracted information
    """
    cleaned_text = clean_text(text)
    extracted = {
        "raw_query": text,
        "cleaned_query": cleaned_text,
        "intent": intent,
        "search_terms": [],
        "day": None,
        "department": "MCA"  # Default department
    }
    
    # Extract day for timetable queries
    for day in DAYS:
        if day in cleaned_text:
            extracted["day"] = day.capitalize()
            break
    
    # Check for "today" or "tomorrow"
    if "today" in cleaned_text:
        import datetime
        extracted["day"] = datetime.datetime.now().strftime("%A")
    
    # Extract department
    for dept_key, dept_value in DEPARTMENTS.items():
        if dept_key in cleaned_text:
            extracted["department"] = dept_value
            break
    
    # Extract meaningful search terms based on intent
    if intent == "location":
        # Location-specific keywords to search
        location_terms = ["lab", "library", "office", "cafeteria", "canteen", "auditorium",
                         "parking", "ground", "hall", "cell", "room", "seminar", "principal",
                         "admission", "examination", "placement", "medical", "common"]
        for term in location_terms:
            if term in cleaned_text:
                extracted["search_terms"].append(term)
        
        # Also extract specific location names
        specific_locations = ["computer", "mca", "main", "sports", "girls", "boys"]
        for loc in specific_locations:
            if loc in cleaned_text:
                extracted["search_terms"].append(loc)
                
    elif intent == "faculty":
        # Extract faculty-related search terms
        faculty_terms = ["hod", "head", "principal", "professor"]
        for term in faculty_terms:
            if term in cleaned_text:
                extracted["search_terms"].append(term)
        
        # Try to extract names (words that might be names)
        words = cleaned_text.split()
        name_prefixes = ["dr", "mr", "mrs", "prof", "ms"]
        for i, word in enumerate(words):
            if word in name_prefixes and i + 1 < len(words):
                extracted["search_terms"].append(words[i + 1])
                
    elif intent == "timetable":
        # Department is already extracted
        pass
        
    elif intent == "events":
        # Event-specific keywords
        event_terms = ["placement", "sports", "technical", "workshop", "seminar"]
        for term in event_terms:
            if term in cleaned_text:
                extracted["search_terms"].append(term)
    
    return extracted


def process_query(text):
    """
    Main function to process a user query
    Returns: dict with intent and extracted information
    """
    # Detect intent
    intent = detect_intent(text)
    
    # Extract keywords
    extracted_info = extract_keywords(text, intent)
    
    return extracted_info


# Test the module
if __name__ == "__main__":
    print("=" * 50)
    print("  SPEAK2CAMPUS - Keyword Processor Test")
    print("=" * 50)
    
    test_queries = [
        "Where is the computer lab?",
        "Who is the HOD of MCA?",
        "Show me the MCA timetable for Monday",
        "What are the upcoming events?",
        "Help me",
        "I want to eat food"
    ]
    
    for query in test_queries:
        print(f"\nQuery: \"{query}\"")
        result = process_query(query)
        print(f"  Intent: {result['intent']}")
        print(f"  Search Terms: {result['search_terms']}")
        print(f"  Day: {result['day']}")
        print(f"  Department: {result['department']}")
