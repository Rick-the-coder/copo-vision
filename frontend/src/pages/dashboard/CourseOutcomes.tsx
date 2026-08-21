import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search, Loader2, Target } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';

const coSchema = z.object({
  course_id: z.number().min(1, 'Course is required'),
  co_number: z.string().min(1, 'CO Number is required'),
  co_title: z.string().min(1, 'Title is required'),
  co_description: z.string().optional(),
  target_percentage: z.number().min(0).max(100, 'Target must be between 0 and 100'),
  status: z.boolean(),
});

type COFormData = z.infer<typeof coSchema>;

interface CourseOutcome extends COFormData {
  id: number;
}

interface Course {
  id: number;
  course_name: string;
}

const CourseOutcomesPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CourseOutcome | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<COFormData>({
    resolver: zodResolver(coSchema)
  });

  const { data: items, isLoading } = useQuery({ queryKey: ['course-outcomes'], queryFn: async () => (await api.get('/course-outcomes')).data as CourseOutcome[] });
  
  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: async () => (await api.get('/courses')).data as Course[] });

  const createMutation = useMutation({
    mutationFn: (newItem: COFormData) => api.post('/course-outcomes', newItem),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['course-outcomes'] }); closeModal(); }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, item: COFormData }) => api.put(`/course-outcomes/${data.id}`, data.item),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['course-outcomes'] }); closeModal(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/course-outcomes/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['course-outcomes'] }); }
  });

  const openModal = (item: CourseOutcome | null = null) => {
    setEditingItem(item);
    if (item) reset({ ...item });
    else reset({ co_number: '', co_title: '', co_description: '', target_percentage: 60, status: true });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingItem(null); reset(); };

  const onSubmit = (data: COFormData) => {
    if (editingItem) updateMutation.mutate({ id: editingItem.id, item: data });
    else createMutation.mutate(data);
  };

  const filteredItems = items?.filter(i => 
    i.co_title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.co_number.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Course Outcomes (COs)</h2>
          <p className="text-slate-500 text-sm mt-1">Define and manage learning outcomes for courses</p>
        </div>
        <button onClick={() => openModal()} className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add CO
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search outcomes..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[13px] uppercase tracking-wider font-semibold">
                <th className="p-4">CO Number</th>
                <th className="p-4">Course</th>
                <th className="p-4">Title / Description</th>
                <th className="p-4">Target</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary/60" /></td></tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <Target className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="font-medium text-slate-900">No Course Outcomes found</p>
                      <p className="text-sm mt-1">Get started by creating a new CO.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">{item.co_number}</td>
                    <td className="p-4 text-slate-700">{courses?.find(c => c.id === item.course_id)?.course_name || '-'}</td>
                    <td className="p-4">
                      <p className="font-medium text-slate-800">{item.co_title}</p>
                      <p className="text-sm text-slate-500 mt-0.5 max-w-md truncate" title={item.co_description}>{item.co_description}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${item.target_percentage}%` }}></div>
                        </div>
                        <span className="text-sm font-medium text-slate-700">{item.target_percentage}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.status ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {item.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => { if(window.confirm('Delete this CO?')) deleteMutation.mutate(item.id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold text-slate-800">{editingItem ? 'Edit Course Outcome' : 'Add Course Outcome'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="co-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Course *</label>
                  <select {...register('course_id', { valueAsNumber: true })} className={`w-full px-3 py-2.5 bg-white border ${errors.course_id ? 'border-red-300' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`}>
                    <option value="">Select Course</option>
                    {courses?.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
                  </select>
                  {errors.course_id && <p className="text-red-500 text-xs mt-1.5">{errors.course_id.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">CO Number *</label>
                  <input {...register('co_number')} placeholder="e.g. CO1" className={`w-full px-3 py-2.5 bg-white border ${errors.co_number ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`} />
                  {errors.co_number && <p className="text-red-500 text-xs mt-1.5">{errors.co_number.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                  <input {...register('co_title')} placeholder="Short descriptive title" className={`w-full px-3 py-2.5 bg-white border ${errors.co_title ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`} />
                  {errors.co_title && <p className="text-red-500 text-xs mt-1.5">{errors.co_title.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea {...register('co_description')} rows={3} placeholder="Detailed outcome description..." className="w-full px-3 py-2.5 bg-white border border-slate-300 focus:border-primary rounded-lg outline-none transition-all text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Percentage (%) *</label>
                  <input type="number" {...register('target_percentage', { valueAsNumber: true })} className={`w-full px-3 py-2.5 bg-white border ${errors.target_percentage ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`} />
                  {errors.target_percentage && <p className="text-red-500 text-xs mt-1.5">{errors.target_percentage.message}</p>}
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" {...register('status')} id="status" className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" />
                  <label htmlFor="status" className="text-sm font-medium text-slate-700">Active Status</label>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 shrink-0">
              <button type="button" onClick={closeModal} className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-white font-medium text-sm transition-colors">Cancel</button>
              <button type="submit" form="co-form" disabled={createMutation.isPending || updateMutation.isPending} className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70">
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingItem ? 'Update CO' : 'Create CO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CourseOutcomesPage;
