import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, Award } from 'lucide-react';
import api from '../../services/api';

const StudentCOViewPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: items, isLoading } = useQuery({ queryKey: ['co-attainments'], queryFn: async () => (await api.get('/co-attainments')).data });

  const filteredItems = items?.filter((i: any) => JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Student CO Results</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 relative">
          <Search className="w-5 h-5 absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by Student ID, Course, CO..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full max-w-md pl-10 pr-4 py-2 rounded-lg border outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-sm uppercase tracking-wider text-slate-600">
              <tr>
                <th className="p-4">Student ID</th>
                <th className="p-4">Course ID</th>
                <th className="p-4">CO ID</th>
                <th className="p-4">Assessment ID</th>
                <th className="p-4">Percentage</th>
                <th className="p-4">Attainment Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr> :
                filteredItems.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold">{item.student_id}</td>
                    <td className="p-4">{item.course_id}</td>
                    <td className="p-4 font-semibold text-blue-700">{item.co_id}</td>
                    <td className="p-4">{item.assessment_id || 'Aggregated'}</td>
                    <td className="p-4">
                        <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.attainment_percentage}%` }}></div>
                            </div>
                            <span className="text-sm font-medium">{item.attainment_percentage.toFixed(1)}%</span>
                        </div>
                    </td>
                    <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            <Award className="w-3 h-3" /> {item.attainment_level}
                        </span>
                    </td>
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
export default StudentCOViewPage;
