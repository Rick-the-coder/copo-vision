import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import api from '../../services/api';

const CalculationHistoryPage = () => {
  const { data: items, isLoading } = useQuery({ queryKey: ['co-attainment-history'], queryFn: async () => (await api.get('/co-attainment-history')).data });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Calculation History</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-sm uppercase tracking-wider text-slate-600">
              <tr>
                <th className="p-4">Attainment ID</th>
                <th className="p-4">Previous %</th>
                <th className="p-4">New %</th>
                <th className="p-4">Calculated On</th>
                <th className="p-4">Calculated By (User ID)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr> :
                (items || []).map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-blue-600">{item.co_attainment_id}</td>
                    <td className="p-4 text-slate-500">{item.previous_percentage !== null ? item.previous_percentage + '%' : 'N/A'}</td>
                    <td className="p-4 font-bold text-green-600">{item.new_percentage}%</td>
                    <td className="p-4">{new Date(item.calculated_on).toLocaleString()}</td>
                    <td className="p-4">{item.calculated_by}</td>
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
export default CalculationHistoryPage;
