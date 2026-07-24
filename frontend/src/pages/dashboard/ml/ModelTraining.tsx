import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BrainCircuit, Loader2, Trophy, BarChart3, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';

const ModelTrainingPage = () => {
  const queryClient = useQueryClient();
  const [selectedDataset, setSelectedDataset] = useState('');
  const [targetType, setTargetType] = useState('CO');
  const [targetColumn, setTargetColumn] = useState('CO_Attainment');
  const [error, setError] = useState<string | null>(null);

  const { data: datasets } = useQuery({ queryKey: ['ml-datasets'], queryFn: async () => (await api.get('/ml/datasets')).data });
  const { data: models, isLoading: isLoadingModels } = useQuery({ queryKey: ['ml-models'], queryFn: async () => (await api.get('/ml/models')).data });

  const trainMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDataset) throw new Error("Please select a dataset.");
      return (await api.post('/ml/train', {
        dataset_id: parseInt(selectedDataset, 10),
        target_column: targetColumn,
        target_type: targetType
      })).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ml-models'] });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || err.message || 'Training failed');
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Model Training & Selection" 
        description="Configure target variables and orchestrate algorithm training pipelines."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'AI & Predictions' },
          { label: 'Model Training' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Training Control Panel */}
        <div className="lg:col-span-1">
          <Card noPadding>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-primary" /> Training Orchestrator</CardTitle>
            </CardHeader>
            <div className="p-6 space-y-4">
              
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Select Dataset</label>
                <select 
                  value={selectedDataset} 
                  onChange={e => setSelectedDataset(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white shadow-sm"
                >
                  <option value="">-- Choose Dataset --</option>
                  {datasets?.map((ds: any) => (
                    <option key={ds.id} value={ds.id}>{ds.version_name} ({ds.record_count} records)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Predict Target Type</label>
                <select 
                  value={targetType} 
                  onChange={e => setTargetType(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white shadow-sm"
                >
                  <option value="CO">Course Outcome (CO)</option>
                  <option value="PO">Program Outcome (PO)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Target Column Name in CSV</label>
                <input 
                  type="text" 
                  value={targetColumn} 
                  onChange={e => setTargetColumn(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white shadow-sm"
                  placeholder="e.g. CO_Attainment"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-sm text-red-600 mt-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                </div>
              )}

              <Button 
                onClick={() => trainMutation.mutate()}
                disabled={trainMutation.isPending || !selectedDataset}
                className="w-full mt-4"
                icon={trainMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
              >
                {trainMutation.isPending ? 'Training Pipeline Running...' : 'Start Training'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Model Leaderboard */}
        <div className="lg:col-span-2">
          <Card noPadding>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-slate-500" /> Active Models Leaderboard
              </CardTitle>
            </CardHeader>
            
            {isLoadingModels ? (
              <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : models?.length === 0 ? (
              <EmptyState 
                title="No models deployed"
                description="Select a dataset and run the training pipeline to generate AI models."
                icon={<Trophy className="w-10 h-10 text-slate-300" />}
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {models?.map((m: any) => (
                  <div key={m.id} className={`p-5 transition-colors ${m.is_active ? 'bg-white' : 'bg-slate-50 opacity-75'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900">{m.algorithm}</h4>
                          {m.is_active && <span className="px-2 py-0.5 bg-blue-50 text-primary border border-blue-200 rounded text-[10px] font-bold tracking-wider">ACTIVE</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Target: <span className="font-medium text-slate-700">{m.target_type} Predictor</span> • Trained: {new Date(m.created_at).toLocaleString()}</p>
                      </div>
                      
                      <div className="flex gap-6 text-right">
                        <div>
                          <div className="text-xl font-bold text-slate-900">{m.accuracy.toFixed(1)}%</div>
                          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Accuracy</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-slate-900">{m.r2_score.toFixed(3)}</div>
                          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">R² Score</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" /> Top Feature Drivers
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {m.top_features.map((f: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[11px] font-medium border border-slate-200">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModelTrainingPage;
