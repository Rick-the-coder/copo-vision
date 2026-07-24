import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Target, Loader2, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import api from '../../../services/api';

const PredictionDashboardPage = () => {
  const [studentId, setStudentId] = useState('');
  const [targetType, setTargetType] = useState('CO');
  const [targetId, setTargetId] = useState('1');
  
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
        student_id: parseInt(studentId, 10),
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
      case 'Critical Risk': return 'bg-red-100 text-red-800 border-red-200';
      case 'High Risk': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium Risk': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    if (risk.includes('Risk') && risk !== 'Low Risk') return <AlertTriangle className="w-8 h-8" />;
    return <ShieldCheck className="w-8 h-8" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2 mb-10">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">AI Early Warning System</h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Predict a student's final Course or Program Outcome attainment based on their current mid-semester trajectory.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" /> Prediction Parameters
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-500">Student ID</label>
              <input type="number" value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-500">Predict Target</label>
              <select value={targetType} onChange={e => setTargetType(e.target.value)} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary">
                <option value="CO">Course Outcome (CO)</option>
                <option value="PO">Program Outcome (PO)</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h4 className="text-sm font-semibold text-slate-700">Live Feature Inputs</h4>
            {Object.keys(liveMarks).map(key => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm text-slate-600">{key}</label>
                <input 
                  type="number" 
                  value={(liveMarks as any)[key]} 
                  onChange={e => setLiveMarks({...liveMarks, [key]: parseFloat(e.target.value) || 0})}
                  className="w-24 border rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-primary text-right"
                />
              </div>
            ))}
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

          <button 
            onClick={() => predictMutation.mutate()}
            disabled={predictMutation.isPending || !studentId}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
          >
            {predictMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
            Generate AI Prediction
          </button>
        </div>

        {/* Results Panel */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center min-h-[300px]">
          {!result ? (
            <div className="text-center text-slate-400">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Enter student details and click generate to view prediction analysis.</p>
            </div>
          ) : (
            <div className={`w-full p-8 rounded-xl border-2 text-center space-y-6 ${getRiskStyles(result.risk_level)}`}>
              <div className="flex justify-center">
                {getRiskIcon(result.risk_level)}
              </div>
              
              <div>
                <h4 className="font-bold text-xl mb-1">{result.risk_level}</h4>
                <p className="text-sm opacity-80">Based on trajectory analysis</p>
              </div>

              <div className="bg-white/50 rounded-lg p-6">
                <div className="text-5xl font-black mb-2">{result.predicted_percentage}%</div>
                <div className="font-semibold text-sm">Predicted Final Attainment</div>
              </div>

              <div className="flex justify-between items-center text-sm font-medium border-t border-black/10 pt-4">
                <span>Model Confidence</span>
                <span>{result.confidence_score}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default PredictionDashboardPage;
