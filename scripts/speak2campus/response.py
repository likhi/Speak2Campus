"""
response.py - Response Generation Module for SPEAK2CAMPUS
Handles text-to-speech output and response formatting
"""

import pyttsx3


# Initialize the text-to-speech engine
def init_tts_engine():
    """Initialize and configure the TTS engine"""
    engine = pyttsx3.init()
    
    # Set properties
    engine.setProperty('rate', 150)      # Speed of speech (words per minute)
    engine.setProperty('volume', 0.9)    # Volume (0.0 to 1.0)
    
    # Try to set a female voice if available
    voices = engine.getProperty('voices')
    for voice in voices:
        if 'female' in voice.name.lower() or 'zira' in voice.name.lower():
            engine.setProperty('voice', voice.id)
            break
    
    return engine


# Global TTS engine instance
tts_engine = None


def get_tts_engine():
    """Get or create TTS engine instance (singleton pattern)"""
    global tts_engine
    if tts_engine is None:
        tts_engine = init_tts_engine()
    return tts_engine


def speak(text):
    """
    Convert text to speech and play it
    """
    try:
        engine = get_tts_engine()
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        print(f"[TTS Error: {e}]")


def format_location_response(results):
    """Format location query results into readable text"""
    if not results:
        return "Sorry, I couldn't find that location in our campus database."
    
    response_lines = []
    for loc in results:
        line = f"{loc['name']} is located in {loc['building']}, {loc['floor']}."
        if loc['description']:
            line += f" {loc['description']}"
        response_lines.append(line)
    
    return " ".join(response_lines)


def format_faculty_response(results):
    """Format faculty query results into readable text"""
    if not results:
        return "Sorry, I couldn't find that faculty member in our database."
    
    response_lines = []
    for faculty in results:
        line = f"{faculty['name']} is {faculty['designation']} in {faculty['department']} department."
        line += f" Office: {faculty['office']}."
        if faculty['phone']:
            line += f" Contact: {faculty['phone']}."
        response_lines.append(line)
    
    return " ".join(response_lines)


def format_timetable_response(results, day=None):
    """Format timetable query results into readable text"""
    if not results:
        if day:
            return f"No classes scheduled for {day}."
        return "Sorry, I couldn't find the timetable information."
    
    if day:
        response = f"Here is the timetable for {day}: "
    else:
        response = "Here is the complete timetable: "
    
    current_day = None
    for entry in results:
        if entry['day'] != current_day:
            current_day = entry['day']
            if not day:  # Only add day header for full timetable
                response += f"\n{current_day}: "
        
        response += f"{entry['subject']} at {entry['time']} by {entry['faculty']}. "
    
    return response


def format_events_response(results):
    """Format events query results into readable text"""
    if not results:
        return "No upcoming events found at this time."
    
    response = "Here are the upcoming events at Seshadripuram College: "
    for event in results:
        response += f"{event['name']} on {event['date']} at {event['venue']}. {event['description']}. "
    
    return response


def format_help_response():
    """Return help text with available commands"""
    help_text = """
Welcome to SPEAK2CAMPUS - Seshadripuram College Tumkur, MCA Department Assistant!

You can ask me about:

1. LOCATIONS: "Where is the computer lab?", "Find the library", "Location of HOD office"

2. FACULTY: "Who is the HOD of MCA?", "Tell me about Dr. Ramesh Kumar", "Contact of principal"

3. TIMETABLE: "Show MCA timetable", "What classes on Monday?", "Today's schedule"

4. EVENTS: "What are the upcoming events?", "Any placement drives?"

5. HELP: "Help", "What can you do?"

Say 'quit' or 'exit' to close the application.
    """
    return help_text.strip()


def format_unknown_response():
    """Return response for unrecognized queries"""
    return "I'm sorry, I didn't understand that. Please try asking about locations, faculty, timetable, or events. Say 'help' for available commands."


def display_response(text, with_speech=True):
    """
    Display the response text and optionally speak it
    """
    print("\n" + "=" * 50)
    print("🤖 SPEAK2CAMPUS Response:")
    print("=" * 50)
    print(text)
    print("=" * 50)
    
    if with_speech:
        speak(text)


def display_welcome():
    """Display welcome message"""
    welcome_text = """
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🎓 SPEAK2CAMPUS - Voice-Based Campus Assistant 🎓         ║
║                                                              ║
║   Seshadripuram College, Tumkur                             ║
║   Department of Master of Computer Applications (MCA)       ║
║                                                              ║
║   Say 'help' for available commands                         ║
║   Say 'quit' or 'exit' to close                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    """
    print(welcome_text)
    speak("Welcome to Speak to Campus, Seshadripuram College Tumkur, MCA Department. How can I help you today?")


def display_goodbye():
    """Display goodbye message"""
    goodbye_text = """
╔══════════════════════════════════════════════════════════════╗
║   Thank you for using SPEAK2CAMPUS!                         ║
║   Seshadripuram College, Tumkur - MCA Department            ║
║   Goodbye! 👋                                                ║
╚══════════════════════════════════════════════════════════════╝
    """
    print(goodbye_text)
    speak("Thank you for using Speak to Campus. Goodbye!")


# Test the module
if __name__ == "__main__":
    print("Testing TTS Engine...")
    speak("Hello! This is a test of the Speak to Campus text to speech system.")
    print("TTS test complete!")
