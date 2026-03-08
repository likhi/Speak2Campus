"""
database.py - Database operations for SPEAK2CAMPUS
Handles SQLite database creation, connection, and queries
"""

import sqlite3
import os

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "campus.db")


def get_connection():
    """Create and return a database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Enable column access by name
    return conn


def create_tables():
    """Create all required tables for the campus database"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Create locations table - stores campus locations info
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            building TEXT NOT NULL,
            floor TEXT NOT NULL,
            description TEXT
        )
    ''')
    
    # Create faculty table - stores faculty information
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS faculty (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            designation TEXT NOT NULL,
            department TEXT NOT NULL,
            office TEXT NOT NULL,
            phone TEXT
        )
    ''')
    
    # Create timetable table - stores class schedules
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS timetable (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            department TEXT NOT NULL,
            semester TEXT NOT NULL,
            day TEXT NOT NULL,
            subject TEXT NOT NULL,
            time TEXT NOT NULL,
            faculty TEXT
        )
    ''')
    
    # Create events table - for college events (bonus feature)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            date TEXT NOT NULL,
            venue TEXT NOT NULL,
            description TEXT
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✓ Tables created successfully!")


def insert_sample_data():
    """Insert sample data for Seshadripuram College Tumkur - MCA Department"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Clear existing data
    cursor.execute("DELETE FROM locations")
    cursor.execute("DELETE FROM faculty")
    cursor.execute("DELETE FROM timetable")
    cursor.execute("DELETE FROM events")
    
    # ========== LOCATIONS DATA ==========
    locations_data = [
        ("MCA Computer Lab", "MCA Block", "First Floor", "Main computer laboratory with 60 systems for MCA students"),
        ("MCA Seminar Hall", "MCA Block", "Second Floor", "Seminar hall with projector and 100 seating capacity"),
        ("MCA Library", "Main Building", "Ground Floor", "Department library with MCA reference books and journals"),
        ("HOD Office MCA", "MCA Block", "First Floor", "Head of Department office for MCA"),
        ("Principal Office", "Main Building", "First Floor", "Principal's office and administrative section"),
        ("Admission Office", "Main Building", "Ground Floor", "Admission and enquiry counter"),
        ("Examination Cell", "Main Building", "First Floor", "Examination section for results and hall tickets"),
        ("Cafeteria", "Canteen Block", "Ground Floor", "College canteen with vegetarian food"),
        ("Sports Ground", "Campus Ground", "Open Area", "Sports ground for cricket, football and athletics"),
        ("Auditorium", "Main Building", "Ground Floor", "Main auditorium with 500 seating capacity"),
        ("Placement Cell", "MCA Block", "Second Floor", "Training and placement office"),
        ("Girls Common Room", "Main Building", "First Floor", "Rest room facility for girl students"),
        ("Boys Common Room", "Main Building", "First Floor", "Rest room facility for boy students"),
        ("Parking Area", "Campus Entrance", "Ground Level", "Two-wheeler and four-wheeler parking"),
        ("Medical Room", "Main Building", "Ground Floor", "First aid and medical assistance room"),
    ]
    
    cursor.executemany(
        "INSERT INTO locations (name, building, floor, description) VALUES (?, ?, ?, ?)",
        locations_data
    )
    
    # ========== FACULTY DATA ==========
    faculty_data = [
        ("Dr. Ramesh Kumar", "HOD & Professor", "MCA", "Room 101, MCA Block", "9876543210"),
        ("Prof. Srinivas Murthy", "Associate Professor", "MCA", "Room 102, MCA Block", "9876543211"),
        ("Mrs. Lakshmi Devi", "Assistant Professor", "MCA", "Room 103, MCA Block", "9876543212"),
        ("Mr. Manjunath H", "Assistant Professor", "MCA", "Room 104, MCA Block", "9876543213"),
        ("Mrs. Kavitha R", "Assistant Professor", "MCA", "Room 105, MCA Block", "9876543214"),
        ("Mr. Suresh Babu", "Assistant Professor", "MCA", "Room 106, MCA Block", "9876543215"),
        ("Dr. Priya Sharma", "Associate Professor", "MCA", "Room 107, MCA Block", "9876543216"),
        ("Mr. Venkatesh N", "Lab Instructor", "MCA", "Computer Lab, MCA Block", "9876543217"),
        ("Dr. Anand Kumar", "Principal", "Administration", "Principal Office, Main Building", "9876543200"),
        ("Mrs. Sunitha M", "Librarian", "Library", "Main Library, Main Building", "9876543218"),
    ]
    
    cursor.executemany(
        "INSERT INTO faculty (name, designation, department, office, phone) VALUES (?, ?, ?, ?, ?)",
        faculty_data
    )
    
    # ========== TIMETABLE DATA (MCA 1st Semester) ==========
    timetable_data = [
        # Monday
        ("MCA", "1st Semester", "Monday", "Problem Solving using C", "9:00 AM - 10:00 AM", "Mrs. Lakshmi Devi"),
        ("MCA", "1st Semester", "Monday", "Computer Organization", "10:00 AM - 11:00 AM", "Mr. Manjunath H"),
        ("MCA", "1st Semester", "Monday", "Mathematical Foundations", "11:15 AM - 12:15 PM", "Prof. Srinivas Murthy"),
        ("MCA", "1st Semester", "Monday", "C Programming Lab", "2:00 PM - 5:00 PM", "Mrs. Kavitha R"),
        
        # Tuesday
        ("MCA", "1st Semester", "Tuesday", "Data Structures", "9:00 AM - 10:00 AM", "Mr. Suresh Babu"),
        ("MCA", "1st Semester", "Tuesday", "Operating Systems", "10:00 AM - 11:00 AM", "Dr. Priya Sharma"),
        ("MCA", "1st Semester", "Tuesday", "Problem Solving using C", "11:15 AM - 12:15 PM", "Mrs. Lakshmi Devi"),
        ("MCA", "1st Semester", "Tuesday", "Data Structures Lab", "2:00 PM - 5:00 PM", "Mr. Suresh Babu"),
        
        # Wednesday
        ("MCA", "1st Semester", "Wednesday", "Computer Organization", "9:00 AM - 10:00 AM", "Mr. Manjunath H"),
        ("MCA", "1st Semester", "Wednesday", "Mathematical Foundations", "10:00 AM - 11:00 AM", "Prof. Srinivas Murthy"),
        ("MCA", "1st Semester", "Wednesday", "Data Structures", "11:15 AM - 12:15 PM", "Mr. Suresh Babu"),
        ("MCA", "1st Semester", "Wednesday", "Operating Systems", "2:00 PM - 3:00 PM", "Dr. Priya Sharma"),
        
        # Thursday
        ("MCA", "1st Semester", "Thursday", "Problem Solving using C", "9:00 AM - 10:00 AM", "Mrs. Lakshmi Devi"),
        ("MCA", "1st Semester", "Thursday", "Data Structures", "10:00 AM - 11:00 AM", "Mr. Suresh Babu"),
        ("MCA", "1st Semester", "Thursday", "Computer Organization", "11:15 AM - 12:15 PM", "Mr. Manjunath H"),
        ("MCA", "1st Semester", "Thursday", "OS Lab", "2:00 PM - 5:00 PM", "Dr. Priya Sharma"),
        
        # Friday
        ("MCA", "1st Semester", "Friday", "Mathematical Foundations", "9:00 AM - 10:00 AM", "Prof. Srinivas Murthy"),
        ("MCA", "1st Semester", "Friday", "Operating Systems", "10:00 AM - 11:00 AM", "Dr. Priya Sharma"),
        ("MCA", "1st Semester", "Friday", "Seminar", "11:15 AM - 12:15 PM", "Dr. Ramesh Kumar"),
        ("MCA", "1st Semester", "Friday", "Library Hour", "2:00 PM - 3:00 PM", "Self Study"),
        
        # Saturday
        ("MCA", "1st Semester", "Saturday", "Guest Lecture", "9:00 AM - 11:00 AM", "Visiting Faculty"),
        ("MCA", "1st Semester", "Saturday", "Project Discussion", "11:15 AM - 12:15 PM", "Dr. Ramesh Kumar"),
    ]
    
    cursor.executemany(
        "INSERT INTO timetable (department, semester, day, subject, time, faculty) VALUES (?, ?, ?, ?, ?, ?)",
        timetable_data
    )
    
    # ========== EVENTS DATA ==========
    events_data = [
        ("Technical Symposium", "2025-02-15", "MCA Seminar Hall", "Annual technical fest with coding competitions"),
        ("Campus Placement Drive", "2025-03-01", "Auditorium", "Major IT companies visiting for recruitment"),
        ("Workshop on AI/ML", "2025-02-20", "MCA Computer Lab", "Hands-on workshop on Artificial Intelligence"),
        ("Sports Day", "2025-01-26", "Sports Ground", "Annual sports meet and cultural events"),
    ]
    
    cursor.executemany(
        "INSERT INTO events (name, date, venue, description) VALUES (?, ?, ?, ?)",
        events_data
    )
    
    conn.commit()
    conn.close()
    print("✓ Sample data inserted successfully!")


def query_location(keyword):
    """Query locations table based on keyword"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Search in name, building, and description
    query = """
        SELECT * FROM locations 
        WHERE LOWER(name) LIKE ? 
        OR LOWER(building) LIKE ? 
        OR LOWER(description) LIKE ?
    """
    search_term = f"%{keyword.lower()}%"
    cursor.execute(query, (search_term, search_term, search_term))
    results = cursor.fetchall()
    conn.close()
    return results


def query_faculty(keyword):
    """Query faculty table based on keyword"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Search in name, designation, and department
    query = """
        SELECT * FROM faculty 
        WHERE LOWER(name) LIKE ? 
        OR LOWER(designation) LIKE ? 
        OR LOWER(department) LIKE ?
    """
    search_term = f"%{keyword.lower()}%"
    cursor.execute(query, (search_term, search_term, search_term))
    results = cursor.fetchall()
    conn.close()
    return results


def query_timetable(department="MCA", day=None):
    """Query timetable based on department and optional day"""
    conn = get_connection()
    cursor = conn.cursor()
    
    if day:
        query = """
            SELECT * FROM timetable 
            WHERE LOWER(department) LIKE ? AND LOWER(day) LIKE ?
            ORDER BY time
        """
        cursor.execute(query, (f"%{department.lower()}%", f"%{day.lower()}%"))
    else:
        query = """
            SELECT * FROM timetable 
            WHERE LOWER(department) LIKE ?
            ORDER BY day, time
        """
        cursor.execute(query, (f"%{department.lower()}%",))
    
    results = cursor.fetchall()
    conn.close()
    return results


def query_events():
    """Query all upcoming events"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events ORDER BY date")
    results = cursor.fetchall()
    conn.close()
    return results


# Initialize database when module is imported
def initialize_database():
    """Initialize the database with tables and sample data"""
    create_tables()
    insert_sample_data()
    print("✓ Database initialized for Seshadripuram College Tumkur - MCA Department!")


if __name__ == "__main__":
    # Run this to set up the database
    initialize_database()
