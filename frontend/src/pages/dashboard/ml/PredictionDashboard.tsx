import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Target, Loader2, AlertTriangle, ShieldCheck, Activity, Users, Settings2, Sparkles } from 'lucide-react';
import api from '../../../services/api';

const PredictionDashboardPage = () => {
  const [studentId, setStudentId] = useState<number | ''>('');
  const [targetType, setTargetType] = useState('CO');
  const [targetId, setTargetId] = useState('1');
  
  // Fetch students for dropdown
  const { data: students, isLoading: isStudentsLoading } = useQuery({ 
    queryKey: ['students'], 
    queryFn: async () => (await api.get('/students')).data 
  });

  // Mock live input fields. In a real system, we'd fetch the student's actual current marks
  const [liveMarks, setLiveMarks] = useState({
    'CAE1': 0,
    'CAE2': 0,
    'Assignment': 0,
    'Attendance': 0
  });

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const predictMutation = useMutation({
    mutationFn: async () => {
      return (await api.post('/ml/predict', {
        student_id: studentId,
        target_type: targetType,
        target_id: parseInt(targetId, 10),
        features: liveMarks
      })).data;
    },
    onSuccess: (data) => {
      setResult(data);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Prediction engine error');
      setResult(null);
    }
  });

  const getRiskStyles = (risk: string) => {
    switch(risk) {
      case 'Critical Risk': return 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200 text-red-900 shadow-sm shadow-red-100';
      case 'High Risk': return 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 text-orange-900 shadow-sm shadow-orange-100';
      case 'Medium Risk': return 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200 text-amber-900 shadow-sm shadow-amber-100';
      default: return 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 text-emerald-900 shadow-sm shadow-emerald-100';
    }
  };

  const getRiskIcon = (risk: string) => {
    if (risk.includes('Risk') && risk !== 'Low Risk') return <AlertTriangle className="w-10 h-10 mb-4" />;
    return <ShieldCheck className="w-10 h-10 mb-4 text-emerald-600" />;
  };
  
  const getRiskColorClass = (risk: string) => {
    if (risk === 'Critical Risk') return 'text-red-700';
    if (risk === 'High Risk') return 'text-orange-700';
    if (risk === 'Medium Risk') return 'text-amber-700';
    return 'text-emerald-700';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-3 mb-10 mt-4">
        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-transparent"></div>
          <Sparkles className="w-8 h-8 relative z-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">AI Early Warning System</h2>
        <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
          Predict a student's final Course or Program Outcome attainment based on their current mid-semester trajectory and historical data patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings2 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">Prediction Parameters</h3>
          </div>
          
          <div className="p-6 space-y-6 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" /> Student
                </label>
                {isStudentsLoading ? (
                  <div className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-500 flex items-center bg-slate-50">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...
                  </div>
                ) : (
                  <select 
                    value={studentId} 
                    onChange={e => setStudentId(e.target.value === '' ? '' : parseInt(e.target.value))} 
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-white"
                  >
                    <option value="">Select Student...</option>
                    {students?.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.enrollment_number} - {s.first_name} {s.last_name}</option>
                    ))}
                  </select>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 flex items-center gap-2">
                  <Target className="w-4 h-4 text-slate-400" /> Predict Target
                </label>
                <div className="flex gap-2">
                  <select 
                    value={targetType} 
                    onChange={e => setTargetType(e.target.value)} 
                    className="w-24 border border-slate-300 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-white font-medium"
                  >
                    <option value="CO">CO</option>
                    <option value="PO">PO</option>
                  </select>
                  <input 
                    type="number" 
                    min="1"
                    value={targetId}
                    onChange={e => setTargetId(e.target.value)}
                    placeholder="ID"
                    className="flex-1 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Current Performance Data</h4>
                  <p className="text-xs text-slate-500 mt-1">Adjust mid-semester marks to simulate different outcomes</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(liveMarks).map(key => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                    <label className="text-sm font-medium text-slate-700">{key}</label>
                    <div className="relative w-20">
                      <input 
                        type="number" 
                        value={(liveMarks as any)[key]} 
                        onChange={e => setLiveMarks({...liveMarks, [key]: parseFloat(e.target.value) || 0})}
                        className="w-full border-none bg-white rounded-lg px-3 py-1.5 shadow-sm outline-none focus:ring-2 focus:ring-primary/30 text-right font-medium text-slate-800 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-slate-100 bg-slate-50/30">
            <button 
              onClick={() => predictMutation.mutate()}
              disabled={predictMutation.isPending || studentId === ''}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:shadow-none"
            >
              {predictMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {predictMutation.isPending ? 'Analyzing Trajectory...' : 'Generate AI Prediction'}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col min-h-[400px] overflow-hidden">
          {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-400">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 border border-slate-200 shadow-sm">
                <Activity className="w-10 h-10 text-slate-300" />
              </div>
              <h4 className="text-lg font-medium text-slate-600 mb-2">Awaiting Parameters</h4>
              <p className="text-sm max-w-[250px]">Select a student and target outcome, then click generate to view the AI analysis.</p>
            </div>
          ) : (
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
              <div className={`w-full p-8 rounded-2xl border ${getRiskStyles(result.risk_level)} transition-all duration-500 animate-in fade-in slide-in-from-bottom-4`}>
                <div className={`flex justify-center ${getRiskColorClass(result.risk_level)}`}>
                  {getRiskIcon(result.risk_level)}
                </div>
                
                <div className="text-center mb-8">
                  <h4 className={`font-black text-2xl tracking-tight mb-1 ${getRiskColorClass(result.risk_level)}`}>{result.risk_level}</h4>
                  <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Based on trajectory analysis</p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40 shadow-sm text-center mb-6">
                  <div className="text-6xl font-black mb-2 tracking-tighter">{result.predicted_percentage}<span className="text-3xl opacity-50 ml-1">%</span></div>
                  <div className="font-semibold text-sm opacity-80">Predicted Final {targetType}{targetId} Attainment</div>
                </div>

                <div className="bg-white/40 rounded-lg px-5 py-4 flex justify-between items-center text-sm font-semibold border border-white/30">
                  <span className="flex items-center gap-2"><Activity className="w-4 h-4 opacity-70" /> Model Confidence</span>
                  <span className="bg-white/80 px-2.5 py-1 rounded-md">{result.confidence_score}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default PredictionDashboardPage;
