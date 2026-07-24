import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

import MockAdapter from 'axios-mock-adapter';
import { mockUser, mockDepartments, mockFaculty, mockStudents, mockSubjects, mockPOs, mockCOs, mockMappings } from './mockData';

// Setup Mock Adapter
const mock = new MockAdapter(api, { delayResponse: 500 });

// Auth & User
mock.onPost('/auth/login').reply(200, { access_token: 'fake-token-123' });
mock.onGet('/users/me').reply(200, mockUser);
mock.onPut('/users/me').reply(config => {
  const data = JSON.parse(config.data);
  Object.assign(mockUser, data);
  return [200, mockUser];
});

// Departments
mock.onGet('/departments').reply(() => [200, mockDepartments]);
mock.onPost('/departments').reply(config => {
  const newDept = { ...JSON.parse(config.data), id: mockDepartments.length + 1 };
  mockDepartments.push(newDept);
  return [200, newDept];
});
mock.onPut(/\/departments\/\d+/).reply(config => {
  const id = parseInt(config.url!.split('/').pop()!);
  const index = mockDepartments.findIndex(d => d.id === id);
  mockDepartments[index] = { ...mockDepartments[index], ...JSON.parse(config.data) };
  return [200, mockDepartments[index]];
});
mock.onDelete(/\/departments\/\d+/).reply(config => {
  const id = parseInt(config.url!.split('/').pop()!);
  const index = mockDepartments.findIndex(d => d.id === id);
  mockDepartments.splice(index, 1);
  return [200, { message: 'Deleted' }];
});

// Faculty
mock.onGet('/faculty').reply(200, mockFaculty);
// Students
mock.onGet('/students').reply(200, mockStudents);
// Subjects
mock.onGet('/subjects').reply(200, mockSubjects);
// POs
mock.onGet('/program-outcomes').reply(200, mockPOs);
// COs
mock.onGet('/course-outcomes').reply(200, mockCOs);
// Mappings
mock.onGet('/co-po-mapping').reply(200, mockMappings);

// Any other requests pass through or return empty array
mock.onAny().reply(200, []);

export default api;
