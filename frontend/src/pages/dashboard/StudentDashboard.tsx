import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  GraduationCap, BookOpen, Award, CheckCircle2, 
  Sparkles, Calendar, TrendingUp, AlertCircle, ArrowUpRight 
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const StudentDashboard = ({ user }: { user: User }) => {
  const { data: coAttainments } = useQuery({
    queryKey: ['co-attainments'],
    queryFn: async () => (await api.get('/co-attainments')).data
  });

  const studentRadar = [
    { subject: 'CO1 Theory', A: 84, fullMark: 100 },
    { subject: 'CO2 Analysis', A: 78, fullMark: 100 },
    { subject: 'CO3 Design', A: 72, fullMark: 100 },
    { subject: 'CO4 Implementation', A: 88, fullMark: 100 },
    { subject: 'CO5 Problem Solving', A: 80, fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-200 mb-3 border border-white/15">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Student Learning &amp; Outcome Portfolio
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Hello, {user?.name || 'Aarav Mehta'}
            </h1>
            <p className="text-emerald-200/90 text-sm mt-1 max-w-xl">
              B.Tech Computer Science &amp; Engineering | Roll No: <strong>2023CSE001</strong> • Semester 5
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              to="/dashboard/student-co-view"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4" /> My CO Attainment
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overall Attainment</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">78.5%</h3>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">
              🌟 Level 3 Attainment
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Lecture Attendance</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">89.2%</h3>
            <span className="text-xs font-medium text-emerald-600 mt-1 inline-block">Above 75% Requirement</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Enrolled Subjects</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">6 Courses</h3>
            <span className="text-xs font-medium text-slate-500 mt-1 inline-block">24 Total Credits</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Next Evaluation</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">Oct 15</h3>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mt-1 inline-block">
              IA-2: Database Systems
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: CO Radar Visual & Performance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Radar Chart */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">My Outcome Mastery Radar</h2>
            <p className="text-xs text-slate-500 mt-0.5">Competency breakdown across Course Outcomes</p>
          </div>

          <div className="w-full h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={studentRadar}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Radar name="My Score (%)" dataKey="A" stroke="#059669" fill="#059669" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Highest competency recorded in <strong>CO4: Practical Implementation</strong>.</span>
          </div>
        </div>

        {/* Right: Subject Scores Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800">My Registered Courses &amp; Internal Marks</h2>
              <p className="text-xs text-slate-500 mt-0.5">Current semester marks and outcome achievement</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500">
                  <th className="pb-3">Subject</th>
                  <th className="pb-3 text-center">CAE-1 (30)</th>
                  <th className="pb-3 text-center">Assignment (20)</th>
                  <th className="pb-3 text-center">Attainment</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {[
                  { code: 'CS501', name: 'Database Management Systems', cae1: '26', asg: '18', att: '82%', status: 'Target Met' },
                  { code: 'CS502', name: 'Operating Systems', cae1: '24', asg: '17', att: '78%', status: 'Target Met' },
                  { code: 'CS503', name: 'Computer Networks', cae1: '28', asg: '19', att: '88%', status: 'Exemplary' },
                  { code: 'CS504', name: 'Design & Analysis of Algorithms', cae1: '21', asg: '15', att: '70%', status: 'Target Met' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3">
                      <p className="font-semibold text-slate-800">{row.code}</p>
                      <p className="text-xs text-slate-500">{row.name}</p>
                    </td>
                    <td className="py-3 text-center font-medium text-slate-700">{row.cae1}</td>
                    <td className="py-3 text-center font-medium text-slate-700">{row.asg}</td>
                    <td className="py-3 text-center font-bold text-emerald-600">{row.att}</td>
                    <td className="py-3 text-right">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* AI Learning & Remedial Recommendation Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">AI Learning Guidance &amp; Remedial Recommendation</h3>
            <p className="text-xs text-slate-500">Personalized study feedback based on your recent assessments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100/80">
            <h5 className="text-sm font-bold text-purple-900 mb-1">Strengths</h5>
            <p className="text-xs text-purple-800 leading-relaxed">
              Excellent grasp in <strong>Computer Networks (Routing Algorithms)</strong> and <strong>Database Relational Algebra</strong>. Keep participating in coding challenges!
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100/80">
            <h5 className="text-sm font-bold text-amber-900 mb-1">Recommended Focus Areas</h5>
            <p className="text-xs text-amber-800 leading-relaxed">
              Review <strong>Dynamic Programming in DAA (CS504)</strong> before upcoming Midterm. Tutorial practice session available with Prof. Amit Verma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
