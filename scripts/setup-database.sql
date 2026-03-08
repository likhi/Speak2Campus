-- Create Departments table
CREATE TABLE departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Locations table
CREATE TABLE locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  floor VARCHAR(100),
  building VARCHAR(100),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Faculty table
CREATE TABLE faculty (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  designation VARCHAR(255),
  department_id INTEGER,
  profile_photo TEXT,
  specialization TEXT,
  experience TEXT,
  email VARCHAR(255),
  cabin VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- Create Timetable table
CREATE TABLE timetable (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  department_id INTEGER NOT NULL,
  year VARCHAR(20) NOT NULL,
  day_of_week VARCHAR(20) NOT NULL,
  time VARCHAR(20) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  faculty_id INTEGER,
  room VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
);

-- Create Events table
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  venue VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for Seshadripuram College

-- Insert Departments
INSERT INTO departments (name, description) VALUES
('MCA', 'Master of Computer Applications'),
('MBA', 'Master of Business Administration'),
('MCOM', 'Master of Commerce');

-- Locations
INSERT INTO locations (name, floor, building, description) VALUES
('MCA Lab 1', '2nd Floor', 'Tech Block A', 'Main computer laboratory with 40 workstations for programming courses'),
('MCA Lab 2', '2nd Floor', 'Tech Block A', 'Advanced labs with GPU workstations for AI and ML'),
('MCA Lab 3', '3rd Floor', 'Tech Block B', 'Database and networking laboratory'),
('MBA Classroom 1', '3rd Floor', 'Admin Block', 'Main lecture hall for MBA with 60 seats'),
('MBA Classroom 2', '3rd Floor', 'Admin Block', 'Discussion and case study room for MBA'),
('MCOM Lab 1', '4th Floor', 'Finance Block', 'Accounting and financial software laboratory'),
('MCOM Classroom 1', '4th Floor', 'Finance Block', 'Commerce theory classroom'),
('Faculty Cabin - HOD', '1st Floor', 'Admin Block', 'Head of Department office'),
('Library', 'Ground Floor', 'Central Block', 'Central library with digital resources'),
('Cafeteria', 'Ground Floor', 'Central Block', 'College canteen and food court'),
('Seminar Hall', '3rd Floor', 'Admin Block', 'Auditorium for seminars and workshops');

-- Faculty for MCA (department_id = 1)
INSERT INTO faculty (name, designation, department_id, specialization, email, cabin) VALUES
('Dr. Ramesh Kumar', 'Professor & Head', 1, 'Software Engineering', 'ramesh.kumar@seshadripuram.edu.in', 'Room 101'),
('Dr. Priya Sharma', 'Associate Professor', 1, 'Database Management', 'priya.sharma@seshadripuram.edu.in', 'Room 102'),
('Mr. Arun Patel', 'Assistant Professor', 1, 'Web Development', 'arun.patel@seshadripuram.edu.in', 'Room 103'),
('Ms. Deepika Singh', 'Assistant Professor', 1, 'Machine Learning', 'deepika.singh@seshadripuram.edu.in', 'Room 104'),
('Mr. Vikram Kumar', 'Assistant Professor', 1, 'Cloud Computing', 'vikram.kumar@seshadripuram.edu.in', 'Room 105'),
('Mrs. Kavya Reddy', 'Assistant Professor', 1, 'Cybersecurity', 'kavya.reddy@seshadripuram.edu.in', 'Room 106');

-- Faculty for MBA (department_id = 2)
INSERT INTO faculty (name, designation, department_id, specialization, email, cabin) VALUES
('Prof. Rajesh Gupta', 'Professor & Head', 2, 'Strategic Management', 'rajesh.gupta@seshadripuram.edu.in', 'Room 201'),
('Prof. Anjali Trivedi', 'Associate Professor', 2, 'Finance & Investments', 'anjali.trivedi@seshadripuram.edu.in', 'Room 202'),
('Mr. Nitin Singh', 'Assistant Professor', 2, 'Marketing Management', 'nitin.singh@seshadripuram.edu.in', 'Room 203'),
('Ms. Neha Kapoor', 'Assistant Professor', 2, 'Organizational Behavior', 'neha.kapoor@seshadripuram.edu.in', 'Room 204');

-- Faculty for MCOM (department_id = 3)
INSERT INTO faculty (name, designation, department_id, specialization, email, cabin) VALUES
('Dr. Suresh Nair', 'Professor & Head', 3, 'Advanced Accounting', 'suresh.nair@seshadripuram.edu.in', 'Room 301'),
('Ms. Pooja Verma', 'Associate Professor', 3, 'Corporate Law & Taxation', 'pooja.verma@seshadripuram.edu.in', 'Room 302'),
('Mr. Arjun Desai', 'Assistant Professor', 3, 'Financial Management', 'arjun.desai@seshadripuram.edu.in', 'Room 303');

-- Timetable for MCA (1st Year - department_id = 1)
INSERT INTO timetable (department_id, year, day_of_week, time, subject, faculty_id, room) VALUES
-- Monday
(1, '1st', 'Monday', '09:00-10:00', 'Data Structures', 1, 'Lab 1'),
(1, '1st', 'Monday', '10:00-11:00', 'Database Fundamentals', 2, 'Lab 2'),
(1, '1st', 'Monday', '11:00-12:00', 'Web Development Basics', 3, 'Lab 3'),
(1, '1st', 'Monday', '12:00-01:00', 'LUNCH BREAK', NULL, 'Cafeteria'),
(1, '1st', 'Monday', '01:00-02:00', 'Mathematics for Computing', 1, 'Classroom 1'),
-- Tuesday
(1, '1st', 'Tuesday', '09:00-10:00', 'Operating Systems', 4, 'Lab 1'),
(1, '1st', 'Tuesday', '10:00-11:00', 'Introduction to AI', 5, 'Lab 2'),
(1, '1st', 'Tuesday', '11:00-12:00', 'Computer Networks', 3, 'Lab 3'),
(1, '1st', 'Tuesday', '12:00-01:00', 'LUNCH BREAK', NULL, 'Cafeteria'),
(1, '1st', 'Tuesday', '01:00-02:00', 'Software Engineering', 1, 'Classroom 2'),
-- Wednesday
(1, '1st', 'Wednesday', '09:00-10:00', 'Java Programming', 3, 'Lab 1'),
(1, '1st', 'Wednesday', '10:00-11:00', 'Cybersecurity Basics', 6, 'Lab 2'),
(1, '1st', 'Wednesday', '11:00-12:00', 'Database Design Lab', 2, 'Lab 3'),
(1, '1st', 'Wednesday', '12:00-01:00', 'LUNCH BREAK', NULL, 'Cafeteria'),
(1, '1st', 'Wednesday', '01:00-02:00', 'Cloud Computing Intro', 4, 'Classroom 1');

-- Timetable for MBA (1st Year - department_id = 2)
INSERT INTO timetable (department_id, year, day_of_week, time, subject, faculty_id, room) VALUES
-- Monday
(2, '1st', 'Monday', '09:00-10:00', 'Organizational Behavior', 10, 'Classroom 1'),
(2, '1st', 'Monday', '10:00-11:00', 'Financial Management', 8, 'Classroom 2'),
(2, '1st', 'Monday', '11:00-12:00', 'Marketing Strategy', 9, 'Classroom 1'),
(2, '1st', 'Monday', '12:00-01:00', 'LUNCH BREAK', NULL, 'Cafeteria'),
(2, '1st', 'Monday', '01:00-02:00', 'Case Study Discussion', 7, 'Classroom 2'),
-- Tuesday
(2, '1st', 'Tuesday', '09:00-10:00', 'Strategic Management', 7, 'Classroom 1'),
(2, '1st', 'Tuesday', '10:00-11:00', 'Investment Analysis', 8, 'Classroom 2'),
(2, '1st', 'Tuesday', '11:00-12:00', 'Business Economics', 9, 'Classroom 1'),
(2, '1st', 'Tuesday', '12:00-01:00', 'LUNCH BREAK', NULL, 'Cafeteria'),
(2, '1st', 'Tuesday', '01:00-02:00', 'Group Project Work', 10, 'Classroom 2');

-- Timetable for MCOM (1st Year - department_id = 3)
INSERT INTO timetable (department_id, year, day_of_week, time, subject, faculty_id, room) VALUES
-- Monday
(3, '1st', 'Monday', '09:00-10:00', 'Financial Accounting', 11, 'Lab 1'),
(3, '1st', 'Monday', '10:00-11:00', 'Corporate Taxation', 12, 'Classroom 1'),
(3, '1st', 'Monday', '11:00-12:00', 'Business Law', 12, 'Classroom 1'),
(3, '1st', 'Monday', '12:00-01:00', 'LUNCH BREAK', NULL, 'Cafeteria'),
(3, '1st', 'Monday', '01:00-02:00', 'Auditing Principles', 11, 'Lab 1'),
-- Tuesday
(3, '1st', 'Tuesday', '09:00-10:00', 'Advanced Accounting', 11, 'Lab 1'),
(3, '1st', 'Tuesday', '10:00-11:00', 'Management Accounting', 13, 'Classroom 1'),
(3, '1st', 'Tuesday', '11:00-12:00', 'Cost Accounting', 13, 'Lab 1'),
(3, '1st', 'Tuesday', '12:00-01:00', 'LUNCH BREAK', NULL, 'Cafeteria'),
(3, '1st', 'Tuesday', '01:00-02:00', 'Financial Law', 12, 'Classroom 1');

-- Gallery table for campus images
CREATE TABLE gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Virtual Tour table for campus video tour
CREATE TABLE virtual_tour (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  video_path TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sample Gallery Images
INSERT INTO gallery (title, file_path, description, uploaded_at) VALUES
('Campus Entrance Gate', '/uploads/gallery/campus-gate.jpg', 'Beautiful entrance of Seshadripuram College', CURRENT_TIMESTAMP),
('Main Building', '/uploads/gallery/main-building.jpg', 'Central administrative building', CURRENT_TIMESTAMP),
('Library Exterior', '/uploads/gallery/library.jpg', 'State-of-the-art library facility', CURRENT_TIMESTAMP),
('Computer Labs', '/uploads/gallery/labs.jpg', 'Advanced computer laboratory facilities', CURRENT_TIMESTAMP),
('Cafeteria Area', '/uploads/gallery/cafeteria.jpg', 'Modern cafeteria with seating arrangement', CURRENT_TIMESTAMP),
('Sports Ground', '/uploads/gallery/sports.jpg', 'Well-maintained sports facility', CURRENT_TIMESTAMP);

-- Sample Virtual Tour Video
INSERT INTO virtual_tour (title, video_path, description, uploaded_at) VALUES
('Campus Virtual Tour', '/uploads/virtual-tour/campus-tour.mp4', '360-degree virtual tour of entire campus', CURRENT_TIMESTAMP);

-- Knowledge base table for assistant training
CREATE TABLE knowledge_base (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT,
  keywords TEXT NOT NULL,
  department TEXT,
  response_type TEXT NOT NULL DEFAULT 'text',
  redirect_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Assistant logs for analytics (optional)
CREATE TABLE assistant_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT,
  matched_answer_id INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Events
INSERT INTO events (name, date, description, venue) VALUES
('MCA Orientation', '2026-01-25', 'Welcome orientation for new MCA students', 'Seminar Hall'),
('Programming Contest', '2026-02-15', 'Intra-college programming competition for MCA students', 'Lab 1 & Lab 2'),
('Guest Lecture on AI', '2026-02-28', 'Invited talk by industry experts on Artificial Intelligence and ML', 'Seminar Hall'),
('Spring Fest', '2026-03-15', 'Annual college festival with various cultural and technical events', 'Campus Grounds'),
('Summer Internship Drive', '2026-04-01', 'Recruitment drive for summer internships from leading tech companies', 'Conference Room'),
('Project Showcase', '2026-05-10', 'Final semester project presentations and demonstrations', 'Seminar Hall');
