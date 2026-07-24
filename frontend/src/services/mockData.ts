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

export let mockMappings = [
  { id: 1, co_id: 1, po_id: 1, correlation_level: 3 },
  { id: 2, co_id: 2, po_id: 2, correlation_level: 2 },
];
