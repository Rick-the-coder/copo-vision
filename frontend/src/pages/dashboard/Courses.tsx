import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';

const courseSchema = z.object({
  course_code: z.string().min(1, 'Course code is required'),
  course_name: z.string().min(1, 'Course name is required'),
  program: z.string().min(1, 'Program is required'),
  duration_years: z.number().min(1, 'Duration must be at least 1 year'),
  department_id: z.number().min(1, 'Department is required'),
  status: z.boolean(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface Course extends CourseFormData {
  id: number;
}

interface Department {
  id: number;
  department_name: string;
}

const Courses = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema)
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => (await api.get('/courses')).data as Course[]
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await api.get('/departments')).data as Department[]
  });

  const createMutation = useMutation({
    mutationFn: (newItem: CourseFormData) => api.post('/courses', newItem),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['courses'] }); closeModal(); }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, item: CourseFormData }) => api.put(`/courses/${data.id}`, data.item),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['courses'] }); closeModal(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/courses/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['courses'] }); }
  });

  const openModal = (item: Course | null = null) => {
    setEditingItem(item);
    if (item) reset({ ...item });
    else reset({ course_name: '', course_code: '', program: 'UG', duration_years: 4, status: true });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingItem(null); reset(); };

  const onSubmit = (data: CourseFormData) => {
    if (editingItem) updateMutation.mutate({ id: editingItem.id, item: data });
    else createMutation.mutate(data);
  };

  const filteredItems = items?.filter(i => 
    i.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.course_code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Courses</h2>
          <p className="text-slate-500 text-sm mt-1">Manage academic courses and programs</p>
        </div>
        <button onClick={() => openModal()} className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search courses..." 
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
                <th className="p-4 w-24">Code</th>
                <th className="p-4">Name</th>
                <th className="p-4">Program</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Department</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={7} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary/60" /></td></tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <Search className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="font-medium text-slate-900">No courses found</p>
                      <p className="text-sm mt-1">Get started by creating a new course.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{item.course_code}</td>
                    <td className="p-4 text-slate-700">{item.course_name}</td>
                    <td className="p-4 text-slate-700">{item.program}</td>
                    <td className="p-4 text-slate-700">{item.duration_years} Years</td>
                    <td className="p-4 text-slate-700">{departments?.find(d => d.id === item.department_id)?.department_name || '-'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.status ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {item.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => { if(window.confirm('Delete this course?')) deleteMutation.mutate(item.id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">{editingItem ? 'Edit Course' : 'Add Course'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Course Name *</label>
                  <input {...register('course_name')} className={`w-full px-3 py-2.5 bg-white border ${errors.course_name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-primary focus:ring-primary/20'} rounded-lg focus:ring-4 outline-none transition-all text-sm`} placeholder="e.g. B.Tech Computer Science" />
                  {errors.course_name && <p className="text-red-500 text-xs mt-1.5">{errors.course_name.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Course Code *</label>
                  <input {...register('course_code')} className={`w-full px-3 py-2.5 bg-white border ${errors.course_code ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`} placeholder="e.g. BTECH-CSE" />
                  {errors.course_code && <p className="text-red-500 text-xs mt-1.5">{errors.course_code.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Program *</label>
                  <select {...register('program')} className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg outline-none transition-all text-sm focus:border-primary">
                    <option value="UG">Undergraduate (UG)</option>
                    <option value="PG">Postgraduate (PG)</option>
                    <option value="PHD">Doctorate (PhD)</option>
                    <option value="DIPLOMA">Diploma</option>
                  </select>
                  {errors.program && <p className="text-red-500 text-xs mt-1.5">{errors.program.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration (Years) *</label>
                  <input type="number" {...register('duration_years', { valueAsNumber: true })} className={`w-full px-3 py-2.5 bg-white border ${errors.duration_years ? 'border-red-300' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`} min="1" max="6" />
                  {errors.duration_years && <p className="text-red-500 text-xs mt-1.5">{errors.duration_years.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Department *</label>
                  <select {...register('department_id', { valueAsNumber: true })} className={`w-full px-3 py-2.5 bg-white border ${errors.department_id ? 'border-red-300' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`}>
                    <option value="">Select Department</option>
                    {departments?.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                  </select>
                  {errors.department_id && <p className="text-red-500 text-xs mt-1.5">{errors.department_id.message}</p>}
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" {...register('status')} id="status" className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" />
                <label htmlFor="status" className="text-sm font-medium text-slate-700">Active Status</label>
              </div>
              
              <div className="pt-5 mt-5 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingItem ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Courses;
