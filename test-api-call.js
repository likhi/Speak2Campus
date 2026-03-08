async function testTimetableAPI() {
  try {
    console.log('Testing timetable API...');
    const response = await fetch('http://localhost:3000/api/timetable');

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API call successful');
      console.log('Data type:', typeof data);
      console.log('Data length:', Array.isArray(data) ? data.length : 'Not an array');
      if (Array.isArray(data) && data.length > 0) {
        console.log('Sample data:', JSON.stringify(data.slice(0, 2), null, 2));
      } else {
        console.log('No data returned');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API call failed');
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

testTimetableAPI();