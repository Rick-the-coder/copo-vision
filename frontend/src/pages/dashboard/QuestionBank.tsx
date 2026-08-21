import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search, Loader2, FileQuestion } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';

const questionBankSchema = z.object({
  course_id: z.number().min(1, 'Course is required'),
  unit: z.number().min(1, 'Unit is required'),
  question_number: z.string().min(1, 'Question number is required'),
  question_text: z.string().min(1, 'Question text is required'),
  maximum_marks: z.number().min(0.5, 'Marks must be at least 0.5'),
  question_type: z.string().min(1, 'Question type is required'),
  difficulty_level: z.string().min(1, 'Difficulty level is required'),
  bloom_level: z.string().min(1, 'Bloom level is required'),
  co_id: z.number().optional().nullable(),
  status: z.boolean(),
});

type QuestionBankFormData = z.infer<typeof questionBankSchema>;

interface QuestionBank extends QuestionBankFormData {
  id: number;
}

interface Course {
  id: number;
  course_name: string;
}

const QuestionBankPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuestionBank | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<QuestionBankFormData>({
    resolver: zodResolver(questionBankSchema)
  });

  const { data: items, isLoading } = useQuery({ queryKey: ['question-banks'], queryFn: async () => (await api.get('/question-banks')).data as QuestionBank[] });
  
  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: async () => (await api.get('/courses')).data as Course[] });

  const createMutation = useMutation({
    mutationFn: (newItem: QuestionBankFormData) => api.post('/question-banks', newItem),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['question-banks'] }); closeModal(); }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, item: QuestionBankFormData }) => api.put(`/question-banks/${data.id}`, data.item),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['question-banks'] }); closeModal(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/question-banks/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['question-banks'] }); }
  });

  const openModal = (item: QuestionBank | null = null) => {
    setEditingItem(item);
    if (item) reset({ ...item });
    else reset({ 
      unit: 1, 
      question_number: '', 
      question_text: '', 
      maximum_marks: 5, 
      question_type: 'Short Answer', 
      difficulty_level: 'Medium', 
      bloom_level: 'Understand', 
      status: true 
    });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingItem(null); reset(); };

  const onSubmit = (data: QuestionBankFormData) => {
    if (editingItem) updateMutation.mutate({ id: editingItem.id, item: data });
    else createMutation.mutate(data);
  };

  const filteredItems = items?.filter(i => 
    i.question_text.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.question_number.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Question Bank</h2>
          <p className="text-slate-500 text-sm mt-1">Manage assessment questions and CO mapping</p>
        </div>
        <button onClick={() => openModal()} className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search questions..." 
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
                <th className="p-4 w-20">Q. No</th>
                <th className="p-4">Course</th>
                <th className="p-4">Question Text</th>
                <th className="p-4 w-20">Marks</th>
                <th className="p-4 w-32">Bloom Level</th>
                <th className="p-4 w-24">CO ID</th>
                <th className="p-4 text-right w-24">Actions</th>
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
                        <FileQuestion className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="font-medium text-slate-900">No questions found</p>
                      <p className="text-sm mt-1">Get started by adding a question to the bank.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{item.question_number}</td>
                    <td className="p-4 text-slate-700">{courses?.find(c => c.id === item.course_id)?.course_name || '-'}</td>
                    <td className="p-4 text-slate-700 max-w-[300px] truncate" title={item.question_text}>{item.question_text}</td>
                    <td className="p-4 text-slate-700">{item.maximum_marks}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-medium">
                        {item.bloom_level}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={item.co_id ? "font-medium text-slate-700" : "text-slate-400"}>
                        {item.co_id ? `CO${item.co_id}` : 'Unmapped'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => { if(window.confirm('Delete this question?')) deleteMutation.mutate(item.id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
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
              <h3 className="text-lg font-semibold text-slate-800">{editingItem ? 'Edit Question' : 'Add Question'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="question-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Question Text *</label>
                    <textarea rows={3} {...register('question_text')} className={`w-full px-3 py-2.5 bg-white border ${errors.question_text ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`} placeholder="Enter the question text here..." />
                    {errors.question_text && <p className="text-red-500 text-xs mt-1.5">{errors.question_text.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Course *</label>
                    <select {...register('course_id', { valueAsNumber: true })} className={`w-full px-3 py-2.5 bg-white border ${errors.course_id ? 'border-red-300' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`}>
                      <option value="">Select Course</option>
                      {courses?.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
                    </select>
                    {errors.course_id && <p className="text-red-500 text-xs mt-1.5">{errors.course_id.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit *</label>
                    <input type="number" {...register('unit', { valueAsNumber: true })} className={`w-full px-3 py-2.5 bg-white border ${errors.unit ? 'border-red-300' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`} min="1" max="10" />
                    {errors.unit && <p className="text-red-500 text-xs mt-1.5">{errors.unit.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Question Number *</label>
                    <input {...register('question_number')} className={`w-full px-3 py-2.5 bg-white border ${errors.question_number ? 'border-red-300' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`} placeholder="e.g. Q1.a" />
                    {errors.question_number && <p className="text-red-500 text-xs mt-1.5">{errors.question_number.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Maximum Marks *</label>
                    <input type="number" step="0.5" {...register('maximum_marks', { valueAsNumber: true })} className={`w-full px-3 py-2.5 bg-white border ${errors.maximum_marks ? 'border-red-300' : 'border-slate-300 focus:border-primary'} rounded-lg outline-none transition-all text-sm`} />
                    {errors.maximum_marks && <p className="text-red-500 text-xs mt-1.5">{errors.maximum_marks.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Question Type *</label>
                    <select {...register('question_type')} className="w-full px-3 py-2.5 bg-white border border-slate-300 focus:border-primary rounded-lg outline-none transition-all text-sm">
                      <option value="MCQ">Multiple Choice</option>
                      <option value="Short Answer">Short Answer</option>
                      <option value="Long Answer">Long Answer</option>
                      <option value="Numerical">Numerical</option>
                      <option value="Programming">Programming</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Difficulty Level *</label>
                    <select {...register('difficulty_level')} className="w-full px-3 py-2.5 bg-white border border-slate-300 focus:border-primary rounded-lg outline-none transition-all text-sm">
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Bloom's Taxonomy Level *</label>
                    <select {...register('bloom_level')} className="w-full px-3 py-2.5 bg-white border border-slate-300 focus:border-primary rounded-lg outline-none transition-all text-sm">
                      <option value="Remember">Remember (L1)</option>
                      <option value="Understand">Understand (L2)</option>
                      <option value="Apply">Apply (L3)</option>
                      <option value="Analyze">Analyze (L4)</option>
                      <option value="Evaluate">Evaluate (L5)</option>
                      <option value="Create">Create (L6)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Mapped CO (Optional)</label>
                    <input type="number" {...register('co_id', { valueAsNumber: true })} className="w-full px-3 py-2.5 bg-white border border-slate-300 focus:border-primary rounded-lg outline-none transition-all text-sm" placeholder="CO Number (e.g. 1)" />
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
              <button type="submit" form="question-form" disabled={createMutation.isPending || updateMutation.isPending} className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70">
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingItem ? 'Update Question' : 'Save Question'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default QuestionBankPage;
