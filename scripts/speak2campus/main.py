"""
main.py - Main Application for SPEAK2CAMPUS
Voice-Based College Navigation and Information Assistant
Seshadripuram College, Tumkur - MCA Department
"""

import os
import sys

# Import all modules
from database import (
    initialize_database, 
    query_location, 
    query_faculty, 
    query_events
)
from timetable_db import initialize_timetable_database
from timetable_nlp import parse_timetable_query, is_timetable_query
from timetable_service import handle_timetable_query
from keyword_processor import process_query
from response import (
    display_welcome,
    display_goodbye,
    display_response,
    format_location_response,
    format_faculty_response,
    format_timetable_response,
    format_events_response,
    format_help_response,
    format_unknown_response
)
from voice_input import get_voice_input, get_text_input, test_microphone


def handle_query(query_text):
    """
    Process a user query and return appropriate response
    """
    # Check for exit commands
    if query_text.lower() in ['quit', 'exit', 'bye', 'goodbye', 'close']:
        return None, True  # Signal to exit
    
    # Check if it's a timetable query first (priority handling)
    if is_timetable_query(query_text):
        query_info = parse_timetable_query(query_text)
        display_text, speech_text = handle_timetable_query(query_info)
        return display_text, False  # Return with display text
    
    # Process the query using original keyword processor
    query_info = process_query(query_text)
    intent = query_info['intent']
    
    # Generate response based on intent
    if intent == "location":
        # Search for location
        search_term = ' '.join(query_info['search_terms']) if query_info['search_terms'] else query_text
        results = query_location(search_term)
        response = format_location_response(results)
        
    elif intent == "faculty":
        # Search for faculty
        search_term = ' '.join(query_info['search_terms']) if query_info['search_terms'] else query_text
        results = query_faculty(search_term)
        response = format_faculty_response(results)
        
    elif intent == "events":
        # Get events
        results = query_events()
        response = format_events_response(results)
        
    elif intent == "help":
        # Show help
        response = format_help_response()
        
    else:
        # Unknown intent
        response = format_unknown_response()
    
    return response, False


def main():
    """
    Main application loop
    """
    # Clear screen for better UX
    os.system('cls' if os.name == 'nt' else 'clear')
    
    # Initialize the database
    print("🔄 Initializing SPEAK2CAMPUS database...")
    initialize_database()
    print("✓ Main database initialized")
    
    # Initialize timetable database
    print("🔄 Initializing timetable database...")
    initialize_timetable_database()
    print("✓ Timetable database initialized")
    print()
    
    # Display welcome message
    display_welcome()
    
    # Check if microphone is available
    mic_available = test_microphone()
    
    if not mic_available:
        print("\n⚠️  Microphone not available. Using text input mode.")
        print("   (Install PyAudio for voice input support)")
    
    # Main interaction loop
    while True:
        try:
    # Get user input (voice or text)
            if mic_available:
                print("\n" + "-" * 50)
                print("Press ENTER to speak or type your query directly:")
                user_input = input(">>> ").strip()
                
                if user_input == "":
                    # User pressed Enter - use voice input
                    success, query_text = get_voice_input()
                    if not success:
                        print(f"⚠️  {query_text}")
                        continue
                else:
                    # User typed something
                    query_text = user_input
            else:
                # Text-only mode
                query_text = get_text_input()
            
            # Skip empty queries
            if not query_text or query_text.strip() == "":
                continue
            
            # Handle the query
            response, should_exit = handle_query(query_text)
            
            if should_exit:
                display_goodbye()
                break
            
            # Display and speak the response
            display_response(response, with_speech=True)
            
        except KeyboardInterrupt:
            # Handle Ctrl+C
            print("\n")
            display_goodbye()
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            print("Please try again.")
            continue


# Entry point
if __name__ == "__main__":
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║                    SPEAK2CAMPUS                              ║
    ║         Voice-Based College Navigation Assistant             ║
    ║                                                              ║
    ║         Seshadripuram College, Tumkur                       ║
    ║         MCA Department                                       ║
    ╚══════════════════════════════════════════════════════════════╝
    """)
    main()
