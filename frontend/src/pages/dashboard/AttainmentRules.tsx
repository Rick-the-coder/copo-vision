import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

interface AttainmentRule {
  id: number;
  level_name: string;
  min_percentage: number;
  max_percentage: number;
  status: boolean;
}

const AttainmentRulesPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AttainmentRule | null>(null);

  const { register, handleSubmit, reset } = useForm<any>();

  const { data: items, isLoading } = useQuery({ queryKey: ['attainment-rules'], queryFn: async () => (await api.get('/attainment-rules')).data as AttainmentRule[] });

  const createMutation = useMutation({
    mutationFn: (newItem: any) => api.post('/attainment-rules', newItem),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['attainment-rules'] }); closeModal(); }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, item: any }) => api.put(`/attainment-rules/${data.id}`, data.item),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['attainment-rules'] }); closeModal(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/attainment-rules/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['attainment-rules'] }); }
  });

  const openModal = (item: AttainmentRule | null = null) => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Attainment Rules</h2>
        <button onClick={() => openModal()} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Rule
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-sm uppercase tracking-wider text-slate-600">
              <tr>
                <th className="p-4">Level Name</th>
                <th className="p-4">Min (%)</th>
                <th className="p-4">Max (%)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr> :
                (items || []).sort((a,b) => a.min_percentage - b.min_percentage).map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-blue-600">{item.level_name}</td>
                    <td className="p-4">{item.min_percentage}%</td>
                    <td className="p-4">{item.max_percentage}%</td>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{editingItem ? 'Edit' : 'Add'} Rule</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div><label className="block text-sm mb-1">Level Name</label><input {...register('level_name', {required: true})} placeholder="e.g. Level 3" className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm mb-1">Min Percentage (%)</label><input type="number" step="0.1" {...register('min_percentage', {required: true, valueAsNumber: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm mb-1">Max Percentage (%)</label><input type="number" step="0.1" {...register('max_percentage', {required: true, valueAsNumber: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div className="pt-4 flex justify-end gap-3">
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
export default AttainmentRulesPage;
