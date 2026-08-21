import React, { useState } from 'react';
import { Download, FileText, Filter, Loader2, FileSpreadsheet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('co_attainment');
  const [format, setFormat] = useState('csv');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: courses } = useQuery({ 
    queryKey: ['courses'], 
    queryFn: async () => (await api.get('/courses')).data 
  });
  const [selectedCourse, setSelectedCourse] = useState('');

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Successfully generated ${reportType} report in ${format.toUpperCase()} format.`);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Standard Reports</h2>
        <p className="text-slate-500 mt-1">Generate and export official NBA compliance reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Report Types
            </div>
            <div className="p-2 flex flex-col gap-1">
              <button 
                onClick={() => setReportType('co_attainment')}
                className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${reportType === 'co_attainment' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                CO Attainment Report
              </button>
              <button 
                onClick={() => setReportType('po_attainment')}
                className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${reportType === 'po_attainment' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                PO/PSO Attainment Report
              </button>
              <button 
                onClick={() => setReportType('student_risk')}
                className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${reportType === 'student_risk' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Student Risk Analysis
              </button>
              <button 
                onClick={() => setReportType('nba_sar')}
                className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${reportType === 'nba_sar' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                NBA SAR Criteria 3
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-4">Report Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" /> Filter by Course
                </label>
                <select 
                  value={selectedCourse} 
                  onChange={e => setSelectedCourse(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
                >
                  <option value="">All Courses</option>
                  {courses?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Export Format</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${format === 'csv' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                    <input type="radio" name="format" value="csv" checked={format === 'csv'} onChange={() => setFormat('csv')} className="hidden" />
                    <FileSpreadsheet className="w-4 h-4" /> CSV Excel
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${format === 'pdf' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                    <input type="radio" name="format" value="pdf" checked={format === 'pdf'} onChange={() => setFormat('pdf')} className="hidden" />
                    <FileText className="w-4 h-4" /> PDF Document
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors shadow-sm min-w-[200px]"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReportsPage;
