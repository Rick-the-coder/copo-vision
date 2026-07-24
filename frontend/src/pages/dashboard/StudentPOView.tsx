import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, Trophy, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const StudentPOViewPage = () => {
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(false);

  const { data: results, isLoading } = useQuery({ 
    queryKey: ['po-attainment-student', studentId, courseId], 
    queryFn: async () => {
      // For this prototype, we'll fetch all po-attainments and filter frontend
      // In production, there would be a dedicated endpoint like /api/v1/po-attainments/student/{id}
      const res = await api.get('/po-attainments');
      const filtered = res.data.filter((r: any) => 
        r.student_id === parseInt(studentId, 10) && 
        (courseId ? r.course_id === parseInt(courseId, 10) : true)
      );
      return filtered;
    },
    enabled: searchTrigger && studentId !== ''
  });

  const getLevelColor = (level: number) => {
    switch(level) {
      case 3: return 'bg-emerald-500 text-emerald-50';
      case 2: return 'bg-blue-500 text-blue-50';
      case 1: return 'bg-amber-500 text-amber-50';
      default: return 'bg-slate-300 text-slate-700';
    }
  };

  const getProgressBarColor = (level: number) => {
    switch(level) {
      case 3: return 'bg-emerald-500';
      case 2: return 'bg-blue-500';
      case 1: return 'bg-amber-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Student PO Attainment</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-slate-700">Student ID</label>
          <input 
            type="number" 
            value={studentId} 
            onChange={e => {setStudentId(e.target.value); setSearchTrigger(false);}} 
            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary bg-slate-50" 
            placeholder="e.g. 1" 
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-slate-700">Course ID (Optional)</label>
          <input 
            type="number" 
            value={courseId} 
            onChange={e => {setCourseId(e.target.value); setSearchTrigger(false);}} 
            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary bg-slate-50" 
            placeholder="e.g. 1" 
          />
        </div>
        <button 
          onClick={() => setSearchTrigger(true)}
          disabled={!studentId}
          className="bg-primary text-white px-6 py-2 h-[42px] rounded-lg flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
        >
          <Search className="w-4 h-4" /> Fetch Results
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : searchTrigger && results ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {results.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-xl border text-center text-slate-500">
              No Program Outcome results found for Student {studentId}. Ensure the Calculation Engine has been run.
            </div>
          ) : (
            results.map((r: any) => (
              <div key={r.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-slate-800 text-lg">
                      {r.po_id ? `PO ${r.po_id}` : `PSO ${r.pso_id}`}
                    </h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getLevelColor(r.attainment_level)}`}>
                    Level {r.attainment_level}
                  </span>
                </div>
                
                <div className="mt-auto space-y-3">
                  <div className="flex justify-between text-sm text-slate-600 font-medium">
                    <span>Achieved</span>
                    <span>{r.achieved_percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getProgressBarColor(r.attainment_level)}`} 
                      style={{ width: `${Math.min(r.achieved_percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-400 text-right">
                    Course ID: {r.course_id}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
};
export default StudentPOViewPage;
