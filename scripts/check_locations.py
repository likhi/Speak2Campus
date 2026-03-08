import sqlite3

conn = sqlite3.connect('data/college.db')
cursor = conn.cursor()

# List all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print('Tables:', tables)

# Try to fetch all locations
try:
    cursor.execute('SELECT * FROM locations;')
    locations = cursor.fetchall()
    print('Locations:', locations)
except Exception as e:
    print('Error fetching locations:', e)

conn.close()