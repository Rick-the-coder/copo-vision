import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UploadCloud, FileSpreadsheet, Loader2, Database, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';

const DatasetManagementPage = () => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [versionName, setVersionName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: datasets, isLoading } = useQuery({ 
    queryKey: ['ml-datasets'], 
    queryFn: async () => (await api.get('/ml/datasets')).data 
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !versionName) throw new Error("File and Version Name are required");
      const formData = new FormData();
      formData.append('file', file);
      formData.append('version_name', versionName);
      return (await api.post('/ml/dataset/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ml-datasets'] });
      setFile(null);
      setVersionName('');
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || err.message || 'Upload failed');
    }
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    uploadMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="ML Dataset Management" 
        description="Upload and preprocess historical datasets to train the AI prediction engine."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'AI & Predictions' },
          { label: 'Datasets' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <Card noPadding>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UploadCloud className="w-4 h-4 text-primary" /> Upload CSV</CardTitle>
            </CardHeader>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Version Name</label>
                <input 
                  type="text" 
                  value={versionName}
                  onChange={e => setVersionName(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white shadow-sm transition-all" 
                  placeholder="e.g. 2026-Batch-V1" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">CSV File</label>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white shadow-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-all" 
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button 
                type="submit"
                disabled={uploadMutation.isPending || !file || !versionName}
                className="w-full mt-4"
                icon={uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              >
                {uploadMutation.isPending ? 'Processing Dataset...' : 'Upload & Preprocess'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Datasets List */}
        <div className="lg:col-span-2">
          <Card noPadding>
            <CardHeader>
              <CardTitle>Available Datasets</CardTitle>
            </CardHeader>
            
            {isLoading ? (
              <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : datasets?.length === 0 ? (
              <EmptyState 
                title="No datasets uploaded"
                description="Upload your first CSV dataset containing historical marks to start training models."
                icon={<FileSpreadsheet className="w-10 h-10 text-slate-300" />}
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {datasets?.map((ds: any) => (
                  <div key={ds.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">{ds.version_name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Records: <span className="font-medium text-slate-700">{ds.record_count}</span> • 
                          Uploaded: {new Date(ds.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 truncate max-w-sm">
                          Features: {ds.features_list}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-[11px] font-semibold">Ready</span>
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

export default DatasetManagementPage;
