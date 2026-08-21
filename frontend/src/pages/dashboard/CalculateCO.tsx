import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Loader2, PlayCircle, CheckCircle2, Calculator, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const CalculateCOPage = () => {
  const [assessmentId, setAssessmentId] = useState<number | ''>('');
  const [calcStatus, setCalcStatus] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  
  const { data: assessments, isLoading: isAssessmentsLoading } = useQuery({ 
    queryKey: ['assessments'], 
    queryFn: async () => (await api.get('/assessments')).data 
  });

  const calculate = async (isRecalculate: boolean) => {
      if (!assessmentId) return;
      try {
          setCalcStatus('calculating');
          setMetrics(null);
          const endpoint = isRecalculate ? '/co-engine/recalculate' : '/co-engine/calculate';
          const res = await api.post(endpoint, {
              assessment_id: assessmentId,
          });
          setMetrics(res.data);
          setCalcStatus('success');
      } catch (err: any) {
          alert(err.response?.data?.detail || "Calculation failed");
          setCalcStatus(null);
      }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Calculate CO Attainment</h2>
          <p className="text-slate-500 text-sm mt-1">Execute the outcome calculation engine for assessments</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Execution Engine</h3>
            </div>
            <p className="text-sm text-slate-500 ml-13">The engine will process student marks, map them to questions, map questions to Course Outcomes (COs), and compute final attainment levels.</p>
          </div>
          
          <div className="p-6 space-y-6">
              <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700">Select Assessment to Process *</label>
                  {isAssessmentsLoading ? (
                    <div className="w-full border border-slate-300 rounded-lg px-4 py-3 flex items-center text-slate-500 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading assessments...
                    </div>
                  ) : (
                    <select 
                      value={assessmentId} 
                      onChange={e => setAssessmentId(e.target.value === '' ? '' : parseInt(e.target.value))} 
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all text-sm"
                    >
                      <option value="">-- Choose an Assessment --</option>
                      {assessments?.map((a: any) => (
                        <option key={a.id} value={a.id}>{a.assessment_name} (Max Marks: {a.maximum_marks})</option>
                      ))}
                    </select>
                  )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => calculate(false)} 
                    disabled={calcStatus === 'calculating' || !assessmentId} 
                    className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-70"
                  >
                      {calcStatus === 'calculating' ? <Loader2 className="w-5 h-5 animate-spin"/> : <PlayCircle className="w-5 h-5"/>}
                      Calculate New Attainment
                  </button>
                  <button 
                    onClick={() => calculate(true)} 
                    disabled={calcStatus === 'calculating' || !assessmentId} 
                    className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 px-6 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-50 hover:text-primary hover:border-primary/50 transition-colors shadow-sm disabled:opacity-70"
                  >
                      <RefreshCw className="w-4 h-4" />
                      Force Recalculate
                  </button>
              </div>
          </div>

          {calcStatus === 'success' && metrics && (
              <div className="p-6 bg-slate-50 border-t border-slate-100">
                  <div className="bg-white border border-green-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-green-50/80 p-4 border-b border-green-100 flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        <div>
                          <h4 className="text-green-800 font-bold">Calculation Completed Successfully</h4>
                          <p className="text-green-600/80 text-xs font-medium mt-0.5">Execution finished without errors</p>
                        </div>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Records Processed</p>
                            <p className="text-3xl font-bold text-slate-800">{metrics.calculated_records}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                              Success
                            </span>
                        </div>
                    </div>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};
export default CalculateCOPage;
