import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

interface Program {
  id: number;
  program_name: string;
  program_code: string;
  department_id: number;
  duration: number;
  degree_type: string;
  status: boolean;
}

const ProgramsPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Program | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset } = useForm<any>();

  const { data: items, isLoading } = useQuery({ queryKey: ['programs'], queryFn: async () => (await api.get('/programs')).data as Program[] });

  const createMutation = useMutation({
    mutationFn: (newItem: any) => api.post('/programs', newItem),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['programs'] }); closeModal(); }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, item: any }) => api.put(`/programs/${data.id}`, data.item),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['programs'] }); closeModal(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/programs/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['programs'] }); }
  });

  const openModal = (item: Program | null = null) => {
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
        <h2 className="text-2xl font-bold text-slate-800">Programs</h2>
        <button onClick={() => openModal()} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Program
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 relative">
          <Search className="w-5 h-5 absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full max-w-md pl-10 pr-4 py-2 rounded-lg border outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-sm uppercase tracking-wider text-slate-600">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Name</th>
                <th className="p-4">Dept ID</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Degree</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr> :
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-4">{item.program_code}</td>
                    <td className="p-4">{item.program_name}</td>
                    <td className="p-4">{item.department_id}</td>
                    <td className="p-4">{item.duration}</td>
                    <td className="p-4">{item.degree_type}</td>
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
            <h3 className="text-lg font-semibold mb-4">{editingItem ? 'Edit' : 'Add'} Program</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div><label className="block text-sm mb-1">Code</label><input {...register('program_code', {required: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm mb-1">Name</label><input {...register('program_name', {required: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm mb-1">Department ID</label><input type="number" {...register('department_id', {required: true, valueAsNumber: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm mb-1">Duration (Yrs)</label><input type="number" {...register('duration', {required: true, valueAsNumber: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm mb-1">Degree Type</label><input {...register('degree_type', {required: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
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
export default ProgramsPage;
