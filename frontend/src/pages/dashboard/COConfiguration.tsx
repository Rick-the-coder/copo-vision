import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

interface COConfiguration {
  id: number;
  target_percentage: number;
  calculation_method: string;
  round_off_rules: string;
  minimum_student_count: number;
  status: boolean;
}

const COConfigurationPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<COConfiguration | null>(null);

  const { register, handleSubmit, reset } = useForm<any>();

  const { data: items, isLoading } = useQuery({ queryKey: ['co-configurations'], queryFn: async () => (await api.get('/co-configurations')).data as COConfiguration[] });

  const createMutation = useMutation({
    mutationFn: (newItem: any) => api.post('/co-configurations', newItem),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['co-configurations'] }); closeModal(); }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, item: any }) => api.put(`/co-configurations/${data.id}`, data.item),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['co-configurations'] }); closeModal(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/co-configurations/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['co-configurations'] }); }
  });

  const openModal = (item: COConfiguration | null = null) => {
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
        <h2 className="text-2xl font-bold text-slate-800">CO Configuration</h2>
        <button onClick={() => openModal()} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Config
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-sm uppercase tracking-wider text-slate-600">
              <tr>
                <th className="p-4">Target (%)</th>
                <th className="p-4">Method</th>
                <th className="p-4">Round-Off</th>
                <th className="p-4">Min Students</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr> :
                (items || []).map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold">{item.target_percentage}%</td>
                    <td className="p-4">{item.calculation_method}</td>
                    <td className="p-4">{item.round_off_rules}</td>
                    <td className="p-4">{item.minimum_student_count}</td>
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
            <h3 className="text-lg font-semibold mb-4">{editingItem ? 'Edit' : 'Add'} Configuration</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div><label className="block text-sm mb-1">Target (%)</label><input type="number" step="0.1" {...register('target_percentage', {required: true, valueAsNumber: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div>
                <label className="block text-sm mb-1">Calculation Method</label>
                <select {...register('calculation_method', {required: true})} className="w-full px-3 py-2 border rounded-lg">
                    <option value="Average">Average</option>
                    <option value="Weighted Average">Weighted Average</option>
                    <option value="Best Assessment">Best Assessment</option>
                </select>
              </div>
              <div><label className="block text-sm mb-1">Round-Off Rules</label><input {...register('round_off_rules', {required: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm mb-1">Min Students</label><input type="number" {...register('minimum_student_count', {required: true, valueAsNumber: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
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
export default COConfigurationPage;
