import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

const CsvImportPage = () => {
  const [selectedEntity, setSelectedEntity] = useState('students');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const entities = [
    { value: 'students', label: 'Students' },
    { value: 'faculty', label: 'Faculty' },
    { value: 'courses', label: 'Courses' },
    { value: 'programs', label: 'Programs' },
    { value: 'subjects', label: 'Subjects' },
  ];

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/imports/${selectedEntity}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult({ type: 'success', data: response.data.summary });
    } catch (error: any) {
      setResult({ type: 'error', message: error.response?.data?.detail || 'Upload failed' });
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Bulk CSV Import</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Entity to Import</label>
            <select 
              value={selectedEntity} 
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              {entities.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
            <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <input 
              type="file" 
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden" 
              id="file-upload" 
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-primary font-medium hover:text-primary-dark">Click to upload</span>
              <span className="text-slate-500"> or drag and drop</span>
              <p className="text-xs text-slate-400 mt-2">CSV files only</p>
            </label>
            {file && <p className="mt-4 text-sm font-medium text-slate-700">Selected: {file.name}</p>}
          </div>

          <button 
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {isUploading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isUploading ? 'Importing...' : 'Start Import'}
          </button>
        </div>
      </div>

      {result && result.type === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 max-w-2xl">
          <div className="flex items-center gap-3 text-green-700 mb-4">
            <CheckCircle2 className="w-6 h-6" />
            <h3 className="font-semibold text-lg">Import Completed</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div className="bg-white p-3 rounded-lg border border-green-100 shadow-sm"><div className="text-2xl font-bold text-slate-800">{result.data.total_processed}</div><div className="text-xs text-slate-500 uppercase">Processed</div></div>
            <div className="bg-white p-3 rounded-lg border border-green-100 shadow-sm"><div className="text-2xl font-bold text-green-600">{result.data.success}</div><div className="text-xs text-slate-500 uppercase">Success</div></div>
            <div className="bg-white p-3 rounded-lg border border-green-100 shadow-sm"><div className="text-2xl font-bold text-red-500">{result.data.failed}</div><div className="text-xs text-slate-500 uppercase">Failed</div></div>
          </div>
          {result.data.errors.length > 0 && (
            <div className="mt-4 bg-white rounded-lg border border-red-100 p-4 max-h-48 overflow-y-auto">
              <h4 className="text-sm font-semibold text-red-800 mb-2">Error Log</h4>
              <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
                {result.data.errors.map((err: string, i: number) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {result && result.type === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-2xl flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-800">Import Error</h3>
            <p className="text-sm text-red-600 mt-1">{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};
export default CsvImportPage;
