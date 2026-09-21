import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if (Array.isArray(data.students)) {
        response.data = data.students;
      } else if (Array.isArray(data.assessments)) {
        response.data = data.assessments;
      } else if (Array.isArray(data.alerts)) {
        response.data = data.alerts;
      }
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
