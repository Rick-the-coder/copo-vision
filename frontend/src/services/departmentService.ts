import api from './api';

export const departmentService = {
  getAll: async () => {
    const { data } = await api.get('/departments');
    return data;
  },
  create: async (dept: any) => {
    const { data } = await api.post('/departments', dept);
    return data;
  },
  update: async (id: number, dept: any) => {
    const { data } = await api.put(`/departments/${id}`, dept);
    return data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/departments/${id}`);
    return data;
  }
};
