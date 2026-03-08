import sqlite3

conn = sqlite3.connect('data/college.db')
cursor = conn.cursor()

# Fetch all locations
cursor.execute("SELECT * FROM locations ORDER BY building")
rows = cursor.fetchall()
print('ALL LOCATIONS:')
for row in rows:
    print(row)

# Print count
print('Total locations:', len(rows))

conn.close()