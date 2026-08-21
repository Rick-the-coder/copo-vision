import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calculator, Loader2, CheckCircle2, AlertCircle, DatabaseZap } from 'lucide-react';
import api from '../../services/api';

const CalculatePOPage = () => {
  const [courseId, setCourseId] = useState<number | ''>('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: courses, isLoading: isCoursesLoading } = useQuery({ 
    queryKey: ['courses'], 
    queryFn: async () => (await api.get('/courses')).data 
  });

  const calculateMutation = useMutation({
    mutationFn: async (id: number) => {
      return (await api.post('/co-engine/calculate', { course_id: id })).data;
    },
    onSuccess: (data) => {
      setResult(data);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || err.message || 'An error occurred during calculation.');
      setResult(null);
    }
  });

  const handleCalculate = () => {
    if (courseId) {
      calculateMutation.mutate(courseId);
    } else {
      setError('Please select a Course first.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-4">
      <div className="text-center space-y-3 mb-10">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
          <DatabaseZap className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">PO Attainment Engine</h2>
        <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
          Execute the NBA Program Outcome Calculation Engine. This process will read all CO Attainments, map them through the Correlation Matrix, and calculate final PO percentages.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="space-y-5">
              <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">Select Target Course *</label>
                  {isCoursesLoading ? (
                    <div className="w-full border border-slate-300 rounded-xl px-4 py-3.5 flex items-center text-slate-500 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading courses...
                    </div>
                  ) : (
                    <select 
                      value={courseId} 
                      onChange={e => setCourseId(e.target.value === '' ? '' : parseInt(e.target.value))} 
                      className="w-full border border-slate-300 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all text-sm font-medium"
                    >
                      <option value="">-- Choose a Course to Compute --</option>
                      {courses?.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>
                      ))}
                    </select>
                  )}
                  <p className="text-xs text-slate-500 mt-2.5 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                    The engine calculates: PO = Σ(CO Attainment × Correlation Weight) / Σ(Correlation Weight)
                  </p>
              </div>

              <div className="pt-5 border-t border-slate-100">
                <button 
                  onClick={handleCalculate} 
                  disabled={calculateMutation.isPending || !courseId}
                  className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-60 disabled:shadow-none hover:shadow-md"
                >
                  {calculateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
                  {calculateMutation.isPending ? 'Crunching Numbers...' : 'Run Calculation Engine'}
                </button>
              </div>
          </div>
        </div>

        {/* Results Panel */}
        {(result || error) && (
          <div className={`p-8 border-t ${error ? 'bg-red-50/50 border-red-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
            {error ? (
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-full shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h4 className="text-red-800 font-semibold text-lg tracking-tight">Calculation Failed</h4>
                  <p className="text-red-600/90 mt-1.5 leading-relaxed text-sm">{error}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-100 rounded-full shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="w-full">
                  <h4 className="text-emerald-800 font-semibold text-lg tracking-tight">Engine Executed Successfully</h4>
                  <p className="text-emerald-700 mt-1.5 text-sm">Processed <span className="font-bold text-emerald-900">{result.records_processed || 0}</span> attainment records.</p>
                  
                  <div className="mt-5 p-5 bg-white rounded-xl border border-emerald-200/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-emerald-600/80 mb-1">Execution Batch ID</p>
                      <p className="text-emerald-900 font-mono font-medium">{result.batch_id || `BATCH-${Date.now().toString().slice(-6)}`}</p>
                    </div>
                    <div className="h-10 w-px bg-emerald-100 hidden sm:block"></div>
                    <div>
                       <p className="text-sm text-emerald-700">The calculated percentages have been securely stored and saved to the audit ledger.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default CalculatePOPage;
