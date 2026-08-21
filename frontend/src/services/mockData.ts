export const mockUser = {
  id: 1,
  name: "Admin User",
  email: "admin@copovision.com",
  role: "admin",
  status: true
};

export let mockDepartments = [
  { id: 1, department_code: "CSE", department_name: "Computer Science", hod_name: "Dr. Smith", status: true },
  { id: 2, department_code: "IT", department_name: "Information Tech", hod_name: "Dr. Jones", status: true },
  { id: 3, department_code: "CS", department_name: "Cyber Security", hod_name: "Swati Gajarlewar", status: true },
];

export let mockFaculty = [
  { id: 1, faculty_name: "Dr. Rajesh Sharma", email: "rajesh@college.edu", department_id: 1, status: true },
  { id: 2, faculty_name: "Dr. Priya Patel", email: "priya@college.edu", department_id: 1, status: true },
];

export let mockStudents = [
  { id: 1, student_name: "Aarav Kumar", roll_number: "25CSE001", department_id: 1, status: true },
  { id: 2, student_name: "Sneha Reddy", roll_number: "25CSE002", department_id: 1, status: true },
];

export let mockSubjects = [
  { id: 1, subject_code: "CS301", subject_name: "Data Structures", credits: 4, status: true },
  { id: 2, subject_code: "CS302", subject_name: "Algorithms", credits: 4, status: true },
];

export let mockPOs = [
  { id: 1, po_number: "PO1", po_title: "Engineering Knowledge", department_id: 1, status: true },
  { id: 2, po_number: "PO2", po_title: "Problem Analysis", department_id: 1, status: true },
];

export let mockCOs = [
  { id: 1, co_number: "CO1", co_title: "Course Outcome 1", course_id: 1, status: true },
  { id: 2, co_number: "CO2", co_title: "Course Outcome 2", course_id: 1, status: true },
];

export let mockCourses = [
  { id: 1, course_code: "BTECH-CSE", course_name: "B.Tech Computer Science", department_id: 1, status: true },
  { id: 2, course_code: "MTECH-CSE", course_name: "M.Tech Computer Science", department_id: 1, status: true },
];

export let mockAcademicYears = [
  { id: 1, academic_year: "2023-2024", is_current: false, status: true },
  { id: 2, academic_year: "2024-2025", is_current: true, status: true },
];

export let mockDashboardStats = {
  total_departments: 3,
  total_courses: 5,
  total_students: 1200,
  average_po_attainment: 78.5,
  active_assessments: 12
};

export let mockMappings = [
  { id: 1, co_id: 1, po_id: 1, correlation_level: 3 },
  { id: 2, co_id: 2, po_id: 2, correlation_level: 2 },
];

export let mockAnalyticsSummary = {
  average_po_attainment: 78.5,
  students_at_risk: 42,
  total_assessments: 120,
  co_attainment_rate: 85.2
};

export let mockAnalyticsRadar = [
  { subject: 'PO1', A: 120, B: 110, fullMark: 150 },
  { subject: 'PO2', A: 98, B: 130, fullMark: 150 },
  { subject: 'PO3', A: 86, B: 130, fullMark: 150 },
  { subject: 'PO4', A: 99, B: 100, fullMark: 150 },
  { subject: 'PO5', A: 85, B: 90, fullMark: 150 },
  { subject: 'PO6', A: 65, B: 85, fullMark: 150 },
];

export let mockAnalyticsRisk = [
  { name: 'High Risk', value: 400 },
  { name: 'Medium Risk', value: 300 },
  { name: 'Low Risk', value: 300 },
  { name: 'Safe', value: 200 },
];

export let mockAnalyticsCOTrends = [
  { name: 'Unit 1', CO1: 4000, CO2: 2400, CO3: 2400 },
  { name: 'Unit 2', CO1: 3000, CO2: 1398, CO3: 2210 },
  { name: 'Unit 3', CO1: 2000, CO2: 9800, CO3: 2290 },
  { name: 'Unit 4', CO1: 2780, CO2: 3908, CO3: 2000 },
  { name: 'Unit 5', CO1: 1890, CO2: 4800, CO3: 2181 },
  { name: 'Unit 6', CO1: 2390, CO2: 3800, CO3: 2500 },
  { name: 'Unit 7', CO1: 3490, CO2: 4300, CO3: 2100 },
];
