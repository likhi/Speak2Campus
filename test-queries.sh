#!/bin/bash

# Multi-Department System - Quick Start Guide & Test Commands
# This script demonstrates how to test the multi-department assistant system

echo "🚀 Multi-Department Voice Assistant - Test Queries"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api"

# Function to print a test
print_test() {
    echo -e "${BLUE}=== TEST: $1 ===${NC}"
}

# Function to print result
print_result() {
    echo -e "${GREEN}✓ $1${NC}\n"
}

print_test "1. GET ALL DEPARTMENTS"
echo "curl -X GET '$BASE_URL/departments'"
echo ""

print_test "2. GET MCA FACULTY"
echo "curl -X GET '$BASE_URL/faculty?department=MCA'"
echo ""

print_test "3. GET MBA FACULTY"
echo "curl -X GET '$BASE_URL/faculty?department=MBA'"
echo ""

print_test "4. GET MCOM FACULTY"
echo "curl -X GET '$BASE_URL/faculty?department=MCOM'"
echo ""

print_test "5. GET MCA TIMETABLE"
echo "curl -X GET '$BASE_URL/timetable?department=MCA'"
echo ""

print_test "6. GET MBA 1ST YEAR MONDAY TIMETABLE"
echo "curl -X GET '$BASE_URL/timetable?department=MBA&year=1st&day=Monday'"
echo ""

print_test "7. GET MCOM 2ND YEAR TUESDAY TIMETABLE"
echo "curl -X GET '$BASE_URL/timetable?department=MCOM&year=2nd&day=Tuesday'"
echo ""

print_test "8. CREATE NEW DEPARTMENT"
echo "curl -X POST '$BASE_URL/departments' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"name\": \"MTECH\", \"description\": \"Master of Technology\"}'"
echo ""

print_test "9. CREATE NEW FACULTY (MCA)"
echo "curl -X POST '$BASE_URL/faculty' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"name\": \"Dr. New Faculty\", \"designation\": \"Assistant Professor\", \"department_id\": 1, \"specialization\": \"AI\", \"email\": \"new@college.edu\", \"cabin\": \"Room 107\"}'"
echo ""

print_test "10. CREATE TIMETABLE ENTRY (MCA 1ST YEAR)"
echo "curl -X POST '$BASE_URL/timetable' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"department_id\": 1, \"year\": \"1st\", \"day_of_week\": \"Wednesday\", \"time\": \"09:00-10:00\", \"subject\": \"Advanced AI\", \"faculty_id\": 1, \"room\": \"Lab 1\"}'"
echo ""

echo -e "${YELLOW}=== VOICE ASSISTANT QUERY EXAMPLES ===${NC}"
echo ""
echo "1. 'Show MBA faculty'"
echo "   → Lists all MBA faculty members with department"
echo ""
echo "2. 'What is MCOM 1st year Monday timetable?'"
echo "   → Shows MCOM 1st year schedule for Monday"
echo ""
echo "3. 'Who is the HOD of MBA?'"
echo "   → Shows the Head of Department for MBA"
echo ""
echo "4. 'Show MCA October timetable'"
echo "   → Shows complete MCA timetable"
echo ""
echo "5. 'MBA 2nd year Friday schedule'"
echo "   → Shows MBA 2nd year schedule for Friday"
echo ""
echo "6. 'Tomorrow's MCOM classes'"
echo "   → Shows tomorrow's MCOM classes (auto-detects day)"
echo ""
echo "7. 'Show Monday timetable'"
echo "   → Assistant asks: 'Which department? MCA, MBA, or MCOM?'"
echo ""

echo -e "${GREEN}🎉 System is ready to use!${NC}"
echo ""
echo "For more details, see MULTI_DEPARTMENT_MIGRATION.md"
