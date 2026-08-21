import MockAdapter from 'axios-mock-adapter';
import api from './api';
import { 
  mockDepartments, mockCourses, mockSubjects, mockAcademicYears, mockDashboardStats,
  mockFaculty, mockStudents, mockPOs, mockCOs, mockMappings,
  mockAnalyticsSummary, mockAnalyticsRadar, mockAnalyticsRisk, mockAnalyticsCOTrends
} from './mockData';

// This function initializes the mock server
export const initMockServer = () => {
  // Use a delay to simulate real network requests
  const mock = new MockAdapter(api, { delayResponse: 500 });

  console.log('[Mock Server] Initialized. API requests will be intercepted.');

  // Passthrough authentication routes if they exist, or mock them
  mock.onPost('/auth/login').reply(200, {
    access_token: 'mock-jwt-token',
    token_type: 'bearer'
  });

  mock.onGet('/users/me').reply(200, {
    id: 1,
    name: 'Super Admin',
    email: 'admin@copovision.com',
    role: 'ADMIN'
  });

  // Dashboard Stats
  mock.onGet('/stats').reply(200, mockDashboardStats);

  // Analytics Endpoints
  mock.onGet('/analytics/summary').reply(200, mockAnalyticsSummary);
  mock.onGet('/analytics/po-radar').reply(200, mockAnalyticsRadar);
  mock.onGet('/analytics/risk-distribution').reply(200, mockAnalyticsRisk);
  mock.onGet('/analytics/co-trends').reply(200, mockAnalyticsCOTrends);

  // Departments
  mock.onGet('/departments').reply(200, mockDepartments);
  mock.onPost('/departments').reply((config) => {
    const data = JSON.parse(config.data);
    const newDept = { ...data, id: mockDepartments.length + 1 };
    mockDepartments.push(newDept);
    return [201, newDept];
  });
  mock.onPut(/\/departments\/\d+/).reply((config) => {
    const id = parseInt(config.url!.split('/').pop()!);
    const data = JSON.parse(config.data);
    const index = mockDepartments.findIndex(d => d.id === id);
    if (index > -1) {
      mockDepartments[index] = { ...mockDepartments[index], ...data };
      return [200, mockDepartments[index]];
    }
    return [404, { message: 'Not found' }];
  });
  mock.onDelete(/\/departments\/\d+/).reply((config) => {
    const id = parseInt(config.url!.split('/').pop()!);
    const index = mockDepartments.findIndex(d => d.id === id);
    if (index > -1) {
      mockDepartments.splice(index, 1);
      return [200, { success: true }];
    }
    return [404, { message: 'Not found' }];
  });

  // Courses
  mock.onGet('/courses').reply(200, mockCourses);
  mock.onPost('/courses').reply((config) => {
    const data = JSON.parse(config.data);
    const newRecord = { ...data, id: mockCourses.length + 1 };
    mockCourses.push(newRecord);
    return [201, newRecord];
  });
  mock.onPut(/\/courses\/\d+/).reply((config) => {
    const id = parseInt(config.url!.split('/').pop()!);
    const data = JSON.parse(config.data);
    const index = mockCourses.findIndex(d => d.id === id);
    if (index > -1) {
      mockCourses[index] = { ...mockCourses[index], ...data };
      return [200, mockCourses[index]];
    }
    return [404];
  });
  mock.onDelete(/\/courses\/\d+/).reply((config) => {
    const id = parseInt(config.url!.split('/').pop()!);
    const index = mockCourses.findIndex(d => d.id === id);
    if (index > -1) {
      mockCourses.splice(index, 1);
      return [200];
    }
    return [404];
  });

  // Subjects
  mock.onGet('/subjects').reply(200, mockSubjects);
  mock.onPost('/subjects').reply((config) => {
    const data = JSON.parse(config.data);
    const newRecord = { ...data, id: mockSubjects.length + 1 };
    mockSubjects.push(newRecord);
    return [201, newRecord];
  });

  // Academic Years
  mock.onGet('/academic-years').reply(200, mockAcademicYears);
  mock.onPost('/academic-years').reply((config) => {
    const data = JSON.parse(config.data);
    const newRecord = { ...data, id: mockAcademicYears.length + 1 };
    mockAcademicYears.push(newRecord);
    return [201, newRecord];
  });

  // POs and COs
  mock.onGet('/pos').reply(200, mockPOs);
  mock.onGet('/cos').reply(200, mockCOs);
  mock.onGet('/co-po-mapping').reply(200, mockMappings);
  mock.onPost('/co-po-mapping').reply((config) => {
    return [200, { success: true }];
  });

  // Passthrough for any unmocked requests
  mock.onAny().passThrough();
};
