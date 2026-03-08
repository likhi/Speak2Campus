"""
timetable_db.py - Timetable Database Module for SPEAK2CAMPUS
Handles SQLite database creation, queries, and management for timetable
"""

import sqlite3
import os
from datetime import datetime, timedelta

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "campus.db")


def get_connection():
    """Create and return a database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def create_timetable_schema():
    """Create the redesigned timetable table with proper schema"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Drop old timetable if exists (for clean migration)
    cursor.execute("DROP TABLE IF EXISTS timetable_new")
    
    # Create new timetable table with improved schema
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS timetable_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year TEXT NOT NULL,              # '1st' or '2nd'
            department TEXT NOT NULL,         # 'MCA'
            day TEXT NOT NULL,                # 'Monday', 'Tuesday', etc.
            subject TEXT NOT NULL,
            start_time TEXT NOT NULL,         # '09:00' format
            end_time TEXT NOT NULL,           # '10:00' format
            faculty TEXT,
            room TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✓ Timetable schema created successfully!")


def insert_timetable_samples():
    """Insert comprehensive sample data for 1st and 2nd year MCA students"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Clear existing timetable data
    cursor.execute("DELETE FROM timetable_new")
    
    # ===== 1ST YEAR MCA TIMETABLE DATA =====
    first_year_data = [
        # Monday - 1st Year
        ('1st', 'MCA', 'Monday', 'Data Structures', '09:00', '10:00', 'Dr. Ramesh Kumar', 'Lab 1'),
        ('1st', 'MCA', 'Monday', 'Database Fundamentals', '10:00', '11:00', 'Dr. Priya Sharma', 'Lab 2'),
        ('1st', 'MCA', 'Monday', 'Web Development Basics', '11:00', '12:00', 'Mr. Arun Patel', 'Lab 3'),
        ('1st', 'MCA', 'Monday', 'LUNCH BREAK', '12:00', '13:00', 'Self', 'Cafeteria'),
        ('1st', 'MCA', 'Monday', 'Mathematics for Computing', '13:00', '14:00', 'Dr. Ramesh Kumar', 'Classroom 1'),
        
        # Tuesday - 1st Year
        ('1st', 'MCA', 'Tuesday', 'Operating Systems', '09:00', '10:00', 'Ms. Deepika Singh', 'Lab 1'),
        ('1st', 'MCA', 'Tuesday', 'Introduction to AI', '10:00', '11:00', 'Mr. Vikram Kumar', 'Lab 2'),
        ('1st', 'MCA', 'Tuesday', 'Computer Networks', '11:00', '12:00', 'Mr. Arun Patel', 'Lab 3'),
        ('1st', 'MCA', 'Tuesday', 'LUNCH BREAK', '12:00', '13:00', 'Self', 'Cafeteria'),
        ('1st', 'MCA', 'Tuesday', 'Software Engineering', '13:00', '14:00', 'Dr. Ramesh Kumar', 'Classroom 2'),
        
        # Wednesday - 1st Year
        ('1st', 'MCA', 'Wednesday', 'Java Programming', '09:00', '10:00', 'Mr. Arun Patel', 'Lab 1'),
        ('1st', 'MCA', 'Wednesday', 'Cybersecurity Basics', '10:00', '11:00', 'Mrs. Kavya Reddy', 'Lab 2'),
        ('1st', 'MCA', 'Wednesday', 'Database Design Lab', '11:00', '12:00', 'Dr. Priya Sharma', 'Lab 3'),
        ('1st', 'MCA', 'Wednesday', 'LUNCH BREAK', '12:00', '13:00', 'Self', 'Cafeteria'),
        ('1st', 'MCA', 'Wednesday', 'Cloud Computing Intro', '13:00', '14:00', 'Ms. Deepika Singh', 'Classroom 1'),
        
        # Thursday - 1st Year
        ('1st', 'MCA', 'Thursday', 'Python Programming', '09:00', '10:00', 'Mr. Vikram Kumar', 'Lab 1'),
        ('1st', 'MCA', 'Thursday', 'Advanced SQL', '10:00', '11:00', 'Dr. Priya Sharma', 'Lab 2'),
        ('1st', 'MCA', 'Thursday', 'Web Frameworks', '11:00', '12:00', 'Mr. Arun Patel', 'Lab 3'),
        ('1st', 'MCA', 'Thursday', 'LUNCH BREAK', '12:00', '13:00', 'Self', 'Cafeteria'),
        ('1st', 'MCA', 'Thursday', 'Data Structures Lab', '13:00', '14:00', 'Dr. Ramesh Kumar', 'Classroom 2'),
        
        # Friday - 1st Year
        ('1st', 'MCA', 'Friday', 'Machine Learning Basics', '09:00', '10:00', 'Mr. Vikram Kumar', 'Lab 1'),
        ('1st', 'MCA', 'Friday', 'Network Security', '10:00', '11:00', 'Mrs. Kavya Reddy', 'Lab 2'),
        ('1st', 'MCA', 'Friday', 'Project Work / Lab', '11:00', '12:00', 'Dr. Ramesh Kumar', 'Lab 3'),
        ('1st', 'MCA', 'Friday', 'LUNCH BREAK', '12:00', '13:00', 'Self', 'Cafeteria'),
        ('1st', 'MCA', 'Friday', 'Seminar / Discussion', '13:00', '14:00', 'Dr. Priya Sharma', 'Classroom 1'),
        
        # Saturday - 1st Year
        ('1st', 'MCA', 'Saturday', 'Guest Lecture', '09:00', '11:00', 'Visiting Faculty', 'Seminar Hall'),
        ('1st', 'MCA', 'Saturday', 'Project Discussion', '11:00', '12:00', 'Dr. Ramesh Kumar', 'Classroom 1'),
    ]
    
    # ===== 2ND YEAR MCA TIMETABLE DATA =====
    second_year_data = [
        # Monday - 2nd Year
        ('2nd', 'MCA', 'Monday', 'Advanced Database Systems', '09:00', '10:00', 'Dr. Priya Sharma', 'Lab 1'),
        ('2nd', 'MCA', 'Monday', 'Cloud Computing', '10:00', '11:00', 'Mr. Vikram Kumar', 'Lab 2'),
        ('2nd', 'MCA', 'Monday', 'Machine Learning', '11:00', '12:00', 'Ms. Deepika Singh', 'Lab 3'),
        ('2nd', 'MCA', 'Monday', 'LUNCH BREAK', '12:00', '13:00', 'Self', 'Cafeteria'),
        ('2nd', 'MCA', 'Monday', 'Big Data Analytics', '13:00', '14:00', 'Mr. Vikram Kumar', 'Classroom 1'),
        
        # Tuesday - 2nd Year
        ('2nd', 'MCA', 'Tuesday', 'Cryptography', '09:00', '10:00', 'Mrs. Kavya Reddy', 'Lab 1'),
        ('2nd', 'MCA', 'Tuesday', 'Distributed Systems', '10:00', '11:00', 'Dr. Ramesh Kumar', 'Lab 2'),
        ('2nd', 'MCA', 'Tuesday', 'IoT Applications', '11:00', '12:00', 'Mr. Arun Patel', 'Lab 3'),
        ('2nd', 'MCA', 'Tuesday', 'LUNCH BREAK', '12:00', '13:00', 'Self', 'Cafeteria'),
        ('2nd', 'MCA', 'Tuesday', 'Web Services & APIs', '13:00', '14:00', 'Mr. Arun Patel', 'Classroom 2'),
        
        # Wednesday - 2nd Year
        ('2nd', 'MCA', 'Wednesday', 'Natural Language Processing', '09:00', '10:00', 'Ms. Deepika Singh', 'Lab 1'),
        ('2nd', 'MCA', 'Wednesday', 'Computer Vision', '10:00', '11:00', 'Ms. Deepika Singh', 'Lab 2'),
        ('2nd', 'MCA', 'Wednesday', 'Ethical Hacking Lab', '11:00', '12:00', 'Mrs. Kavya Reddy', 'Lab 3'),
        ('2nd', 'MCA', 'Wednesday', 'LUNCH BREAK', '12:00', '13:00', 'Self', 'Cafeteria'),
        ('2nd', 'MCA', 'Wednesday', 'DevOps & Containerization', '13:00', '14:00', 'Mr. Vikram Kumar', 'Classroom 1'),
        
        # Thursday - 2nd Year
        ('2nd', 'MCA', 'Thursday', 'Advanced Algorithms', '09:00', '10:00', 'Dr. Ramesh Kumar', 'Lab 1'),
        ('2nd', 'MCA', 'Thursday', 'Artificial Intelligence Lab', '10:00', '11:00', 'Ms. Deepika Singh', 'Lab 2'),
        ('2nd', 'MCA', 'Thursday', 'Blockchain Technology', '11:00', '12:00', 'Mr. Vikram Kumar', 'Lab 3'),
        ('2nd', 'MCA', 'Thursday', 'LUNCH BREAK', '12:00', '13:00', 'Self', 'Cafeteria'),
        ('2nd', 'MCA', 'Thursday', 'Capstone Project Work', '13:00', '14:00', 'Dr. Ramesh Kumar', 'Classroom 2'),
        
        # Friday - 2nd Year
        ('2nd', 'MCA', 'Friday', 'Quantum Computing Intro', '09:00', '10:00', 'Dr. Priya Sharma', 'Lab 1'),
        ('2nd', 'MCA', 'Friday', 'Mobile App Development', '10:00', '11:00', 'Mr. Arun Patel', 'Lab 2'),
        ('2nd', 'MCA', 'Friday', 'Project Presentation', '11:00', '12:00', 'Dr. Ramesh Kumar', 'Lab 3'),
        ('2nd', 'MCA', 'Friday', 'LUNCH BREAK', '12:00', '13:00', 'Self', 'Cafeteria'),
        ('2nd', 'MCA', 'Friday', 'Research Methodology', '13:00', '14:00', 'Dr. Priya Sharma', 'Classroom 1'),
        
        # Saturday - 2nd Year
        ('2nd', 'MCA', 'Saturday', 'Industry Expert Talk', '09:00', '11:00', 'Guest Faculty', 'Seminar Hall'),
        ('2nd', 'MCA', 'Saturday', 'Final Project Review', '11:00', '12:00', 'Dr. Ramesh Kumar', 'Classroom 1'),
    ]
    
    # Insert all data
    cursor.executemany(
        '''INSERT INTO timetable_new 
           (year, department, day, subject, start_time, end_time, faculty, room) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
        first_year_data + second_year_data
    )
    
    conn.commit()
    conn.close()
    print(f"✓ Inserted {len(first_year_data) + len(second_year_data)} timetable entries!")


def query_timetable_by_day(year, day):
    """Query timetable for a specific year and day"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM timetable_new 
        WHERE year = ? AND day = ?
        ORDER BY start_time
    ''', (year, day))
    
    results = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in results]


def query_timetable_by_week(year):
    """Query entire week's timetable for a specific year"""
    conn = get_connection()
    cursor = conn.cursor()
    
    days_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    cursor.execute('''
        SELECT * FROM timetable_new 
        WHERE year = ?
        ORDER BY 
            CASE day 
                WHEN 'Monday' THEN 1
                WHEN 'Tuesday' THEN 2
                WHEN 'Wednesday' THEN 3
                WHEN 'Thursday' THEN 4
                WHEN 'Friday' THEN 5
                WHEN 'Saturday' THEN 6
            END,
            start_time
    ''', (year,))
    
    results = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in results]


def get_today_day_name():
    """Get the current day name"""
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    today = datetime.now().weekday()
    if today == 6:  # Sunday - return Monday
        return 'Monday'
    return days[today]


def get_tomorrow_day_name():
    """Get tomorrow's day name"""
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    tomorrow = (datetime.now() + timedelta(days=1)).weekday()
    if tomorrow == 6:  # Sunday - return Monday
        return 'Monday'
    return days[tomorrow]


def initialize_timetable_database():
    """Initialize the timetable database"""
    create_timetable_schema()
    insert_timetable_samples()
