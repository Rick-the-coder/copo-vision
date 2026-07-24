import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, Clock } from 'lucide-react';
import api from '../../services/api';

interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  timestamp: string;
}

const AuditLogsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: items, isLoading } = useQuery({ queryKey: ['audit-logs'], queryFn: async () => (await api.get('/audit-logs')).data as AuditLog[] });
  const filteredItems = items?.filter(i => JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Audit Logs</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 relative">
          <Search className="w-5 h-5 absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search logs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full max-w-md pl-10 pr-4 py-2 rounded-lg border outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-sm uppercase tracking-wider text-slate-600">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">User ID</th>
                <th className="p-4">Action</th>
                <th className="p-4">Entity Type</th>
                <th className="p-4">Entity ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr> :
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-700 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400"/> {new Date(item.timestamp).toLocaleString()}</td>
                    <td className="p-4">{item.user_id}</td>
                    <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                            ${item.action === 'CREATE' ? 'bg-green-100 text-green-700' : 
                              item.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' : 
                              item.action === 'DELETE' ? 'bg-red-100 text-red-700' : 
                              'bg-slate-100 text-slate-700'}`
                            }>
                            {item.action}
                        </span>
                    </td>
                    <td className="p-4">{item.entity_type}</td>
                    <td className="p-4">{item.entity_id || '-'}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AuditLogsPage;
