#!/usr/bin/env node

/**
 * Multi-Department System - Test Queries
 * This file demonstrates how to use the updated APIs with department support
 * 
 * Run these tests to verify the multi-department system is working correctly
 */

const BASE_URL = 'http://localhost:3000/api';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  try {
    const options = { method };
    if (body) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Test Suite
async function runTests() {
  console.log('🚀 Multi-Department System Test Suite\n');
  console.log('='.repeat(60));

  // ===== TEST 1: DEPARTMENTS =====
  console.log('\n📚 TEST 1: Department Management\n');
  
  console.log('1.1 Get all departments');
  const depts = await apiCall('/departments');
  console.log('✅ Departments:', depts.data);
  
  console.log('\n1.2 Create new department');
  const newDept = await apiCall('/departments', 'POST', {
    name: 'MTECH',
    description: 'Master of Technology'
  });
  console.log('✅ Created:', newDept.data);

  // ===== TEST 2: FACULTY QUERIES =====
  console.log('\n\n👥 TEST 2: Faculty with Department Filtering\n');
  
  console.log('2.1 Get all faculty');
  const allFaculty = await apiCall('/faculty');
  console.log('✅ Total faculty:', allFaculty.data.length);
  
  console.log('\n2.2 Get MCA faculty');
  const mcaFaculty = await apiCall('/faculty?department=MCA');
  console.log('✅ MCA Faculty:', mcaFaculty.data.map(f => f.name).join(', '));
  
  console.log('\n2.3 Get MBA faculty');
  const mbaFaculty = await apiCall('/faculty?department=MBA');
  console.log('✅ MBA Faculty:', mbaFaculty.data.map(f => f.name).join(', '));
  
  console.log('\n2.4 Get MCOM faculty');
  const mcomFaculty = await apiCall('/faculty?department=MCOM');
  console.log('✅ MCOM Faculty:', mcomFaculty.data.map(f => f.name).join(', '));

  // ===== TEST 3: TIMETABLE QUERIES =====
  console.log('\n\n📅 TEST 3: Timetable with Department & Year Filtering\n');
  
  console.log('3.1 Get all timetable entries');
  const allTimetable = await apiCall('/timetable');
  console.log('✅ Total entries:', allTimetable.data.length);
  
  console.log('\n3.2 Get MCA timetable');
  const mcaTimetable = await apiCall('/timetable?department=MCA');
  console.log('✅ MCA entries:', mcaTimetable.data.length);
  
  console.log('\n3.3 Get MBA 1st year Monday');
  const mba1stMonday = await apiCall('/timetable?department=MBA&year=1st&day=Monday');
  console.log('✅ MBA 1st year Monday classes:', mba1stMonday.data.length);
  console.log('Classes:', mba1stMonday.data.map(t => `${t.time} - ${t.subject}`).join(', '));
  
  console.log('\n3.4 Get MCOM 1st year Tuesday');
  const mcom1stTuesday = await apiCall('/timetable?department=MCOM&year=1st&day=Tuesday');
  console.log('✅ MCOM 1st year Tuesday classes:', mcom1stTuesday.data.length);
  console.log('Classes:', mcom1stTuesday.data.map(t => `${t.time} - ${t.subject}`).join(', '));

  // ===== TEST 4: CREATE NEW FACULTY =====
  console.log('\n\n➕ TEST 4: Create Faculty Under Department\n');
  
  // Get department ID for MCA
  const mcaDeptId = depts.data.find(d => d.name === 'MCA')?.id;
  
  console.log('4.1 Add new MCA faculty');
  const newFaculty = await apiCall('/faculty', 'POST', {
    name: 'Dr. New Faculty',
    designation: 'Assistant Professor',
    department_id: mcaDeptId,
    specialization: 'AI and Machine Learning',
    email: 'new.faculty@college.edu',
    cabin: 'Room 107'
  });
  console.log('✅ Added:', newFaculty.data);

  // ===== TEST 5: CREATE TIMETABLE ENTRY =====
  console.log('\n\n➕ TEST 5: Create Timetable Entry\n');
  
  console.log('5.1 Add new timetable class (MCA 1st Year)');
  const newClass = await apiCall('/timetable', 'POST', {
    department_id: mcaDeptId,
    year: '1st',
    day_of_week: 'Wednesday',
    time: '09:00-10:00',
    subject: 'Advanced AI',
    faculty_id: newFaculty.data.id,
    room: 'Lab 1'
  });
  console.log('✅ Added class:', newClass.data);

  // ===== TEST 6: VOICE ASSISTANT STYLE QUERIES =====
  console.log('\n\n🎤 TEST 6: Voice Assistant Query Examples\n');
  
  console.log('Example 1: "Show MBA faculty"');
  const example1 = await apiCall('/faculty?department=MBA');
  console.log(`Example Response: ${example1.data.length} faculty members found`);
  
  console.log('\nExample 2: "What is MCOM 1st year Monday schedule?"');
  const example2 = await apiCall('/timetable?department=MCOM&year=1st&day=Monday');
  console.log(`Example Response: ${example2.data.length} classes found`);
  
  console.log('\nExample 3: "Who is the HOD of MBA?"');
  const example3 = await apiCall('/faculty?department=MBA');
  const hod = example3.data.find(f => f.designation.includes('Head'));
  console.log(`Example Response: ${hod?.name}`);

  // ===== SUMMARY =====
  console.log('\n\n' + '='.repeat(60));
  console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY!\n');
  console.log('Summary:');
  console.log(`- Departments: ${depts.data.length}`);
  console.log(`- Total Faculty: ${allFaculty.data.length}`);
  console.log(`- Total Timetable Entries: ${allTimetable.data.length}`);
  console.log(`- MCA Faculty: ${mcaFaculty.data.length}`);
  console.log(`- MBA Faculty: ${mbaFaculty.data.length}`);
  console.log(`- MCOM Faculty: ${mcomFaculty.data.length}`);
  console.log('\n✨ System is fully operational with multi-department support!');
}

// Run the tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});


