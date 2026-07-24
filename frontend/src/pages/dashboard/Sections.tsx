import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

interface Section {
  id: number;
  section_name: string;
  batch_id: number;
  semester_id: number;
  mentor_faculty_id: number;
  status: boolean;
}

const SectionsPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Section | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset } = useForm<any>();

  const { data: items, isLoading } = useQuery({ queryKey: ['sections'], queryFn: async () => (await api.get('/sections')).data as Section[] });

  const createMutation = useMutation({
    mutationFn: (newItem: any) => api.post('/sections', newItem),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sections'] }); closeModal(); }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, item: any }) => api.put(`/sections/${data.id}`, data.item),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sections'] }); closeModal(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/sections/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sections'] }); }
  });

  const openModal = (item: Section | null = null) => {
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
        <h2 className="text-2xl font-bold text-slate-800">Sections</h2>
        <button onClick={() => openModal()} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Section
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
                <th className="p-4">Name</th>
                <th className="p-4">Batch ID</th>
                <th className="p-4">Semester ID</th>
                <th className="p-4">Mentor ID</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr> :
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-4">{item.section_name}</td>
                    <td className="p-4">{item.batch_id}</td>
                    <td className="p-4">{item.semester_id}</td>
                    <td className="p-4">{item.mentor_faculty_id || '-'}</td>
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
            <h3 className="text-lg font-semibold mb-4">{editingItem ? 'Edit' : 'Add'} Section</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div><label className="block text-sm mb-1">Name</label><input {...register('section_name', {required: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm mb-1">Batch ID</label><input type="number" {...register('batch_id', {required: true, valueAsNumber: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm mb-1">Semester ID</label><input type="number" {...register('semester_id', {valueAsNumber: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm mb-1">Mentor Faculty ID</label><input type="number" {...register('mentor_faculty_id', {valueAsNumber: true})} className="w-full px-3 py-2 border rounded-lg" /></div>
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
export default SectionsPage;
