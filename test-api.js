import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('Testing GET /api/timetable...');
    const response = await fetch('http://localhost:3000/api/timetable');
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Data length:', data.length);
    console.log('First item:', data[0]);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();