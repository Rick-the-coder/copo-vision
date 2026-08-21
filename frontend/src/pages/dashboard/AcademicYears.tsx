import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search, Loader2, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';

const academicYearSchema = z.object({
  academic_year: z.string().min(1, 'Academic year is required (e.g. 2023-2024)'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  status: z.boolean(),
});

type AcademicYearFormData = z.infer<typeof academicYearSchema>;

interface AcademicYear extends AcademicYearFormData {
  id: number;
}

const AcademicYearsPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademicYear | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AcademicYearFormData>({
    resolver: zodResolver(academicYearSchema)
  });

  const { data: items, isLoading } = useQuery({ queryKey: ['academic-years'], queryFn: async () => (await api.get('/academic-years')).data as AcademicYear[] });

  const createMutation = useMutation({
    mutationFn: (newItem: AcademicYearFormData) => api.post('/academic-years', newItem),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['academic-years'] }); closeModal(); }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, item: AcademicYearFormData }) => api.put(`/academic-years/${data.id}`, data.item),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['academic-years'] }); closeModal(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/academic-years/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['academic-years'] }); }
  });

  const openModal = (item: AcademicYear | null = null) => {
    setEditingItem(item);
    if (item) reset({ ...item });
    else reset({ academic_year: '', start_date: '', end_date: '', status: true });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingItem(null); reset(); };

  const onSubmit = (data: AcademicYearFormData) => {
    if (editingItem) updateMutation.mutate({ id: editingItem.id, item: data });
    else createMutation.mutate(data);
  };

  const filteredItems = items?.filter(i => 
    i.academic_year.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Academic Years</h2>
          <p className="text-slate-500 text-sm mt-1">Manage academic sessions and terms</p>
        </div>
        <button onClick={() => openModal()} className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Academic Year
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search academic years..." 
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
                <th className="p-4">Academic Year</th>
                <th className="p-4">Start Date</th>
                <th className="p-4">End Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary/60" /></td></tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <Calendar className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="font-medium text-slate-900">No academic years found</p>
                      <p className="text-sm mt-1">Get started by creating a new academic year.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{item.academic_year}</td>
                    <td className="p-4 text-slate-700">{item.start_date}</td>
                    <td className="p-4 text-slate-700">{item.end_date}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.status ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                        {item.status ? 'Active' : 'Completed'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => { if(window.confirm('Delete this academic year?')) deleteMutation.mutate(item.id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
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
              <h3 className="text-lg font-semibold text-slate-800">{editingItem ? 'Edit Academic Year' : 'Add Academic Year'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">&times;</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Academic Year *</label>
                <input {...register('academic_year')} className={`w-full px-3 py-2.5 bg-white border ${errors.academic_year ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`} placeholder="e.g. 2024-2025" />
                {errors.academic_year && <p className="text-red-500 text-xs mt-1.5">{errors.academic_year.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date *</label>
                  <input type="date" {...register('start_date')} className={`w-full px-3 py-2.5 bg-white border ${errors.start_date ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm text-slate-700`} />
                  {errors.start_date && <p className="text-red-500 text-xs mt-1.5">{errors.start_date.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date *</label>
                  <input type="date" {...register('end_date')} className={`w-full px-3 py-2.5 bg-white border ${errors.end_date ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm text-slate-700`} />
                  {errors.end_date && <p className="text-red-500 text-xs mt-1.5">{errors.end_date.message}</p>}
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" {...register('status')} id="status" className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" />
                <label htmlFor="status" className="text-sm font-medium text-slate-700">Set as Active Year</label>
              </div>
              
              <div className="pt-5 mt-5 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingItem ? 'Update Year' : 'Create Year'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AcademicYearsPage;
