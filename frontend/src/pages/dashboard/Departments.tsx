import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search, Loader2, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';

const departmentSchema = z.object({
  department_code: z.string().min(1, 'Department code is required'),
  department_name: z.string().min(1, 'Department name is required'),
  hod_name: z.string().optional(),
  status: z.boolean(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface Department extends DepartmentFormData {
  id: number;
}

const Departments = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema)
  });

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await api.get('/departments');
      return data as Department[];
    }
  });

  const createMutation = useMutation({
    mutationFn: (newDept: DepartmentFormData) => api.post('/departments', newDept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, dept: DepartmentFormData }) => api.put(`/departments/${data.id}`, data.dept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      closeModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/departments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    }
  });

  const openModal = (dept: Department | null = null) => {
    setEditingDept(dept);
    if (dept) {
      reset({ ...dept });
    } else {
      reset({ department_name: '', department_code: '', hod_name: '', status: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDept(null);
    reset();
  };

  const onSubmit = (data: DepartmentFormData) => {
    if (editingDept) {
      updateMutation.mutate({ id: editingDept.id, dept: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredDepts = departments?.filter(d => 
    d.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.department_code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Departments</h2>
          <p className="text-slate-500 text-sm mt-1">Manage academic departments</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search departments..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[13px] uppercase tracking-wider font-semibold">
                <th className="p-4 w-24">Code</th>
                <th className="p-4">Name</th>
                <th className="p-4">HOD</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary/60" />
                  </td>
                </tr>
              ) : filteredDepts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <Building2 className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="font-medium text-slate-900">No departments found</p>
                      <p className="text-sm mt-1">Get started by adding a new department.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDepts.map(dept => (
                  <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{dept.department_code}</td>
                    <td className="p-4 text-slate-700">{dept.department_name}</td>
                    <td className="p-4 text-slate-700">{dept.hod_name || '-'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${dept.status ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {dept.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(dept)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { if(window.confirm('Are you sure you want to delete this department?')) deleteMutation.mutate(dept.id) }} 
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingDept ? 'Edit Department' : 'Add Department'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">&times;</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Department Name *</label>
                <input 
                  {...register('department_name')} 
                  className={`w-full px-3 py-2.5 bg-white border ${errors.department_name ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`}
                  placeholder="e.g. Computer Science"
                />
                {errors.department_name && <p className="text-red-500 text-xs mt-1.5">{errors.department_name.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Department Code *</label>
                <input 
                  {...register('department_code')} 
                  className={`w-full px-3 py-2.5 bg-white border ${errors.department_code ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`}
                  placeholder="e.g. CSE"
                />
                {errors.department_code && <p className="text-red-500 text-xs mt-1.5">{errors.department_code.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">HOD Name</label>
                <input 
                  {...register('hod_name')} 
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 focus:border-primary rounded-lg outline-none transition-all text-sm"
                  placeholder="Optional"
                />
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" {...register('status')} id="status" className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" />
                <label htmlFor="status" className="text-sm font-medium text-slate-700">Active Status</label>
              </div>
              
              <div className="pt-5 mt-5 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
