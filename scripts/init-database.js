#!/usr/bin/env node

// Manual database initialization script
// Run this script to create and populate the SQLite database

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'college.db');

// Create data directory if it doesn't exist
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Check if database already exists
if (fs.existsSync(dbPath)) {
  console.log('Database already exists at:', dbPath);
  console.log('To recreate, delete the database file first.');
  process.exit(0);
}

console.log('Creating SQLite database at:', dbPath);

const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Read and execute the setup script
const setupPath = path.join(__dirname, '..', 'scripts', 'setup-database.sql');

if (!fs.existsSync(setupPath)) {
  console.error('Setup script not found at:', setupPath);
  process.exit(1);
}

const setupSQL = fs.readFileSync(setupPath, 'utf-8');

// Split by semicolon and execute each statement
const statements = setupSQL.split(';').filter(stmt => stmt.trim().length > 0);

console.log('Executing database setup...');

for (const statement of statements) {
  if (statement.trim()) {
    try {
      db.exec(statement.trim());
      console.log('✓ Executed statement');
    } catch (error) {
      console.error('✗ Error executing statement:', statement.trim());
      console.error('Error:', error);
    }
  }
}

db.close();

console.log('✓ Database setup complete!');
console.log('Database location:', dbPath);