import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

interface QuestionBank {
  id: number;
  course_id: number;
  unit: number;
  question_number: string;
  question_text: string;
  maximum_marks: number;
  question_type: string;
  difficulty_level: string;
  bloom_level: string;
  co_id: number | null;
  status: boolean;
}

const QuestionBankPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuestionBank | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset } = useForm<any>();

  const { data: items, isLoading } = useQuery({ queryKey: ['question-banks'], queryFn: async () => (await api.get('/question-banks')).data as QuestionBank[] });

  const createMutation = useMutation({
    mutationFn: (newItem: any) => api.post('/question-banks', newItem),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['question-banks'] }); closeModal(); }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, item: any }) => api.put(`/question-banks/${data.id}`, data.item),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['question-banks'] }); closeModal(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/question-banks/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['question-banks'] }); }
  });

  const openModal = (item: QuestionBank | null = null) => {
    setEditingItem(item);
    if (item) reset(item);
    else reset({ status: true });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingItem(null); reset(); };

  const onSubmit = (data: any) => {
    if (editingItem) updateMutation.mutate({ id: editingItem.id, item: data });
    else createMutation.mutate(data);
  };

  const filteredItems = items?.filter(i => JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Question Bank</h2>
        <button onClick={() => openModal()} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 relative">
          <Search className="w-5 h-5 absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search questions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full max-w-md pl-10 pr-4 py-2 rounded-lg border outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-sm uppercase tracking-wider text-slate-600">
              <tr>
                <th className="p-4">Q. No</th>
                <th className="p-4">Text</th>
                <th className="p-4">Marks</th>
                <th className="p-4">Bloom Level</th>
                <th className="p-4">CO ID</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr> :
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold">{item.question_number}</td>
                    <td className="p-4 max-w-md truncate" title={item.question_text}>{item.question_text}</td>
                    <td className="p-4">{item.maximum_marks}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{item.bloom_level}</span></td>
                    <td className="p-4">{item.co_id || '-'}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => openModal(item)} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => { if(window.confirm('Delete?')) deleteMutation.mutate(item.id) }} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{editingItem ? 'Edit' : 'Add'} Question</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="block text-sm mb-1">Course ID</label><input type="number" {...register('course_id', {required: true, valueAsNumber: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm mb-1">Unit</label><input type="number" {...register('unit', {required: true, valueAsNumber: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm mb-1">Q. Number</label><input {...register('question_number', {required: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div className="col-span-2"><label className="block text-sm mb-1">Question Text</label><textarea rows={3} {...register('question_text', {required: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm mb-1">Max Marks</label><input type="number" step="0.5" {...register('maximum_marks', {required: true, valueAsNumber: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div>
                <label className="block text-sm mb-1">Question Type</label>
                <select {...register('question_type')} className="w-full px-3 py-2 border rounded-lg bg-white">
                  <option value="MCQ">MCQ</option>
                  <option value="Short Answer">Short Answer</option>
                  <option value="Long Answer">Long Answer</option>
                  <option value="Numerical">Numerical</option>
                  <option value="Programming">Programming</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Difficulty</label>
                <select {...register('difficulty_level')} className="w-full px-3 py-2 border rounded-lg bg-white">
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Bloom's Level</label>
                <select {...register('bloom_level')} className="w-full px-3 py-2 border rounded-lg bg-white">
                  <option value="Remember">Remember</option>
                  <option value="Understand">Understand</option>
                  <option value="Apply">Apply</option>
                  <option value="Analyze">Analyze</option>
                  <option value="Evaluate">Evaluate</option>
                  <option value="Create">Create</option>
                </select>
              </div>
              <div className="col-span-2"><label className="block text-sm mb-1">Mapped CO ID (Optional)</label><input type="number" {...register('co_id', {valueAsNumber: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
              
              <div className="pt-4 flex justify-end gap-3 col-span-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default QuestionBankPage;
