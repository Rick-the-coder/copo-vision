import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search, Loader2, ClipboardCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';

const assessmentSchema = z.object({
  assessment_name: z.string().min(1, 'Assessment name is required'),
  assessment_type_id: z.number().min(1, 'Assessment type is required'),
  course_id: z.number().min(1, 'Course is required'),
  subject_id: z.number().min(1, 'Subject is required'),
  maximum_marks: z.number().min(1, 'Maximum marks must be greater than 0'),
  passing_marks: z.number().min(0, 'Passing marks cannot be negative'),
  weightage: z.number().min(0, 'Weightage cannot be negative').max(100, 'Weightage cannot exceed 100%'),
  status: z.boolean(),
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

interface Assessment extends AssessmentFormData {
  id: number;
}

interface Course {
  id: number;
  course_name: string;
}

interface Subject {
  id: number;
  subject_name: string;
}

// Temporary mock type for assessment types
const ASSESSMENT_TYPES = [
  { id: 1, name: 'Assignment' },
  { id: 2, name: 'Midterm Exam' },
  { id: 3, name: 'Final Exam' },
  { id: 4, name: 'Project' },
  { id: 5, name: 'Quiz' },
];

const AssessmentsPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Assessment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema)
  });

  const { data: items, isLoading } = useQuery({ queryKey: ['assessments'], queryFn: async () => (await api.get('/assessments')).data as Assessment[] });
  
  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: async () => (await api.get('/courses')).data as Course[] });
  
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: async () => (await api.get('/subjects')).data as Subject[] });

  const createMutation = useMutation({
    mutationFn: (newItem: AssessmentFormData) => api.post('/assessments', newItem),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['assessments'] }); closeModal(); }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, item: AssessmentFormData }) => api.put(`/assessments/${data.id}`, data.item),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['assessments'] }); closeModal(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/assessments/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['assessments'] }); }
  });

  const openModal = (item: Assessment | null = null) => {
    setEditingItem(item);
    if (item) reset({ ...item });
    else reset({ assessment_name: '', maximum_marks: 100, passing_marks: 40, weightage: 10, status: true });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingItem(null); reset(); };

  const onSubmit = (data: AssessmentFormData) => {
    if (editingItem) updateMutation.mutate({ id: editingItem.id, item: data });
    else createMutation.mutate(data);
  };

  const filteredItems = items?.filter(i => 
    i.assessment_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Assessments</h2>
          <p className="text-slate-500 text-sm mt-1">Manage evaluations and examinations</p>
        </div>
        <button onClick={() => openModal()} className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Assessment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search assessments..." 
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
                <th className="p-4">Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Max Marks</th>
                <th className="p-4">Weightage</th>
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
                        <ClipboardCheck className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="font-medium text-slate-900">No assessments found</p>
                      <p className="text-sm mt-1">Get started by creating a new assessment.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{item.assessment_name}</td>
                    <td className="p-4 text-slate-700">{ASSESSMENT_TYPES.find(t => t.id === item.assessment_type_id)?.name || 'Unknown'}</td>
                    <td className="p-4 text-slate-700">{subjects?.find(s => s.id === item.subject_id)?.subject_name || '-'}</td>
                    <td className="p-4 text-slate-700">{item.maximum_marks}</td>
                    <td className="p-4 text-slate-700">{item.weightage}%</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.status ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {item.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => { if(window.confirm('Delete this assessment?')) deleteMutation.mutate(item.id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold text-slate-800">{editingItem ? 'Edit Assessment' : 'Add Assessment'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="assessment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Assessment Name *</label>
                    <input {...register('assessment_name')} className={`w-full px-3 py-2.5 bg-white border ${errors.assessment_name ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`} placeholder="e.g. Midterm Physics" />
                    {errors.assessment_name && <p className="text-red-500 text-xs mt-1.5">{errors.assessment_name.message}</p>}
                  </div>
                  
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Assessment Type *</label>
                    <select {...register('assessment_type_id', { valueAsNumber: true })} className={`w-full px-3 py-2.5 bg-white border ${errors.assessment_type_id ? 'border-red-300' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`}>
                      <option value="">Select Type</option>
                      {ASSESSMENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    {errors.assessment_type_id && <p className="text-red-500 text-xs mt-1.5">{errors.assessment_type_id.message}</p>}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Course *</label>
                    <select {...register('course_id', { valueAsNumber: true })} className={`w-full px-3 py-2.5 bg-white border ${errors.course_id ? 'border-red-300' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`}>
                      <option value="">Select Course</option>
                      {courses?.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
                    </select>
                    {errors.course_id && <p className="text-red-500 text-xs mt-1.5">{errors.course_id.message}</p>}
                  </div>
                  
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject *</label>
                    <select {...register('subject_id', { valueAsNumber: true })} className={`w-full px-3 py-2.5 bg-white border ${errors.subject_id ? 'border-red-300' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`}>
                      <option value="">Select Subject</option>
                      {subjects?.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                    </select>
                    {errors.subject_id && <p className="text-red-500 text-xs mt-1.5">{errors.subject_id.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Maximum Marks *</label>
                    <input type="number" {...register('maximum_marks', { valueAsNumber: true })} className={`w-full px-3 py-2.5 bg-white border ${errors.maximum_marks ? 'border-red-300' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`} />
                    {errors.maximum_marks && <p className="text-red-500 text-xs mt-1.5">{errors.maximum_marks.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Passing Marks *</label>
                    <input type="number" {...register('passing_marks', { valueAsNumber: true })} className={`w-full px-3 py-2.5 bg-white border ${errors.passing_marks ? 'border-red-300' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`} />
                    {errors.passing_marks && <p className="text-red-500 text-xs mt-1.5">{errors.passing_marks.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Weightage (%) *</label>
                    <input type="number" {...register('weightage', { valueAsNumber: true })} className={`w-full px-3 py-2.5 bg-white border ${errors.weightage ? 'border-red-300' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`} min="0" max="100" />
                    {errors.weightage && <p className="text-red-500 text-xs mt-1.5">{errors.weightage.message}</p>}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" {...register('status')} id="status" className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" />
                  <label htmlFor="status" className="text-sm font-medium text-slate-700">Active Status</label>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 shrink-0">
              <button type="button" onClick={closeModal} className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-white font-medium text-sm transition-colors">Cancel</button>
              <button type="submit" form="assessment-form" disabled={createMutation.isPending || updateMutation.isPending} className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70">
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingItem ? 'Update Assessment' : 'Create Assessment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AssessmentsPage;
