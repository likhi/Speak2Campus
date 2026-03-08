async function testTimetableAPI() {
  const testData = {
    day: 'Monday',
    time: '10:00',
    subject: 'Test Subject',
    faculty: 'Dr. Ramesh Kumar',
    room: 'Test Room',
    year: '1st Year'
  };

  try {
    console.log('Sending data:', testData);
    const response = await fetch('http://localhost:3000/api/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (response.ok) {
      console.log('SUCCESS: Entry was added');
    } else {
      console.log('FAILED: Entry was not added');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testTimetableAPI();