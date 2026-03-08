-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  floor VARCHAR(100) NOT NULL,
  building VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  designation VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  email VARCHAR(255),
  cabin VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date VARCHAR(100) NOT NULL,
  description TEXT,
  venue VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timetable table
CREATE TABLE IF NOT EXISTS timetable (
  id SERIAL PRIMARY KEY,
  day VARCHAR(50) NOT NULL,
  time VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  faculty VARCHAR(255) NOT NULL,
  room VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);
CREATE INDEX IF NOT EXISTS idx_faculty_name ON faculty(name);
CREATE INDEX IF NOT EXISTS idx_faculty_email ON faculty(email);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_timetable_day ON timetable(day);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
