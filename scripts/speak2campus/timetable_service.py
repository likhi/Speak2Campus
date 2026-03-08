"""
timetable_service.py - Business Logic Service for Timetable Module
Handles querying and formatting timetable data
"""

from timetable_db import (
    query_timetable_by_day,
    query_timetable_by_week,
    get_today_day_name,
    get_tomorrow_day_name
)


def get_timetable(year, day=None, query_type='single_day'):
    """
    Fetch timetable data based on year, day, and query type
    
    Args:
        year: '1st' or '2nd'
        day: Day name or None
        query_type: 'single_day' or 'full_week'
    
    Returns:
        List of timetable entries or formatted response
    """
    try:
        if query_type == 'full_week':
            # Return entire week's timetable
            data = query_timetable_by_week(year)
        else:
            # Return specific day's timetable
            if day is None:
                day = get_today_day_name()
            data = query_timetable_by_day(year, day)
        
        return data
    
    except Exception as e:
        print(f"[Database Error: {e}]")
        return None


def format_timetable_display(data, day=None, query_type='single_day'):
    """
    Format timetable data for display
    Shows classes in a readable format
    """
    if not data:
        if day:
            return f"❌ No timetable available for {day}"
        return "❌ No timetable available"
    
    result_lines = []
    
    if query_type == 'full_week':
        # Group by day for full week display
        current_day = None
        for entry in data:
            if entry['day'] != current_day:
                current_day = entry['day']
                result_lines.append(f"\n📅 {current_day}")
                result_lines.append("-" * 60)
            
            time_slot = f"{entry['start_time']}-{entry['end_time']}"
            result_lines.append(f"  {time_slot:>12} | {entry['subject']:30} | {entry['faculty']:20} ({entry['room']})")
    else:
        # Single day display
        if day:
            result_lines.append(f"📅 Timetable for {day}")
        else:
            result_lines.append("📅 Timetable")
        
        result_lines.append("-" * 80)
        result_lines.append(f"{'Time':>12} | {'Subject':30} | {'Faculty':20} | {'Room'}")
        result_lines.append("-" * 80)
        
        for entry in data:
            time_slot = f"{entry['start_time']}-{entry['end_time']}"
            result_lines.append(f"  {time_slot:>10} | {entry['subject']:30} | {entry['faculty']:20} | {entry['room']}")
    
    return "\n".join(result_lines)


def format_timetable_speech(data, day=None, query_type='single_day'):
    """
    Format timetable data for speech output
    Creates a concise summary for TTS
    """
    if not data:
        if day:
            return f"No timetable available for {day}."
        return "No timetable available."
    
    speech_parts = []
    
    if query_type == 'full_week':
        # Summarize week's timetable
        speech_parts.append("Here is the complete week's timetable:")
        
        current_day = None
        for entry in data:
            if entry['day'] != current_day:
                current_day = entry['day']
                speech_parts.append(f"{current_day}:")
            
            # Skip lunch break in speech
            if entry['subject'].upper() == 'LUNCH BREAK':
                continue
            
            speech_parts.append(
                f"{entry['subject']} from {entry['start_time']} to {entry['end_time']} "
                f"with {entry['faculty']} in {entry['room']}."
            )
    else:
        # Single day summary
        if day:
            speech_parts.append(f"Here is the timetable for {day}:")
        else:
            speech_parts.append("Here is the timetable:")
        
        for i, entry in enumerate(data):
            # Skip lunch break in speech
            if entry['subject'].upper() == 'LUNCH BREAK':
                continue
            
            speech_parts.append(
                f"{entry['subject']} from {entry['start_time']} to {entry['end_time']} "
                f"with {entry['faculty']} in {entry['room']}."
            )
        
        if len(data) <= 1:
            speech_parts.append("No classes scheduled.")
    
    return " ".join(speech_parts)


def handle_timetable_query(query_info):
    """
    Handle a complete timetable query
    
    Args:
        query_info: Dict from timetable_nlp.parse_timetable_query()
    
    Returns:
        Tuple of (display_text, speech_text)
    """
    year = query_info['year']
    day = query_info['day']
    query_type = query_info['query_type']
    
    # Fetch data
    data = get_timetable(year, day, query_type)
    
    # Format for display
    display_text = format_timetable_display(data, day, query_type)
    
    # Format for speech
    speech_text = format_timetable_speech(data, day, query_type)
    
    return display_text, speech_text


# Test the module
if __name__ == "__main__":
    from timetable_nlp import parse_timetable_query
    
    test_queries = [
        "Show first year MCA timetable for Monday",
        "Give me tomorrow's timetable",
        "Show this week timetable for second year",
        "What classes do 2nd year have today",
        "Show 1st year this week timetable"
    ]
    
    print("=" * 80)
    print("  TIMETABLE SERVICE MODULE TEST")
    print("=" * 80)
    
    for query in test_queries:
        print(f"\n{'='*80}")
        print(f"Query: {query}")
        print('='*80)
        
        # Parse query
        query_info = parse_timetable_query(query)
        
        # Get display and speech
        display, speech = handle_timetable_query(query_info)
        
        print("\n--- DISPLAY OUTPUT ---")
        print(display)
        
        print("\n--- SPEECH OUTPUT ---")
        print(speech)
        print()
