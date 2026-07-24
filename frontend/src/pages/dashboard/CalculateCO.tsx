import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Loader2, PlayCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const CalculateCOPage = () => {
  const [assessmentId, setAssessmentId] = useState('');
  const [calcStatus, setCalcStatus] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);

  const calculate = async (isRecalculate: boolean) => {
      try {
          setCalcStatus('calculating');
          const endpoint = isRecalculate ? '/co-engine/recalculate' : '/co-engine/calculate';
          const res = await api.post(endpoint, {
              assessment_id: parseInt(assessmentId),
          });
          setMetrics(res.data);
          setCalcStatus('success');
      } catch (err: any) {
          alert(err.response?.data?.detail || "Calculation failed");
          setCalcStatus(null);
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Calculate CO Attainment</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-2xl">
          <h3 className="text-lg font-semibold mb-6 border-b pb-4">Execution Hub</h3>
          
          <div className="space-y-6">
              <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700">Assessment ID</label>
                  <input type="number" value={assessmentId} onChange={e => setAssessmentId(e.target.value)} className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary bg-slate-50" placeholder="Enter Assessment ID to compute COs for" />
                  <p className="text-xs text-slate-500 mt-2">The engine will calculate Question {'->'} CO {'->'} Percentage {'->'} Level based on Student Marks for this assessment.</p>
              </div>

              <div className="flex gap-4 pt-4">
                  <button onClick={() => calculate(false)} disabled={calcStatus === 'calculating' || !assessmentId} className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
                      {calcStatus === 'calculating' ? <Loader2 className="w-5 h-5 animate-spin"/> : <PlayCircle className="w-5 h-5"/>}
                      Calculate Attainment
                  </button>
                  <button onClick={() => calculate(true)} disabled={calcStatus === 'calculating' || !assessmentId} className="flex-1 bg-white border border-primary text-primary py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
                      Recalculate
                  </button>
              </div>
          </div>

          {calcStatus === 'success' && metrics && (
              <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3 text-green-700 font-bold text-lg mb-4">
                      <CheckCircle2 className="w-6 h-6" />
                      Calculation Successful
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded shadow-sm border border-green-100">
                          <p className="text-sm text-slate-500">Records Calculated</p>
                          <p className="text-2xl font-bold text-slate-800">{metrics.calculated_records}</p>
                      </div>
                      <div className="bg-white p-4 rounded shadow-sm border border-green-100">
                          <p className="text-sm text-slate-500">Status</p>
                          <p className="text-2xl font-bold text-green-600">Success</p>
                      </div>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};
export default CalculateCOPage;
