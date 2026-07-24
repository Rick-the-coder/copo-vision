import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

const ProgramOutcomesPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset } = useForm<any>();

  const { data: items, isLoading } = useQuery({ queryKey: ['program-outcomes'], queryFn: async () => (await api.get('/program-outcomes')).data });

  const createMutation = useMutation({
    mutationFn: (newItem: any) => api.post('/program-outcomes', newItem),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['program-outcomes'] }); closeModal(); }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, item: any }) => api.put(`/program-outcomes/${data.id}`, data.item),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['program-outcomes'] }); closeModal(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/program-outcomes/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['program-outcomes'] }); }
  });

  const openModal = (item: any = null) => {
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

  const filteredItems = items?.filter((i: any) => JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Program Outcomes (PO)</h2>
        <button onClick={() => openModal()} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 relative">
          <Search className="w-5 h-5 absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full max-w-md pl-10 pr-4 py-2 rounded-lg border outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-sm uppercase tracking-wider text-slate-600">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Details</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? <tr><td colSpan={3} className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr> :
                filteredItems.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold">{item.id}</td>
                    <td className="p-4 text-sm text-slate-600 truncate max-w-xs">{JSON.stringify(item)}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => openModal(item)} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => { if(window.confirm('Delete this record?')) deleteMutation.mutate(item.id) }} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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
            <h3 className="text-lg font-semibold mb-4">{editingItem ? 'Edit' : 'Add'} Program Outcomes (PO)</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              <div><label className="block text-sm mb-1 font-medium text-slate-700">Department ID</label><input type="number" {...register('department_id', {required: true, valueAsNumber: true})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
              <div><label className="block text-sm mb-1 font-medium text-slate-700">PO Number</label><input {...register('po_number', {required: true})} placeholder="e.g. PO1" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
              <div><label className="block text-sm mb-1 font-medium text-slate-700">Title</label><input {...register('po_title', {required: true})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
              <div><label className="block text-sm mb-1 font-medium text-slate-700">Description</label><textarea {...register('po_description')} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" rows={4} /></div>
        
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProgramOutcomesPage;
