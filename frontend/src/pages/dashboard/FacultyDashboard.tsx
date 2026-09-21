import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, Users, AlertTriangle, CheckCircle2, ArrowUpRight, 
  Calendar, Award, ClipboardCheck, Sparkles, Plus, Clock 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import api from '../../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const FacultyDashboard = ({ user }: { user: User }) => {
  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => (await api.get('/subjects')).data
  });

  const { data: assessments } = useQuery({
    queryKey: ['assessments'],
    queryFn: async () => (await api.get('/assessments')).data
  });

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: async () => (await api.get('/students')).data
  });

  const mySubjects = subjects ? subjects.slice(0, 3) : [
    { id: 1, subject_code: 'CS501', subject_name: 'Database Management Systems', semester: 5, credits: 4 },
    { id: 2, subject_code: 'CS502', subject_name: 'Operating Systems', semester: 5, credits: 4 },
    { id: 3, subject_code: 'CS503', subject_name: 'Computer Networks', semester: 5, credits: 3 },
  ];

  const attainmentData = [
    { name: 'CS501 DBMS', attainment: 78, target: 70 },
    { name: 'CS502 OS', attainment: 74, target: 70 },
    { name: 'CS503 CN', attainment: 82, target: 70 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-200 mb-3 border border-white/15">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Faculty Academic Workspace
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, {user?.name || 'Prof. Amit Verma'}
            </h1>
            <p className="text-blue-200/90 text-sm mt-1 max-w-xl">
              Department of Computer Science & Engineering | Academic Session 2023-2024 (Semester 5)
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              to="/dashboard/marks-entry"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <ClipboardCheck className="w-4 h-4" /> Enter Marks
            </Link>
            <Link 
              to="/dashboard/assessments"
              className="bg-white/10 hover:bg-white/20 text-white font-medium text-sm px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Assessment
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Subjects</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{mySubjects.length}</h3>
            <span className="text-xs font-medium text-emerald-600 mt-1 inline-block">12 Total Credits</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Students Enrolled</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{students?.length || 100}</h3>
            <span className="text-xs font-medium text-slate-500 mt-1 inline-block">Across 2 Sections</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Average CO Attainment</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">78.0%</h3>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">
              ✓ Target Exceeded (&gt;70%)
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Evals</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">1 Assessment</h3>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mt-1 inline-block">
              Internal Assessment 2
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Teaching Portfolio & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: My Courses & Sections */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800">My Teaching Portfolio</h2>
              <p className="text-xs text-slate-500 mt-0.5">Assigned courses for current academic term</p>
            </div>
            <Link 
              to="/dashboard/subjects" 
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View Syllabus <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {mySubjects.map((sub: any, idx: number) => (
              <div key={sub.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100">
                    {sub.subject_code.slice(0, 2)}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{sub.subject_code} - {sub.subject_name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Semester {sub.semester || 5} • {sub.credits || 4} Credits • 60 Students
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/dashboard/marks-entry"
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Enter Marks
                  </Link>
                  <Link
                    to="/dashboard/calculate-co"
                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                  >
                    Calculate CO
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Subject Attainment Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">CO Attainment per Course</h2>
            <p className="text-xs text-slate-500 mt-0.5">Actual attainment vs 70% threshold</p>
          </div>

          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attainmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="attainment" fill="#2563eb" radius={[6, 6, 0, 0]} name="Actual Attainment (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center gap-2 text-xs text-blue-800">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>All assigned courses are currently performing above NBA benchmarks.</span>
          </div>
        </div>

      </div>

      {/* Student At-Risk Alert Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Students Requiring Remedial Attention</h3>
              <p className="text-xs text-slate-500">Predicted to fall below 60% attainment in upcoming tests</p>
            </div>
          </div>
          <Link to="/dashboard/ml-prediction" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            View AI Insights →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: 'Kavya Sharma', roll: '2023CSE015', course: 'CS501 DBMS', score: '52%', risk: 'High Risk' },
            { name: 'Rahul Verma', roll: '2023CSE042', course: 'CS502 OS', score: '58%', risk: 'Medium Risk' },
            { name: 'Neha Gupta', roll: '2023CSE078', course: 'CS501 DBMS', score: '48%', risk: 'Critical Risk' },
          ].map((st, i) => (
            <div key={i} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-sm font-bold text-slate-800">{st.name}</h5>
                  <p className="text-xs text-slate-500">{st.roll} • {st.course}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  st.risk === 'Critical Risk' ? 'bg-red-100 text-red-700' :
                  st.risk === 'High Risk' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {st.risk}
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs">
                <span className="text-slate-500">Current Score: <strong className="text-slate-800">{st.score}</strong></span>
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Schedule Doubt Session</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
