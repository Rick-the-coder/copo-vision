import api from './api';

export const courseService = {
  getAll: async () => {
    const { data } = await api.get('/courses');
    return data;
  },
  create: async (course: any) => {
    const { data } = await api.post('/courses', course);
    return data;
  },
  update: async (id: number, course: any) => {
    const { data } = await api.put(`/courses/${id}`, course);
    return data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/courses/${id}`);
    return data;
  }
};
