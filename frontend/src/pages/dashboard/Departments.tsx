import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

interface Department {
  id: number;
  department_name: string;
  department_code: string;
  hod_name: string;
  status: boolean;
}

const Departments = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>();

  // Fetch data
  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await api.get('/departments');
      return data as Department[];
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (newDept: any) => api.post('/departments', newDept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      closeModal();
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: number, dept: any }) => api.put(`/departments/${data.id}`, data.dept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      closeModal();
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/departments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    }
  });

  const openModal = (dept: Department | null = null) => {
    setEditingDept(dept);
    if (dept) {
      reset(dept);
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

  const onSubmit = (data: any) => {
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
          <h2 className="text-2xl font-bold text-slate-800">Departments</h2>
          <p className="text-slate-500 text-sm mt-1">Manage academic departments</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search departments..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Code</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">HOD</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : filteredDepts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No departments found.</td>
                </tr>
              ) : (
                filteredDepts.map(dept => (
                  <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{dept.department_code}</td>
                    <td className="p-4 text-slate-700">{dept.department_name}</td>
                    <td className="p-4 text-slate-700">{dept.hod_name || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${dept.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {dept.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openModal(dept)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('Are you sure?')) deleteMutation.mutate(dept.id) }} 
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingDept ? 'Edit Department' : 'Add Department'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department Code *</label>
                <input 
                  {...register('department_code', { required: 'Code is required' })} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
                {errors.department_code && <p className="text-red-500 text-xs mt-1">{errors.department_code.message?.toString()}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department Name *</label>
                <input 
                  {...register('department_name', { required: 'Name is required' })} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
                {errors.department_name && <p className="text-red-500 text-xs mt-1">{errors.department_name.message?.toString()}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">HOD Name</label>
                <input 
                  {...register('hod_name')} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('status')} id="status" className="w-4 h-4 text-primary" />
                <label htmlFor="status" className="text-sm font-medium text-slate-700">Active Status</label>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium flex items-center gap-2">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save
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
