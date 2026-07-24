import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calculator, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const CalculatePOPage = () => {
  const [courseId, setCourseId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
    const parsedId = parseInt(courseId, 10);
    if (!isNaN(parsedId) && parsedId > 0) {
      calculateMutation.mutate(parsedId);
    } else {
      setError('Please enter a valid numeric Course ID.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2 mb-10">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calculator className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">PO Attainment Engine</h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Execute the NBA Program Outcome Calculation Engine. This process will read all CO Attainments, map them through the Correlation Matrix, and calculate final PO percentages.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700">Course ID</label>
                  <input 
                    type="number" 
                    value={courseId} 
                    onChange={e => setCourseId(e.target.value)} 
                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary bg-slate-50" 
                    placeholder="Enter Course ID to compute POs for" 
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    The engine calculates: PO = Σ(CO Attainment * Correlation Weight) / Σ(Correlation Weight)
                  </p>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleCalculate} 
                  disabled={calculateMutation.isPending || !courseId}
                  className="w-full py-3 bg-primary text-white rounded-lg font-medium shadow-sm shadow-primary/30 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {calculateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
                  {calculateMutation.isPending ? 'Crunching Numbers...' : 'Run Calculation Engine'}
                </button>
              </div>
          </div>
        </div>

        {/* Results Panel */}
        {(result || error) && (
          <div className={`p-8 border-t ${error ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
            {error ? (
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-800 font-medium text-lg">Calculation Failed</h4>
                  <p className="text-red-600 mt-1">{error}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-emerald-800 font-medium text-lg">Engine Executed Successfully</h4>
                  <p className="text-emerald-700 mt-1">Processed {result.records_processed} attainment records.</p>
                  <div className="mt-4 p-4 bg-white/60 rounded-lg border border-emerald-200/50">
                    <p className="text-sm text-emerald-800 font-mono">Batch ID: {result.batch_id}</p>
                    <p className="text-sm text-emerald-800 mt-2">The calculated percentages have been securely stored and saved to the audit ledger.</p>
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
